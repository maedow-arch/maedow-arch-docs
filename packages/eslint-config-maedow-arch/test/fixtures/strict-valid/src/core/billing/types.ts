// Ce que MA-005 attend à la place d'un `any` : une garde de type.
export type Facture = { total: number };

function estFacture(valeur: unknown): valeur is Facture {
  return typeof valeur === "object" && valeur !== null && "total" in valeur;
}

export function parseTotal(brut: unknown): number {
  return estFacture(brut) ? brut.total : 0;
}
