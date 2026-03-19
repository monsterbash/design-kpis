import type { Metric, Entry, FieldDefinition } from "./schema";

export function computeMetricValue(
  metric: Metric,
  metricEntries: Entry[]
): string {
  if (metricEntries.length === 0) return "—";

  const fields = metric.fieldDefinitions as FieldDefinition[];

  if (metric.displayType === "average") {
    const field = fields[0];
    const values = metricEntries.map(
      (e) => Number((e.ratings as Record<string, number>)[field.name]) || 0
    );
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    return avg.toFixed(1);
  }

  if (metric.displayType === "percentage") {
    const field = fields[0];
    const yesCount = metricEntries.filter(
      (e) => (e.ratings as Record<string, string>)[field.name] === "Yes"
    ).length;
    const pct = (yesCount / metricEntries.length) * 100;
    return `${Math.round(pct)}%`;
  }

  if (metric.displayType === "computed_average") {
    let totalWeighted = 0;
    let totalRespondents = 0;

    for (const entry of metricEntries) {
      const r = entry.ratings as Record<string, number>;
      const yes = r.yes_count || 0;
      const somewhat = r.somewhat_count || 0;
      const no = r.no_count || 0;
      totalWeighted += yes * 3 + somewhat * 2 + no * 1;
      totalRespondents += yes + somewhat + no;
    }

    if (totalRespondents === 0) return "—";
    return (totalWeighted / totalRespondents).toFixed(2);
  }

  return "—";
}
