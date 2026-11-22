"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PenLine, Send, MoreHorizontal, ArrowLeft, Search } from "lucide-react";
import Avatar from "./Avatar";
import { useUnread } from "./AppShell";
import type { ConversationDTO, MessageDTO, UserDTO } from "@/lib/types";
import { timeAgo } from "@/lib/utils";

interface Props {
  conversations: ConversationDTO[];
  initialMessages: MessageDTO[];
  selectedId: string | null;
  currentUser: UserDTO;
  allUsers: UserDTO[];
}

export default function MessagesClient({ conversations, initialMessages, selectedId, currentUser, allUsers }: Props) {
  const router = useRouter();
  const { refresh } = useUnread();
  const bottomRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<MessageDTO[]>(initialMessages);
  const [convList, setConvList] = useState<ConversationDTO[]>(conversations);
  const [text, setText] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [recipient, setRecipient] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const selected = convList.find((c) => c.id === selectedId) || null;

  useEffect(() => {
    setMessages(initialMessages);
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [initialMessages, selectedId]);

  useEffect(() => {
    setConvList(conversations);
  }, [conversations]);

  useEffect(() => {
    if (!selectedId) return;
    let cancelled = false;
    (async () => {
      try {
        await fetch("/api/messages/read", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ conversationId: selectedId }),
        });
        if (cancelled) return;
        setConvList((prev) => prev.map((c) => (c.id === selectedId ? { ...c, unread: 0 } : c)));
        await refresh();
        router.refresh();
      } catch {}
    })();
    return () => { cancelled = true; };
  }, [selectedId, refresh, router]);

  async function send() {
    if (!text.trim() || busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: selectedId, text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not send");
      setMessages((prev) => [...prev, data.message]);
      setText("");
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function startConversation() {
    if (!recipient.trim()) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: recipient.trim(), text: text.trim() || "Hi!" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not start conversation");
      setShowNew(false);
      setRecipient("");
      setText("");
      router.push(`/messages?c=${data.conversationId}`);
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="sticky top-0 z-20 flex h-[53px] items-center justify-between border-b border-[var(--border)] bg-[var(--bg)]/85 px-4 backdrop-blur-md">
        <div className="flex items-center gap-5">
          {selected && (
            <button onClick={() => router.push("/messages")} className="-ml-2 flex h-8 w-8 items-center justify-center rounded-full hover:bg-[var(--hover-strong)]">
              <ArrowLeft size={20} />
            </button>
          )}
          <h1 className="text-[20px] font-extrabold">{selected ? selected.participant.name : "Messages"}</h1>
        </div>
        <button onClick={() => setShowNew((v) => !v)} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-[var(--hover-strong)]" title="New message">
          <PenLine size={19} />
        </button>
      </div>

      {showNew && (
        <div className="border-b border-[var(--border)] bg-[var(--panel)] p-3">
          <div className="mb-2 text-[13px] font-bold">New message</div>
          <div className="flex gap-2">
            <input
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="Search by username"
              className="flex-1 rounded-full border border-[var(--border)] bg-[var(--bg)] px-4 py-2 text-[14px] outline-none focus:border-[#1d9bf0]"
            />
            <button onClick={startConversation} disabled={busy} className="rounded-full bg-[#1d9bf0] px-4 py-2 text-[13px] font-bold text-white disabled:opacity-50">Send</button>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {allUsers.filter((u) => u.id !== currentUser.id).slice(0, 5).map((u) => (
              <button key={u.id} onClick={() => setRecipient(u.username)} className="rounded-full border border-[var(--border)] px-3 py-1 text-[12px] hover:bg-[var(--hover-strong)]">
                @{u.username}
              </button>
            ))}
          </div>
          {error && <p className="mt-2 text-[13px] text-red-500">{error}</p>}
        </div>
      )}

      {selected ? (
        <>
          <div className="flex items-center gap-3 border-b border-[var(--border)] px-4 py-3">
            <Avatar src={selected.participant.avatar} name={selected.participant.name} username={selected.participant.username} size={40} />
            <div className="min-w-0 flex-1">
              <Link href={`/profile/${selected.participant.username}`} className="text-[15px] font-bold hover:underline">{selected.participant.name}</Link>
              <div className="text-[13px] text-[var(--muted)]">@{selected.participant.username}</div>
            </div>
            <MoreHorizontal size={20} className="text-[var(--muted)]" />
          </div>

          <div className="flex min-h-[300px] flex-col gap-2 px-4 py-4">
            {messages.map((message) => {
              const mine = message.senderId === currentUser.id;
              return (
                <div key={message.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-[14px] leading-5 ${mine ? "rounded-br-sm bg-[#1d9bf0] text-white" : "rounded-bl-sm bg-[var(--panel)] text-[var(--text)]"}`}>
                    {message.text}
                    <div className={`mt-1 text-[10px] ${mine ? "text-white/70" : "text-[var(--muted)]"}`}>{timeAgo(message.createdAt)}</div>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          <div className="sticky bottom-0 flex items-center gap-2 border-t border-[var(--border)] bg-[var(--bg)] p-3">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") send(); }}
              placeholder="Start a new message"
              className="h-11 flex-1 rounded-full bg-[var(--panel)] px-4 text-[14px] outline-none placeholder:text-[var(--muted)]"
            />
            <button onClick={send} disabled={!text.trim() || busy} className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1d9bf0] text-white disabled:opacity-40">
              <Send size={18} />
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center gap-3 border-b border-[var(--border)] px-4 py-3">
            <Search size={18} className="text-[var(--muted)]" />
            <input placeholder="Search Direct Messages" className="w-full bg-transparent text-[14px] outline-none placeholder:text-[var(--muted)]" />
          </div>
          {convList.length === 0 ? (
            <div className="px-8 py-16 text-center">
              <h2 className="text-[31px] font-extrabold">Welcome to your inbox!</h2>
              <p className="mt-2 text-[15px] text-[var(--muted)]">Drop a line, share posts and more with private conversations.</p>
              <button onClick={() => setShowNew(true)} className="mt-5 rounded-full bg-[#1d9bf0] px-5 py-2.5 text-[14px] font-bold text-white">Write a message</button>
            </div>
          ) : (
            convList.map((convo) => (
              <button key={convo.id} onClick={() => router.push(`/messages?c=${convo.id}`)} className="flex w-full gap-3 border-b border-[var(--border)] px-4 py-3 text-left hover-row">
                <Avatar src={convo.participant.avatar} name={convo.participant.name} username={convo.participant.username} size={48} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-[15px] font-bold">{convo.participant.name} <span className="font-normal text-[var(--muted)]">@{convo.participant.username}</span></span>
                    <span className="shrink-0 text-[13px] text-[var(--muted)]">{timeAgo(convo.lastMessageAt)}</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between gap-2">
                    <span className="truncate text-[14px] text-[var(--muted)]">{convo.lastMessage}</span>
                    {convo.unread > 0 && <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#1d9bf0] px-1 text-[11px] font-bold text-white">{convo.unread}</span>}
                  </div>
                </div>
              </button>
            ))
          )}
        </>
      )}
    </div>
  );
}
