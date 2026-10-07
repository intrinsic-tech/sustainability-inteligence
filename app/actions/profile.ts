"use server";

import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { z } from "zod";
import {
  createSession,
  getSessionUser,
  revokeAllSessions,
  setAccessCookie,
} from "@/lib/auth/session";
import { createServerSupabase } from "@/lib/supabase-server";

export type ProfileErrorCode =
  | "unauthorized"
  | "invalid_name"
  | "invalid_password"
  | "password_mismatch"
  | "wrong_password"
  | "server_error";

export type ProfileResult =
  | { ok: true; name: string; passwordChanged: boolean }
  | { ok: false; error: ProfileErrorCode };

const SALT_ROUNDS = 12;

const nameSchema = z.string().trim().min(1).max(120);
const newPasswordSchema = z.string().min(6).max(72);

export async function updateProfile(formData: FormData): Promise<ProfileResult> {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return { ok: false, error: "unauthorized" };

  const name = nameSchema.safeParse(formData.get("name"));
  if (!name.success) return { ok: false, error: "invalid_name" };

  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  const changePassword = newPassword.length > 0;

  if (changePassword) {
    if (!newPasswordSchema.safeParse(newPassword).success) {
      return { ok: false, error: "invalid_password" };
    }
    if (newPassword !== confirmPassword) return { ok: false, error: "password_mismatch" };
  }

  const supabase = createServerSupabase();
  const { data: user, error } = await supabase
    .from("Users")
    .select("id, email, role, password")
    .eq("id", sessionUser.id)
    .maybeSingle();
  if (error) {
    console.error("updateProfile lookup failed", error);
    return { ok: false, error: "server_error" };
  }
  if (!user) return { ok: false, error: "unauthorized" };

  const changes: { name: string; password?: string } = { name: name.data };
  if (changePassword) {
    // Re-check the current password so a hijacked session can't take over the account.
    if (!(await bcrypt.compare(currentPassword, user.password ?? ""))) {
      return { ok: false, error: "wrong_password" };
    }
    changes.password = await bcrypt.hash(newPassword, SALT_ROUNDS);
  }

  const { error: updateError } = await supabase
    .from("Users")
    .update(changes)
    .eq("id", user.id);
  if (updateError) {
    console.error("updateProfile update failed", updateError);
    return { ok: false, error: "server_error" };
  }

  const updated = { id: user.id, name: name.data, email: user.email, role: user.role };
  try {
    const jar = await cookies();
    if (changePassword) {
      // Sign out every other device, then start a fresh session here.
      await revokeAllSessions(user.id);
      await createSession(updated, jar);
    } else {
      await setAccessCookie(updated, jar);
    }
  } catch (sessionError) {
    console.error("updateProfile session update failed", sessionError);
    return { ok: false, error: "server_error" };
  }

  return { ok: true, name: name.data, passwordChanged: changePassword };
}
