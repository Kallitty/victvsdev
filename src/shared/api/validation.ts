/**
 * TypeScript types vanish at runtime. If the API changes shape, these checks fail
 * loudly with the exact path ("exams[3].location.latitude") instead of letting
 * `undefined` leak into the UI.
 */
export class ApiDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ApiDataError';
  }
}

export type JsonObject = Record<string, unknown>;

export function isObject(value: unknown): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function expectObject(value: unknown, path: string): JsonObject {
  if (!isObject(value)) throw new ApiDataError(`${path}: expected an object`);
  return value;
}

export function readId(obj: JsonObject, key: string, path: string): number {
  const value = obj[key];
  if (typeof value === 'number' && Number.isSafeInteger(value) && value > 0) return value;
  throw new ApiDataError(`${path}.${key}: expected a positive integer id`);
}

export function readString(obj: JsonObject, key: string, path: string): string {
  const value = obj[key];
  if (typeof value === 'string') return value;
  throw new ApiDataError(`${path}.${key}: expected a string`);
}

/** The API sends coordinates as strings ("51.507351"); accept those and numbers. */
export function readCoordinate(obj: JsonObject, key: string, path: string, limit: number): number {
  const raw = obj[key];
  const value = typeof raw === 'string' && raw.trim() !== '' ? Number(raw) : raw;
  if (typeof value === 'number' && Number.isFinite(value) && Math.abs(value) <= limit) return value;
  throw new ApiDataError(`${path}.${key}: expected a coordinate between -${limit} and ${limit}`);
}

/** Laravel resources sometimes wrap payloads as { data: ... }; accept both. */
export function unwrap(payload: unknown): unknown {
  return isObject(payload) && 'data' in payload ? payload.data : payload;
}

export function expectArray(payload: unknown, path: string): unknown[] {
  const value = unwrap(payload);
  if (!Array.isArray(value)) throw new ApiDataError(`${path}: expected an array`);
  return value;
}
