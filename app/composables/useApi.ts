import type { MaybeRefOrGetter } from 'vue';

interface UseApiOptions {
  query?: MaybeRefOrGetter<Record<string, unknown> | undefined>;
}

/**
 * Lazy, reactive GET on the Laravel API with the sanctum client.
 * (useSanctumFetch needs Nuxt >= 4.4, the project is on 4.3.)
 * The request is replayed whenever the url or the query changes.
 */
export function useApi<T>(url: MaybeRefOrGetter<string>, options: UseApiOptions = {}) {
  const client = useSanctumClient();

  return useAsyncData<T>(
    () => `api:${toValue(url)}:${JSON.stringify(toValue(options.query) ?? {})}`,
    () => client<T>(toValue(url), { query: toValue(options.query) }),
    { lazy: true }
  );
}
