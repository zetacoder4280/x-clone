import { redirect } from "next/navigation";
import { getSession } from "./auth";
import { getUserById } from "./queries";
import type { UserDTO } from "./types";

export async function getViewer(): Promise<{ userId: string; currentUser: UserDTO }> {
  const session = await getSession();
  if (!session) redirect("/login");
  const user = await getUserById(session.id, session.id);
  if (!user) redirect("/login");
  return { userId: session.id, currentUser: user };
}
