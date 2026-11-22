import { getViewer } from "@/lib/viewer";
import { getNotifications } from "@/lib/queries";
import NotificationsClient from "@/components/NotificationsClient";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const { userId } = await getViewer();
  const notifications = await getNotifications(userId);
  return <NotificationsClient initialItems={notifications} />;
}
