import { GraphQLClient } from 'graphql-request';

/**
 * Config options for creating a GraphQL client
 */
export interface GraphQLClientConfig {
  /**
   * The GraphQL API endpoint URL
   */
  endpoint: string;

  /**
   * Optional headers to include with all requests
   */
  headers?: Record<string, string>;

  /**
   * Optional timeout in milliseconds
   */
  timeout?: number;
}

/**
 * Creates a custom fetch function with timeout support
 */
function createFetchWithTimeout(timeout?: number): typeof fetch {
  return async (input, init) => {
    if (!timeout) {
      return fetch(input, init);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      return await fetch(input, {
        ...init,
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeoutId);
    }
  };
}

/**
 * Creates a GraphQL client configured for use with the Docu API
 *
 * @param config - Client configuration options
 * @returns A configured GraphQLClient instance
 */
export function createGraphQLClient(config: GraphQLClientConfig): GraphQLClient {
  const { endpoint, headers = {}, timeout } = config;

  // Create a new GraphQL client
  const client = new GraphQLClient(endpoint, {
    headers,
    fetch: timeout ? createFetchWithTimeout(timeout) : undefined,
  });

  return client;
}

/**
 * Formats a cache key for a GraphQL query
 *
 * @param queryName - The name of the query
 * @param variables - The variables used in the query
 * @returns A formatted cache key string
 */
export function formatCacheKey(queryName: string, variables?: Record<string, any>): string {
  const prefix = 'graphql-query';

  if (!variables) {
    return `${prefix}:${queryName}`;
  }

  // Sort keys to ensure consistent cache keys
  const sortedVars = Object.keys(variables)
    .sort()
    .reduce(
      (acc, key) => {
        acc[key] = variables[key];
        return acc;
      },
      {} as Record<string, any>
    );

  return `${prefix}:${queryName}:${JSON.stringify(sortedVars)}`;
}
