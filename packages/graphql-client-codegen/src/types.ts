// Custom types to avoid graphql-request type import issues
export type RequestInit = {
  headers?: Record<string, string>;
};

// Re-export other types that might be needed
export type Variables = Record<string, any>;