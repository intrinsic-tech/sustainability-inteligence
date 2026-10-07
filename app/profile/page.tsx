import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { ProfileView } from "./ProfileView";

export default async function ProfilePage() {
  const user = await getSessionUser();
  if (!user) redirect("/");

  return <ProfileView name={user.name} email={user.email} />;
}
