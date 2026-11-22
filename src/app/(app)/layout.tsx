import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import {
  getSuggestedUsers, getUnreadCounts, getUserById, TRENDS,
} from "@/lib/queries";
import AppShell from "@/components/AppShell";

export const dynamic = "force-dynamic";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const authUser = await getCurrentUser();
  if (!authUser) redirect("/login");

  const [currentUser, suggested, unread] = await Promise.all([
    getUserById(authUser.id, authUser.id),
    getSuggestedUsers(authUser.id),
    getUnreadCounts(authUser.id),
  ]);
  if (!currentUser) redirect("/login");

  return (
    <AppShell
      currentUser={currentUser}
      suggested={suggested}
      trends={TRENDS}
      unreadNotifications={unread.notifications}
      unreadMessages={unread.messages}
    >
      {children}
    </AppShell>
  );
}
