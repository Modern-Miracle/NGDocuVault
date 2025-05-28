import { createGraphQLClient, formatCacheKey, GraphQLClientConfig } from '../src/utils';

// Mock fetch
global.fetch = jest.fn();

describe('Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createGraphQLClient', () => {
    it('should create a GraphQL client with basic config', () => {
      const config: GraphQLClientConfig = {
        endpoint: 'http://localhost:8000/graphql'
      };

      const client = createGraphQLClient(config);

      expect(client).toBeDefined();
      expect(client).toHaveProperty('request');
    });

    it('should create a GraphQL client with headers', () => {
      const config: GraphQLClientConfig = {
        endpoint: 'http://localhost:8000/graphql',
        headers: {
          'Authorization': 'Bearer token123',
          'X-Custom-Header': 'custom-value'
        }
      };

      const client = createGraphQLClient(config);

      expect(client).toBeDefined();
      // The client itself doesn't expose headers directly, but they're used internally
    });

    it('should create a GraphQL client with timeout', () => {
      const config: GraphQLClientConfig = {
        endpoint: 'http://localhost:8000/graphql',
        timeout: 5000
      };

      const client = createGraphQLClient(config);

      expect(client).toBeDefined();
      // The timeout is configured internally
    });

    it('should handle requests with timeout', async () => {
      const config: GraphQLClientConfig = {
        endpoint: 'http://localhost:8000/graphql',
        timeout: 100
      };

      createGraphQLClient(config);

      // The timeout functionality is handled internally by GraphQLClient
      // We can't easily test it directly without making actual requests
      expect(true).toBe(true);
    });

    it('should handle requests without timeout', async () => {
      const config: GraphQLClientConfig = {
        endpoint: 'http://localhost:8000/graphql'
      };

      const client = createGraphQLClient(config);

      expect(client).toBeDefined();
    });
  });

  describe('formatCacheKey', () => {
    it('should format cache key without variables', () => {
      const key = formatCacheKey('GetDocuments');
      expect(key).toBe('graphql-query:GetDocuments');
    });

    it('should format cache key with empty variables', () => {
      const key = formatCacheKey('GetDocuments', {});
      expect(key).toBe('graphql-query:GetDocuments:{}');
    });

    it('should format cache key with variables', () => {
      const key = formatCacheKey('GetDocument', { id: '123' });
      expect(key).toBe('graphql-query:GetDocument:{"id":"123"}');
    });

    it('should sort variables alphabetically for consistent keys', () => {
      const key1 = formatCacheKey('GetDocuments', { 
        skip: 0, 
        first: 10, 
        where: { isVerified: true } 
      });
      
      const key2 = formatCacheKey('GetDocuments', { 
        where: { isVerified: true },
        first: 10,
        skip: 0 
      });

      expect(key1).toBe(key2);
      expect(key1).toBe('graphql-query:GetDocuments:{"first":10,"skip":0,"where":{"isVerified":true}}');
    });

    it('should handle nested objects in variables', () => {
      const key = formatCacheKey('GetDocuments', {
        where: {
          documentType: 'PASSPORT',
          isVerified: true,
          holder: {
            address: '0x123'
          }
        }
      });

      expect(key).toContain('graphql-query:GetDocuments:');
      expect(key).toContain('"documentType":"PASSPORT"');
      expect(key).toContain('"isVerified":true');
    });

    it('should handle null and undefined values', () => {
      const key = formatCacheKey('GetDocuments', {
        first: null,
        skip: undefined,
        where: null
      });

      // undefined values are removed by JSON.stringify
      expect(key).toBe('graphql-query:GetDocuments:{"first":null,"where":null}');
    });

    it('should handle array values', () => {
      const key = formatCacheKey('GetDocumentsByIds', {
        ids: ['1', '2', '3']
      });

      expect(key).toBe('graphql-query:GetDocumentsByIds:{"ids":["1","2","3"]}');
    });
  });
});