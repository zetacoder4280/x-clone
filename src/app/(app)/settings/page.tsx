import { getViewer } from "@/lib/viewer";
import PageHeader from "@/components/PageHeader";
import SettingsClient from "@/components/SettingsClient";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const { currentUser } = await getViewer();
  return (
    <div>
      <PageHeader title="Edit profile" showBack />
      <SettingsClient user={currentUser} />
    </div>
  );
}
