import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin — RADURA",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-dvh w-full overflow-y-auto overscroll-contain bg-white">
      {children}
    </div>
  );
}
