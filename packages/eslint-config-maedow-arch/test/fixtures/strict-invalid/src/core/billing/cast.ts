// MA-006 : la double assertion. `as unknown` seul serait légitime, c'est
// l'enchaînement vers un autre type qui force au lieu de valider.
type Facture = { total: number };
export const forcer = (brut: string): Facture => brut as unknown as Facture;
