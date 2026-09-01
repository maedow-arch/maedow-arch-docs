// Une assertion simple reste permise, et `as unknown` isolé aussi : c'est
// l'enchaînement des deux que MA-006 refuse.
export const versInconnu = (valeur: string): unknown => valeur as unknown;
export const versNombre = (valeur: unknown) => Number(valeur);
