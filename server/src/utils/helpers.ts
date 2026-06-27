/**
 * Miscellaneous utility functions
 */

/** Safely parse an integer with fallback */
export const safeParseInt = (value: string | undefined, fallback: number): number => {
  if (!value) return fallback;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? fallback : parsed;
};

/** Calculate pagination offset */
export const getPaginationOffset = (page: number, limit: number): number => {
  return (page - 1) * limit;
};

/** Calculate total pages from total items and limit */
export const getTotalPages = (total: number, limit: number): number => {
  return Math.ceil(total / limit);
};

/** Remove undefined/null properties from an object */
export const cleanObject = <T extends Record<string, unknown>>(obj: T): Partial<T> => {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== undefined && value !== null),
  ) as Partial<T>;
};

/** Delay execution (for testing/backoff) */
export const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
