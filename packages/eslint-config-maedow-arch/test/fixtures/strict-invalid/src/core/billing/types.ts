// MA-005 : un `any` explicite, la forme la plus courante, dans un catch.
export function parseTotal(brut: unknown): number {
  try {
    return Number((brut as any).total);
  } catch (erreur: any) {
    return 0;
  }
}
