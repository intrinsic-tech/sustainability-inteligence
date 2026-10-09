"use server";

import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { z } from "zod";
import type { SessionUser } from "@/lib/auth/access-token";
import type { Permission } from "@/lib/auth/permissions";
import { createSession } from "@/lib/auth/session";
import { createServerSupabase } from "@/lib/supabase-server";

export type AuthErrorCode =
  | "invalid_input"
  | "email_taken"
  | "invalid_credentials"
  | "pending_approval"
  | "account_rejected"
  | "server_error";

export type AuthResult =
  | { ok: true; user: SessionUser }
  // Sign-up succeeded, but the account can't be used until an admin approves it.
  | { ok: true; pending: true }
  | { ok: false; error: AuthErrorCode };

const SALT_ROUNDS = 12;

const signUpSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.email().trim().toLowerCase(),
  password: z.string().min(6).max(72),
});

const signInSchema = z.object({
  email: z.email().trim().toLowerCase(),
  password: z.string().min(1).max(72),
});

export async function signUp(formData: FormData): Promise<AuthResult> {
  const parsed = signUpSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { ok: false, error: "invalid_input" };

  const { name, email, password } = parsed.data;
  const supabase = createServerSupabase();

  const existing = await supabase
    .from("Users")
    .select("id")
    .eq("email", email)
    .maybeSingle();
  if (existing.error) {
    console.error("signUp lookup failed", existing.error);
    return { ok: false, error: "server_error" };
  }
  if (existing.data) return { ok: false, error: "email_taken" };

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const { data, error } = await supabase
    .from("Users")
    .insert({ name, email, password: hashedPassword, role: "user", permission: "pending" })
    .select("id")
    .single();

  if (error || !data) {
    // 23505 = unique_violation, in case the email column has a unique index.
    if (error?.code === "23505") return { ok: false, error: "email_taken" };
    console.error("signUp insert failed", error);
    return { ok: false, error: "server_error" };
  }

  return { ok: true, pending: true };
}

export async function signIn(formData: FormData): Promise<AuthResult> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { ok: false, error: "invalid_credentials" };

  const { email, password } = parsed.data;
  const supabase = createServerSupabase();

  const { data, error } = await supabase
    .from("Users")
    .select("id, name, email, role, permission, password")
    .eq("email", email)
    .maybeSingle();

  if (error) {
    console.error("signIn lookup failed", error);
    return { ok: false, error: "server_error" };
  }

  if (!data || !(await bcrypt.compare(password, data.password ?? ""))) {
    return { ok: false, error: "invalid_credentials" };
  }

  // Only checked after the password, so it doesn't reveal which emails are registered.
  const permission: Permission | null = data.permission;
  if (permission === "rejected") return { ok: false, error: "account_rejected" };
  if (permission !== "approved") return { ok: false, error: "pending_approval" };

  return startSession({ id: data.id, name: data.name, email: data.email, role: data.role });
}

async function startSession(user: SessionUser): Promise<AuthResult> {
  try {
    await createSession(user, await cookies());
  } catch (error) {
    console.error("createSession failed", error);
    return { ok: false, error: "server_error" };
  }
  return { ok: true, user };
}
