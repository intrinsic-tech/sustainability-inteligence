import { redirect } from "next/navigation";
import { ADMIN_ROLE } from "@/lib/auth/permissions";
import { getSessionUser } from "@/lib/auth/session";
import { createServerSupabase } from "@/lib/supabase-server";
import { DashboardView } from "./DashboardView";

async function countPendingUsers() {
  const { count, error } = await createServerSupabase()
    .from("Users")
    .select("id", { count: "exact", head: true })
    .eq("permission", "pending");
  if (error) console.error("countPendingUsers failed", error);
  return count ?? 0;
}

export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect("/");

  // Only decides whether the approvals UI is shown; the user actions re-check the role.
  const isAdmin = user.role === ADMIN_ROLE;
  const pendingCount = isAdmin ? await countPendingUsers() : 0;

  return (
    <DashboardView
      userId={String(user.id)}
      userName={user.name}
      isAdmin={isAdmin}
      pendingCount={pendingCount}
    />
  );
}
