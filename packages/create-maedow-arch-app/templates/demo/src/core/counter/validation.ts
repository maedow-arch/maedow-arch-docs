import { z } from "zod";

/**
 * Contrat d'entrée du domaine, validé à la frontière.
 *
 * Le type n'est pas redéclaré à la main : il est inféré du schéma. C'est la
 * règle d'inférence Zod systématique de models.md §3.
 */
export const CounterSettingsSchema = z.object({
  value: z.number().int(),
  min: z.number().int(),
  max: z.number().int(),
  step: z.number().int().positive(),
});

export type CounterSettings = z.infer<typeof CounterSettingsSchema>;
