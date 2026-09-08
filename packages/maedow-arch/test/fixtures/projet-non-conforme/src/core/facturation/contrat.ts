/*
 * Du TypeScript parfaitement conforme, qui ressemblait à du JSX.
 *
 * Chaque ligne ci-dessous était signalée « contient du JSX » par l'audit :
 * un générique à un seul argument, un type de retour de dépôt, et une balise
 * écrite dans un littéral de chaîne. La signature du dépôt est celle que le
 * corpus donne lui-même en exemple.
 */
export type Resultat<T> = { ok: true; valeur: T } | { ok: false };

export interface DepotUtilisateur {
  trouverParId(id: string): Promise<Resultat<string>>;
  lister(): Promise<Array<string>>;
}

export const INDISPONIBLE = "<html>503 Service Unavailable</html>";
