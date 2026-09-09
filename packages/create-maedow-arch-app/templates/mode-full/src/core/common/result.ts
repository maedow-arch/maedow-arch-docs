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

/**
 * Convertit une fonction qui lève en `Result`.
 *
 * C'est la porte d'entrée du Result Pattern, et elle n'a qu'un seul endroit
 * légitime : `repository.ts`, ou l'adaptateur qui parle au monde extérieur.
 * Une base de données lève sur une contrainte violée, un `fetch` lève sur un
 * délai dépassé, et ces exceptions doivent devenir des données typées avant
 * d'entrer dans le domaine.
 *
 * Plus haut, elle n'a pas de sens : `andThen` suppose que tout ce qu'il
 * enchaîne rend un `Result`, et une exception qui traverse cette chaîne la
 * court-circuite en silence. Le domaine ne doit jamais avoir à se demander si
 * un appel peut lever.
 *
 * `onError` est obligatoire, et c'est délibéré : elle force à décider ce que
 * cette erreur signifie pour le métier. Un `catch` qui rendrait l'exception
 * telle quelle ferait remonter un objet de la bibliothèque jusqu'aux écrans.
 */
export async function fromThrowable<TData, TError>(
  fn: () => Promise<TData>,
  onError: (cause: unknown) => TError
): Promise<Result<TData, TError>> {
  try {
    return { ok: true, data: await fn() };
  } catch (cause) {
    return { ok: false, error: onError(cause) };
  }
}
