"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { createServerSupabase } from "@/lib/supabase-server";

export type AuthErrorCode =
  | "invalid_input"
  | "email_taken"
  | "invalid_credentials"
  | "server_error";

export type SessionUser = {
  id: string | number;
  name: string;
  email: string;
  role: string;
};

export type AuthResult =
  | { ok: true; user: SessionUser }
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
    .insert({ name, email, password: hashedPassword, role: "user" })
    .select("id, name, email, role")
    .single();

  if (error) {
    // 23505 = unique_violation, in case the email column has a unique index.
    if (error.code === "23505") return { ok: false, error: "email_taken" };
    console.error("signUp insert failed", error);
    return { ok: false, error: "server_error" };
  }

  return { ok: true, user: data };
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
    .select("id, name, email, role, password")
    .eq("email", email)
    .maybeSingle();

  if (error) {
    console.error("signIn lookup failed", error);
    return { ok: false, error: "server_error" };
  }

  if (!data || !(await bcrypt.compare(password, data.password ?? ""))) {
    return { ok: false, error: "invalid_credentials" };
  }

  return {
    ok: true,
    user: { id: data.id, name: data.name, email: data.email, role: data.role },
  };
}
