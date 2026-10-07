import { z } from "zod";
import { getSessionUser } from "@/lib/auth/session";

// Document ingestion runs parsing, georisk and website analysis, so it can take minutes.
export const maxDuration = 300;

const reportSchema = z.object({
  company_name: z.string().trim().min(1),
  vat_number: z.string().trim().optional(),
  fiscal_code: z.string().trim().optional(),
  bank_id: z.string().trim().optional(),
  website_url: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

const FILE_FIELDS = ["visura_file", "xbrl_file_1", "xbrl_file_2"] as const;

function backendUrl(path: string) {
  const base = process.env.BACKEND_URL;
  if (!base) throw new Error("BACKEND_URL is not configured.");
  return `${base.replace(/\/$/, "")}${path}`;
}

function fail(step: "validation" | "create" | "documents", status: number, detail: unknown) {
  return Response.json({ error: step, detail }, { status });
}

async function readBody(response: Response) {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function POST(request: Request) {
  if (!(await getSessionUser())) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();

  // Empty inputs are omitted so the backend applies its own defaults (e.g. bank_id).
  const fields = Object.fromEntries(
    Object.keys(reportSchema.shape).flatMap((key) => {
      const value = formData.get(key);
      return typeof value === "string" && value.trim() ? [[key, value]] : [];
    }),
  );
  const parsed = reportSchema.safeParse(fields);
  if (!parsed.success) return fail("validation", 400, "company_name is required.");

  const files = FILE_FIELDS.map((name) => [name, formData.get(name)] as const);
  if (files.some(([, file]) => !(file instanceof File) || file.size === 0)) {
    return fail("validation", 400, "All three documents are required.");
  }

  const createResponse = await fetch(backendUrl("/reports"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed.data),
  });
  const created = await readBody(createResponse);
  if (!createResponse.ok || !created?.id) {
    return fail("create", createResponse.ok ? 502 : createResponse.status, created);
  }

  const documents = new FormData();
  for (const [name, file] of files) documents.append(name, file as File);
  // Optional additional documents of any format.
  for (const file of formData.getAll("files")) {
    if (file instanceof File && file.size > 0) documents.append("files", file);
  }

  const documentsResponse = await fetch(
    backendUrl(`/reports/${encodeURIComponent(created.id)}/documents`),
    { method: "POST", body: documents },
  );
  const ingested = await readBody(documentsResponse);
  if (!documentsResponse.ok) {
    return Response.json(
      { error: "documents", report_id: created.id, detail: ingested },
      { status: documentsResponse.status },
    );
  }

  return Response.json(ingested);
}
