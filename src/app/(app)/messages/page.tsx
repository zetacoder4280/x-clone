import { getViewer } from "@/lib/viewer";
import { getAllUsers, getConversations, getMessages } from "@/lib/queries";
import MessagesClient from "@/components/MessagesClient";

export const dynamic = "force-dynamic";

export default async function MessagesPage({ searchParams }: { searchParams: { c?: string } }) {
  const { userId, currentUser } = await getViewer();
  const [conversations, allUsers] = await Promise.all([
    getConversations(userId),
    getAllUsers(userId),
  ]);
  const selectedId = searchParams.c && conversations.some((c) => c.id === searchParams.c) ? searchParams.c : null;
  const messages = selectedId ? await getMessages(selectedId, userId) : [];

  return (
    <MessagesClient
      conversations={conversations}
      initialMessages={messages}
      selectedId={selectedId}
      currentUser={currentUser}
      allUsers={allUsers}
    />
  );
}
