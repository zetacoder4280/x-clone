"use client";

import Link from "next/link";
import { parseTweetText } from "@/lib/utils";

export default function TweetText({ text }: { text: string }) {
  const tokens = parseTweetText(text);
  return (
    <div className="whitespace-pre-wrap break-words text-[15px] leading-[20px] text-[var(--text)]">
      {tokens.map((token, index) => {
        if (token.type === "text") return <span key={index}>{token.value}</span>;
        if (token.type === "mention") {
          return (
            <Link
              key={index}
              href={`/profile/${token.value.slice(1)}`}
              onClick={(e) => e.stopPropagation()}
              className="text-[#1d9bf0] hover:underline"
            >
              {token.value}
            </Link>
          );
        }
        if (token.type === "hashtag") {
          return (
            <Link
              key={index}
              href={`/explore?q=${encodeURIComponent(token.value)}`}
              onClick={(e) => e.stopPropagation()}
              className="text-[#1d9bf0] hover:underline"
            >
              {token.value}
            </Link>
          );
        }
        return (
          <a
            key={index}
            href={token.value}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-[#1d9bf0] hover:underline"
          >
            {token.value.replace(/^https?:\/\//, "").replace(/\/$/, "")}
          </a>
        );
      })}
    </div>
  );
}
