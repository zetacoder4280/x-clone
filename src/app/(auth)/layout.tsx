import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { XLogo } from "@/components/LeftSidebar";

export const dynamic = "force-dynamic";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (user) redirect("/");

  return (
    <div className="flex min-h-screen w-full items-stretch justify-center">
      <div className="hidden w-full max-w-[50%] items-center justify-center lg:flex">
        <XLogo size={320} />
      </div>
      <div className="flex w-full max-w-[600px] flex-col items-center justify-center">
        {children}
        <div className="mb-6 flex max-w-[420px] flex-wrap justify-center gap-4 px-8 text-[13px] text-[var(--muted)]">
          {["About", "Download the X app", "Help", "Terms of Service", "Privacy Policy", "Cookie Policy", "Accessibility", "Ads info", "Blog", "Careers", "Brand Resources", "Advertising", "Marketing", "X for Business", "Developers", "Directory", "Settings", "© 2026 X Corp."].map((item) => (
            <Link key={item} href="/login" className="hover:underline">{item}</Link>
          ))}
        </div>
      </div>
    </div>
  );
}
