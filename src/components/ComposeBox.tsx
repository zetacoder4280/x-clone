"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Image as ImageIcon, Smile, BarChart3, CalendarDays, MapPin, X, Globe2 } from "lucide-react";
import Avatar from "./Avatar";
import TweetText from "./TweetText";
import type { UserDTO } from "@/lib/types";

const MAX = 280;
const EMOJIS = ["😀", "😂", "🥹", "😍", "🤔", "👍", "🔥", "✨", "🚀", "❤️", "🎉", "👀", "💡", "☕", "🌙", "💯"];

interface Props {
  currentUser: UserDTO;
  parent?: { id: string; username: string; text: string } | null;
  placeholder?: string;
  autoFocus?: boolean;
  variant?: "inline" | "modal";
  onClose?: () => void;
  onSuccess?: () => void;
}

export default function ComposeBox({
  currentUser,
  parent,
  placeholder = "What is happening?!",
  autoFocus = false,
  variant = "inline",
  onClose,
  onSuccess,
}: Props) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);

  const remaining = MAX - text.length;
  const canPost = (text.trim().length > 0 || images.length > 0) && remaining >= 0 && !posting && !uploading;

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    setError("");
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files).slice(0, 4 - images.length)) {
        const form = new FormData();
        form.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: form });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Upload failed");
        uploaded.push(data.url);
      }
      setImages((prev) => [...prev, ...uploaded].slice(0, 4));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function submit() {
    if (!canPost) return;
    setPosting(true);
    setError("");
    try {
      const res = await fetch("/api/tweets/compose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, images, parentId: parent?.id || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not post");
      setText("");
      setImages([]);
      setShowEmoji(false);
      onSuccess?.();
      onClose?.();
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setPosting(false);
    }
  }

  return (
    <div className={`flex gap-3 px-4 ${variant === "modal" ? "pt-3" : "pt-3 pb-2"}`}>
      <Avatar src={currentUser.avatar} name={currentUser.name} username={currentUser.username} size={40} />
      <div className="min-w-0 flex-1">
        {parent && (
          <div className="mb-1 text-[13px] text-[#1d9bf0]">
            Replying to <span className="text-[#1d9bf0]">@{parent.username}</span>
          </div>
        )}
        <textarea
          autoFocus={autoFocus}
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, MAX))}
          placeholder={placeholder}
          rows={variant === "modal" ? 3 : 2}
          className="w-full resize-none bg-transparent py-2 text-[20px] leading-6 text-[var(--text)] outline-none placeholder:text-[var(--muted)]"
        />

        {parent?.text && (
          <div className="mb-3 rounded-2xl border border-[var(--border)] p-3">
            <TweetText text={parent.text.length > 140 ? parent.text.slice(0, 140) + "…" : parent.text} />
          </div>
        )}

        {images.length > 0 && (
          <div className={`mb-3 grid gap-2 ${images.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
            {images.map((url, i) => (
              <div key={i} className="relative overflow-hidden rounded-2xl border border-[var(--border)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="upload preview" className="max-h-72 w-full object-cover" />
                <button
                  type="button"
                  onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                  className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white hover:bg-black"
                  aria-label="Remove image"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}

        {variant === "inline" && (
          <button className="mb-2 flex items-center gap-1.5 text-[13px] font-bold text-[#1d9bf0] hover:underline">
            <Globe2 size={14} /> Everyone can reply
          </button>
        )}

        {error && <p className="mb-2 text-[13px] text-red-500">{error}</p>}

        <div className="flex items-center justify-between border-t border-[var(--border)] pt-2">
          <div className="-ml-2 flex items-center text-[#1d9bf0]">
            <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => handleFiles(e.target.files)} />
            <button type="button" onClick={() => fileRef.current?.click()} title="Media" className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-[#1d9bf0]/10">
              <ImageIcon size={19} />
            </button>
            <button type="button" title="GIF" className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-[#1d9bf0]/10">
              <BarChart3 size={19} />
            </button>
            <div className="relative">
              <button type="button" onClick={() => setShowEmoji((v) => !v)} title="Emoji" className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-[#1d9bf0]/10">
                <Smile size={19} />
              </button>
              {showEmoji && (
                <div className="absolute bottom-11 left-0 z-20 grid w-60 grid-cols-8 gap-1 rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-2 shadow-2xl">
                  {EMOJIS.map((emoji) => (
                    <button key={emoji} type="button" onClick={() => setText((t) => t + emoji)} className="rounded p-1 text-lg hover:bg-[var(--hover-strong)]">
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button type="button" title="Poll" className="hidden h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-[#1d9bf0]/10 sm:flex">
              <BarChart3 size={19} />
            </button>
            <button type="button" title="Schedule" className="hidden h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-[#1d9bf0]/10 sm:flex">
              <CalendarDays size={19} />
            </button>
            <button type="button" title="Location" className="hidden h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-[#1d9bf0]/10 sm:flex">
              <MapPin size={19} />
            </button>
          </div>

          <div className="flex items-center gap-3">
            {text.length > 0 && (
              <>
                <div className="relative h-7 w-7" title={`${remaining} characters left`}>
                  <svg viewBox="0 0 24 24" className="h-7 w-7 -rotate-90">
                    <circle cx="12" cy="12" r="10" fill="none" stroke="var(--border)" strokeWidth="2" />
                    <circle
                      cx="12" cy="12" r="10" fill="none"
                      stroke={remaining < 0 ? "#f4212e" : remaining < 20 ? "#ffd400" : "#1d9bf0"}
                      strokeWidth="2"
                      strokeDasharray={`${Math.min(1, text.length / MAX) * 62.83} 62.83`}
                      strokeLinecap="round"
                    />
                  </svg>
                  {remaining <= 20 && (
                    <span className={`absolute inset-0 flex items-center justify-center text-[10px] ${remaining < 0 ? "text-red-500" : "text-[var(--muted)]"}`}>
                      {remaining}
                    </span>
                  )}
                </div>
                <div className="h-7 w-px bg-[var(--border)]" />
              </>
            )}
            <button
              type="button"
              onClick={submit}
              disabled={!canPost}
              className="rounded-full bg-[#1d9bf0] px-5 py-2 text-[14px] font-bold text-white transition-colors hover:bg-[#1a8cd8] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {posting ? "Posting…" : uploading ? "Uploading…" : parent ? "Reply" : "Post"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
