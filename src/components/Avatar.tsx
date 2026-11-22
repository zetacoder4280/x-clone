"use client";

import { useState } from "react";

interface AvatarProps {
  src?: string;
  name?: string;
  username?: string;
  size?: number;
  className?: string;
}

export default function Avatar({ src, name = "", username = "", size = 40, className = "" }: AvatarProps) {
  const [failed, setFailed] = useState(false);
  const fallback = `https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(username || name || "user")}`;
  const source = !failed && src ? src : fallback;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={source}
      alt={name || username}
      width={size}
      height={size}
      onError={() => setFailed(true)}
      className={`shrink-0 rounded-full bg-[var(--panel)] object-cover ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
