export function formatCount(count: number): string {
  if (count < 1000) return count > 0 ? String(count) : "";
  if (count < 1_000_000) {
    const value = count / 1000;
    return `${value < 10 ? value.toFixed(1).replace(/\.0$/, "") : Math.round(value)}K`;
  }
  const value = count / 1_000_000;
  return `${value < 10 ? value.toFixed(1).replace(/\.0$/, "") : Math.round(value)}M`;
}

export function timeAgo(date: string | Date): string {
  const then = new Date(date).getTime();
  const now = Date.now();
  const seconds = Math.max(0, Math.floor((now - then) / 1000));
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function fullDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function joinDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export function generateAvatar(seed: string): string {
  return `https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(seed)}&backgroundColor=1d9bf0,7856ff,f91880,00ba7c,ffd400`;
}

export function generateBanner(seed: string): string {
  const colors = ["1d9bf0", "7856ff", "f91880", "00ba7c", "ff7a00", "536471"];
  const index = Array.from(seed).reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  return `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="400"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#${colors[index]}"/><stop offset="1" stop-color="#0f1419"/></linearGradient></defs><rect width="1200" height="400" fill="url(#g)"/></svg>`,
  )}`;
}

export type TextToken =
  | { type: "text"; value: string }
  | { type: "mention" | "hashtag" | "url"; value: string };

export function parseTweetText(text: string): TextToken[] {
  const pattern = /(^|[\s(])([@#][A-Za-z0-9_]+|https?:\/\/[^\s]+)/g;
  const tokens: TextToken[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    const start = match.index + match[1].length;
    if (start > lastIndex) tokens.push({ type: "text", value: text.slice(lastIndex, start) });
    const value = match[2];
    tokens.push({
      type: value.startsWith("@") ? "mention" : value.startsWith("#") ? "hashtag" : "url",
      value,
    });
    lastIndex = start + value.length;
  }
  if (lastIndex < text.length) tokens.push({ type: "text", value: text.slice(lastIndex) });
  return tokens;
}
