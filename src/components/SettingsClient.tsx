"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Image as ImageIcon } from "lucide-react";
import Avatar from "./Avatar";
import type { UserDTO } from "@/lib/types";

export default function SettingsClient({ user }: { user: UserDTO }) {
  const router = useRouter();
  const avatarRef = useRef<HTMLInputElement>(null);
  const bannerRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    name: user.name,
    bio: user.bio,
    location: user.location,
    website: user.website,
    avatar: user.avatar,
    banner: user.banner,
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function upload(file: File): Promise<string | null> {
    const data = new FormData();
    data.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: data });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Upload failed");
    return json.url;
  }

  async function onFile(field: "avatar" | "banner", file?: File) {
    if (!file) return;
    try {
      const url = await upload(file);
      if (url) setForm((prev) => ({ ...prev, [field]: url }));
    } catch (err) {
      setMessage((err as Error).message);
    }
  }

  async function save() {
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save");
      setMessage("Profile saved successfully.");
      router.refresh();
      setTimeout(() => router.push(`/profile/${user.username}`), 700);
    } catch (err) {
      setMessage((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "w-full rounded border border-[var(--border)] bg-transparent px-3 py-3 text-[15px] outline-none focus:border-[#1d9bf0] focus:ring-1 focus:ring-[#1d9bf0]";

  return (
    <div className="pb-10">
      <div className="relative h-[180px] bg-[var(--panel)]">
        {form.banner && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={form.banner} alt="banner" className="h-full w-full object-cover opacity-80" />
        )}
        <button
          onClick={() => bannerRef.current?.click()}
          className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 text-[14px] font-bold text-white opacity-0 transition-opacity hover:opacity-100"
        >
          <ImageIcon size={18} /> Change banner
        </button>
        <input ref={bannerRef} type="file" accept="image/*" hidden onChange={(e) => onFile("banner", e.target.files?.[0])} />
        <button
          onClick={() => avatarRef.current?.click()}
          className="absolute -bottom-14 left-4 flex h-[110px] w-[110px] items-center justify-center rounded-full border-4 border-[var(--bg)] bg-black/40 text-white opacity-90 hover:opacity-100"
        >
          <Avatar src={form.avatar} name={form.name} username={user.username} size={102} />
          <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 hover:opacity-100"><ImageIcon size={22} /></span>
        </button>
        <input ref={avatarRef} type="file" accept="image/*" hidden onChange={(e) => onFile("avatar", e.target.files?.[0])} />
      </div>

      <div className="mx-4 mt-16 space-y-5">
        <div>
          <label className="mb-1 block text-[13px] text-[var(--muted)]">Name</label>
          <input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={50} />
        </div>
        <div>
          <label className="mb-1 block text-[13px] text-[var(--muted)]">Bio</label>
          <textarea className={`${inputClass} resize-none`} rows={3} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} maxLength={160} placeholder="Tell us about yourself" />
          <div className="mt-1 text-right text-[12px] text-[var(--muted)]">{form.bio.length}/160</div>
        </div>
        <div>
          <label className="mb-1 block text-[13px] text-[var(--muted)]">Location</label>
          <input className={inputClass} value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} maxLength={30} placeholder="Location" />
        </div>
        <div>
          <label className="mb-1 block text-[13px] text-[var(--muted)]">Website</label>
          <input className={inputClass} value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} maxLength={100} placeholder="https://example.com" />
        </div>

        {message && <p className="text-[14px] text-[#1d9bf0]">{message}</p>}

        <div className="flex justify-end gap-3">
          <button onClick={() => router.back()} className="rounded-full border border-[var(--border)] px-5 py-2 text-[14px] font-bold hover:bg-[var(--hover-strong)]">Cancel</button>
          <button onClick={save} disabled={saving} className="rounded-full bg-[#1d9bf0] px-6 py-2 text-[14px] font-bold text-white hover:bg-[#1a8cd8] disabled:opacity-60">
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
