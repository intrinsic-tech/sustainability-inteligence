"use server";

import { z } from "zod";
import { ADMIN_ROLE, PERMISSIONS, type Permission } from "@/lib/auth/permissions";
import { getSessionUser, revokeAllSessions } from "@/lib/auth/session";
import { createServerSupabase } from "@/lib/supabase-server";

export type ManagedUser = {
  id: string | number;
  name: string;
  email: string;
  role: string;
  permission: Permission;
};

export type UsersErrorCode = "unauthorized" | "invalid_input" | "self_action" | "server_error";

export type UsersResult<T> = { ok: true; data: T } | { ok: false; error: UsersErrorCode };

const idSchema = z.union([z.string().min(1).max(64), z.number().int()]);
const permissionSchema = z.enum(PERMISSIONS);

/**
 * The signed-in admin, re-checked against the database so a stale access token
 * (role changed or approval revoked in the last few minutes) can't be used.
 */
async function requireAdmin() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return null;

  const { data, error } = await createServerSupabase()
    .from("Users")
    .select("id, role, permission")
    .eq("id", sessionUser.id)
    .maybeSingle();
  if (error) {
    console.error("requireAdmin lookup failed", error);
    return null;
  }
  if (!data || data.role !== ADMIN_ROLE || data.permission !== "approved") return null;
  return data;
}

export async function listUsers(): Promise<UsersResult<ManagedUser[]>> {
  if (!(await requireAdmin())) return { ok: false, error: "unauthorized" };

  const { data, error } = await createServerSupabase()
    .from("Users")
    .select("id, name, email, role, permission")
    .order("name");
  if (error) {
    console.error("listUsers failed", error);
    return { ok: false, error: "server_error" };
  }
  return { ok: true, data: data as ManagedUser[] };
}

export async function setUserPermission(
  userId: ManagedUser["id"],
  permission: Permission,
): Promise<UsersResult<null>> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "unauthorized" };

  const id = idSchema.safeParse(userId);
  const next = permissionSchema.safeParse(permission);
  if (!id.success || !next.success) return { ok: false, error: "invalid_input" };
  // Admins can't change their own access, so they can't lock themselves out.
  if (String(id.data) === String(admin.id)) return { ok: false, error: "self_action" };

  const { error } = await createServerSupabase()
    .from("Users")
    .update({ permission: next.data })
    .eq("id", id.data);
  if (error) {
    console.error("setUserPermission failed", error);
    return { ok: false, error: "server_error" };
  }

  try {
    // Sign the user out everywhere once they lose access.
    if (next.data !== "approved") await revokeAllSessions(id.data);
  } catch (revokeError) {
    console.error("setUserPermission session revoke failed", revokeError);
  }
  return { ok: true, data: null };
}

export async function deleteUser(userId: ManagedUser["id"]): Promise<UsersResult<null>> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "unauthorized" };

  const id = idSchema.safeParse(userId);
  if (!id.success) return { ok: false, error: "invalid_input" };
  if (String(id.data) === String(admin.id)) return { ok: false, error: "self_action" };

  const supabase = createServerSupabase();
  // Remove the user's refresh tokens first so a foreign key on user_id can't block the delete.
  const { error: tokensError } = await supabase
    .from("refresh_tokens")
    .delete()
    .eq("user_id", id.data);
  if (tokensError) {
    console.error("deleteUser token cleanup failed", tokensError);
    return { ok: false, error: "server_error" };
  }

  const { error } = await supabase.from("Users").delete().eq("id", id.data);
  if (error) {
    console.error("deleteUser failed", error);
    return { ok: false, error: "server_error" };
  }
  return { ok: true, data: null };
}
