import type { Metadata } from "next";
import { Inclusive_Sans } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/NavBar";
import Providers from "@/components/Providers";
import SitePasswordForm from "@/components/SitePasswordForm";
import { auth } from "@/lib/auth";
import { isSiteGateRequired } from "@/lib/site-protection";

const inclusiveSans = Inclusive_Sans({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Design KPIs",
  description: "Track and review team design metrics",
  robots: { index: false, follow: false },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gateRequired = await isSiteGateRequired();

  if (gateRequired) {
    return (
      <html lang="en" className={`${inclusiveSans.className} h-full antialiased`}>
        <body className="min-h-full flex flex-col bg-canvas">
          <SitePasswordForm />
        </body>
      </html>
    );
  }

  const session = await auth();

  return (
    <html lang="en" className={`${inclusiveSans.className} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-canvas">
        <Providers session={session}>
          <NavBar />
          <div className="flex-1">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
