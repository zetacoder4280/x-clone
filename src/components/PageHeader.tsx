"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface Props {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  right?: React.ReactNode;
}

export default function PageHeader({ title, subtitle, showBack = false, right }: Props) {
  const router = useRouter();
  return (
    <div className="sticky top-0 z-20 border-b border-[var(--border)] bg-[var(--bg)]/85 backdrop-blur-md">
      <div className="flex min-h-[53px] items-center gap-6 px-4">
        {showBack && (
          <button
            onClick={() => router.back()}
            className="-ml-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-full hover:bg-[var(--hover-strong)]"
            aria-label="Back"
          >
            <ArrowLeft size={20} />
          </button>
        )}
        <div className="min-w-0 flex-1 py-2">
          <h1 className="truncate text-[20px] font-extrabold leading-6">{title}</h1>
          {subtitle && <p className="text-[13px] text-[var(--muted)]">{subtitle}</p>}
        </div>
        {right}
      </div>
    </div>
  );
}
