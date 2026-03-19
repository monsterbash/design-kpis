import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getActiveUsers } from "@/lib/queries";
import CreateMetricForm from "@/components/CreateMetricForm";

export default async function NewMetricPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const users = await getActiveUsers();
  const safeUsers = users.map(({ password: _, ...u }) => u);

  return (
    <main className="mx-auto w-full max-w-lg px-6 py-12">
      <h1 className="text-2xl font-bold text-text-primary">New Metric</h1>
      <p className="mt-1 text-sm text-text-secondary">
        Define a new metric for the team to track.
      </p>

      <CreateMetricForm users={safeUsers} />
    </main>
  );
}
