import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { ensureSiteSettingsRow } from "@/lib/site-protection";
import AccountSettings from "@/components/AccountSettings";
import SiteProtectionSettings from "@/components/SiteProtectionSettings";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const settings = await ensureSiteSettingsRow();

  return (
    <main className="mx-auto w-full max-w-lg px-6 py-12">
      <h1 className="text-2xl font-bold text-text-primary">Settings</h1>

      <div className="mt-8 space-y-8">
        <SiteProtectionSettings
          initialEnabled={settings.siteProtectionEnabled}
          hasPassword={!!settings.sitePasswordHash}
        />

        <AccountSettings />
      </div>
    </main>
  );
}
