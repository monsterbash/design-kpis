import Dashboard from "@/components/Dashboard";
import {
  getActiveMetrics,
  getArchivedMetrics,
  getEntriesForMetric,
  getUserById,
  getAllUsers,
} from "@/lib/queries";
import type { Metric, Entry, User } from "@/lib/schema";

type SafeUser = Omit<User, "password">;

function stripPassword(user: User): SafeUser {
  const { password: _, ...safe } = user;
  return safe;
}

async function buildMetricData(metricList: Metric[]) {
  const results = await Promise.all(
    metricList.map(async (metric) => ({
      metric,
      owner: stripPassword((await getUserById(metric.ownerId)) as User),
      entries: (await getEntriesForMetric(metric.id)) as Entry[],
    }))
  );
  return results;
}

export default async function Home() {
  const activeMetrics = await buildMetricData(await getActiveMetrics());
  const archivedMetrics = await buildMetricData(await getArchivedMetrics());
  const users = (await getAllUsers()).map(stripPassword);

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">
          Design KPIs
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Track and review team design metrics
        </p>
      </div>

      <Dashboard
        activeMetrics={activeMetrics}
        archivedMetrics={archivedMetrics}
        users={users}
      />
    </main>
  );
}
