"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { XLogo } from "@/components/LeftSidebar";

interface Props {
  mode: "login" | "signup";
}

export default function AuthForm({ mode }: Props) {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", username: "", email: "", password: "", identifier: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function set(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError("");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const url = mode === "login" ? "/api/auth/login" : "/api/auth/signup";
      const payload = mode === "login"
        ? { identifier: form.identifier, password: form.password }
        : { name: form.name, username: form.username, email: form.email, password: form.password };
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      router.push("/");
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded border border-[var(--border)] bg-transparent px-3 py-3 text-[15px] outline-none transition-colors focus:border-[#1d9bf0] focus:ring-1 focus:ring-[#1d9bf0]";

  return (
    <div className="w-full max-w-[600px] px-8 py-10">
      <div className="mb-8 lg:hidden"><XLogo size={40} /></div>
      <h1 className="mb-8 text-[31px] font-extrabold leading-tight tracking-tight">
        {mode === "signup" ? "Create your account" : "Sign in to X"}
      </h1>

      <form onSubmit={submit} className="space-y-5">
        {mode === "signup" && (
          <>
            <div>
              <label className="mb-1 block text-[13px] font-medium text-[var(--muted)]">Name</label>
              <input className={inputClass} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Name" required maxLength={50} />
            </div>
            <div>
              <label className="mb-1 block text-[13px] font-medium text-[var(--muted)]">Email</label>
              <input className={inputClass} type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="you@example.com" required />
            </div>
            <div>
              <label className="mb-1 block text-[13px] font-medium text-[var(--muted)]">Username</label>
              <input className={inputClass} value={form.username} onChange={(e) => set("username", e.target.value)} placeholder="username" required minLength={3} maxLength={15} pattern="[A-Za-z0-9_]+" />
            </div>
          </>
        )}

        {mode === "login" && (
          <div>
            <label className="mb-1 block text-[13px] font-medium text-[var(--muted)]">Email or username</label>
            <input className={inputClass} value={form.identifier} onChange={(e) => set("identifier", e.target.value)} placeholder="Email or username" required autoComplete="username" />
          </div>
        )}

        <div>
          <label className="mb-1 block text-[13px] font-medium text-[var(--muted)]">Password</label>
          <input className={inputClass} type="password" value={form.password} onChange={(e) => set("password", e.target.value)} placeholder="Password" required minLength={6} autoComplete={mode === "login" ? "current-password" : "new-password"} />
        </div>

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-[14px] text-red-500">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-[#1d9bf0] py-3.5 text-[15px] font-bold text-white transition-colors hover:bg-[#1a8cd8] disabled:opacity-60"
        >
          {loading ? "Please wait…" : mode === "signup" ? "Create account" : "Sign in"}
        </button>

        <button
          type="button"
          onClick={() => {
            setError("");
            if (mode === "login") {
              setForm((p) => ({ ...p, identifier: "demo@x.com", password: "password123" }));
            } else {
              setForm({ name: "Demo User", username: `user${Math.floor(Math.random() * 9000 + 1000)}`, email: `user${Date.now()}@example.com`, password: "password123", identifier: "" });
            }
          }}
          className="w-full rounded-full border border-[#1d9bf0] py-3 text-[14px] font-bold text-[#1d9bf0] transition-colors hover:bg-[#1d9bf0]/10"
        >
          {mode === "login" ? "Use demo account" : "Fill sample details"}
        </button>
      </form>

      <p className="mt-6 text-[14px] text-[var(--muted)]">
        {mode === "signup" ? "Already have an account? " : "Don't have an account? "}
        <Link href={mode === "signup" ? "/login" : "/signup"} className="text-[#1d9bf0] hover:underline">
          {mode === "signup" ? "Sign in" : "Sign up"}
        </Link>
      </p>
    </div>
  );
}
