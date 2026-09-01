export type Result<TData, TError = string> =
  { ok: true; data: TData } | { ok: false; error: TError };

export function unwrapOr<TData, TError>(result: Result<TData, TError>, fallback: TData): TData {
  return result.ok ? result.data : fallback;
}

export function mapResult<TData, TMapped, TError>(
  result: Result<TData, TError>,
  fn: (data: TData) => TMapped
): Result<TMapped, TError> {
  return result.ok ? { ok: true, data: fn(result.data) } : result;
}

export function match<TData, TError, TReturn>(
  result: Result<TData, TError>,
  handlers: { ok: (data: TData) => TReturn; err: (error: TError) => TReturn }
): TReturn {
  return result.ok ? handlers.ok(result.data) : handlers.err(result.error);
}

/**
 * Enchaîne une opération faillible sur le succès de la précédente.
 *
 * C'est le helper qui fait tenir le pattern à l'échelle d'un service réel.
 * `mapResult` transforme une donnée, mais son résultat n'est pas faillible :
 * enchaîner trois appels qui peuvent échouer ramène l'imbrication que le
 * pattern devait supprimer.
 *
 * Il accepte des valeurs et des promesses des deux côtés, et retourne toujours
 * une promesse. Deux variantes séparées, l'une synchrone et l'autre non,
 * obligeraient à choisir à chaque appel selon ce que fait l'étape suivante,
 * c'est-à-dire à connaître son implémentation.
 */
export async function andThen<TData, TSuivant, TError>(
  result: Result<TData, TError> | Promise<Result<TData, TError>>,
  fn: (data: TData) => Result<TSuivant, TError> | Promise<Result<TSuivant, TError>>
): Promise<Result<TSuivant, TError>> {
  const resolu = await result;
  return resolu.ok ? fn(resolu.data) : resolu;
}

/**
 * Agrège une liste de résultats en un résultat de liste.
 *
 * S'arrête à la première erreur et la retourne telle quelle. C'est le
 * comportement attendu d'une validation : la deuxième erreur n'apporte rien
 * tant que la première n'est pas traitée, et parcourir le reste coûterait des
 * appels inutiles.
 *
 * L'ordre des données rendues suit celui des résultats reçus.
 */
export function all<TData, TError>(results: Result<TData, TError>[]): Result<TData[], TError> {
  const donnees: TData[] = [];

  for (const result of results) {
    if (!result.ok) return result;
    donnees.push(result.data);
  }

  return { ok: true, data: donnees };
}
