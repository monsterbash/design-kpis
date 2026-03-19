import type { FieldDefinition } from "./schema";

export type FieldTemplate = {
  id: string;
  label: string;
  description: string;
  fieldDefinitions: FieldDefinition[];
  displayType: "average" | "percentage" | "computed_average";
};

export const FIELD_TEMPLATES: FieldTemplate[] = [
  {
    id: "score-1-10",
    label: "Score (1–10)",
    description: "Decimal score from 1 to 10, displayed as an average",
    fieldDefinitions: [{ name: "score", type: "decimal", min: 1, max: 10 }],
    displayType: "average",
  },
  {
    id: "score-1-5",
    label: "Score (1–5)",
    description: "Decimal score from 1 to 5, displayed as an average",
    fieldDefinitions: [{ name: "score", type: "decimal", min: 1, max: 5 }],
    displayType: "average",
  },
  {
    id: "yes-no",
    label: "Yes / No",
    description: "Yes/No radio, displayed as adoption percentage",
    fieldDefinitions: [
      { name: "was_it_used", type: "radio", options: ["Yes", "No"] },
    ],
    displayType: "percentage",
  },
  {
    id: "yes-somewhat-no",
    label: "Yes / Somewhat / No tallies",
    description:
      "Tally of Yes/Somewhat/No responses, displayed as computed average (Yes=3, Somewhat=2, No=1)",
    fieldDefinitions: [
      { name: "yes_count", type: "integer", min: 0 },
      { name: "somewhat_count", type: "integer", min: 0 },
      { name: "no_count", type: "integer", min: 0 },
    ],
    displayType: "computed_average",
  },
];

export function getTemplateById(id: string): FieldTemplate | undefined {
  return FIELD_TEMPLATES.find((t) => t.id === id);
}
