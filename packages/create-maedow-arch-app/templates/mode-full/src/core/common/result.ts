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
