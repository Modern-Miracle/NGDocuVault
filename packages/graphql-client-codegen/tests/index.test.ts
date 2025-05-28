import * as clientExports from '../src';

describe('Package Exports', () => {
  it('should export GraphQL types', () => {
    // Enums
    expect(clientExports.DocumentType).toBeDefined();
    expect(clientExports.ConsentStatus).toBeDefined();

    // Types should be exported (though we can't test type exports directly)
    // We verify by using them in type assertions
    const doc: clientExports.Document = {} as any;
    const issuer: clientExports.Issuer = {} as any;
    const holder: clientExports.Holder = {} as any;

    // Just to avoid unused variable warnings
    expect(doc).toBeDefined();
    expect(issuer).toBeDefined();
    expect(holder).toBeDefined();
  });

  it('should export getSdk function', () => {
    expect(clientExports.getSdk).toBeDefined();
    expect(typeof clientExports.getSdk).toBe('function');
  });

  it('should export utility functions', () => {
    expect(clientExports.createGraphQLClient).toBeDefined();
    expect(typeof clientExports.createGraphQLClient).toBe('function');

    expect(clientExports.formatCacheKey).toBeDefined();
    expect(typeof clientExports.formatCacheKey).toBe('function');
  });

  it('should export constants', () => {
    expect(clientExports.CACHE_KEY_PREFIX).toBeDefined();
    expect(clientExports.CACHE_KEY_PREFIX).toBe('graphql-query');
  });

  it('should not export internal generated files directly', () => {
    // These should not be in the main export
    expect((clientExports as any).graphqlRequest).toBeUndefined();
    expect((clientExports as any).reactQuery).toBeUndefined();
  });

  describe('Re-exported Query types', () => {
    it('should have correct structure for query types', () => {
      // We can't directly test type exports, but we can verify
      // that the module structure allows these imports
      type QueryTypes = {
        GetDocumentsQuery: clientExports.GetDocumentsQuery;
        GetDocumentsQueryVariables: clientExports.GetDocumentsQueryVariables;
        GetDocumentQuery: clientExports.GetDocumentQuery;
        GetDocumentQueryVariables: clientExports.GetDocumentQueryVariables;
        GetDocumentsByHolderQuery: clientExports.GetDocumentsByHolderQuery;
        GetDocumentsByHolderQueryVariables: clientExports.GetDocumentsByHolderQueryVariables;
        GetIssuerQuery: clientExports.GetIssuerQuery;
        GetIssuerQueryVariables: clientExports.GetIssuerQueryVariables;
        GetHolderQuery: clientExports.GetHolderQuery;
        GetHolderQueryVariables: clientExports.GetHolderQueryVariables;
        GetDocumentsCountQuery: clientExports.GetDocumentsCountQuery;
        GetIssuersQuery: clientExports.GetIssuersQuery;
        GetIssuersQueryVariables: clientExports.GetIssuersQueryVariables;
      };

      // This verifies the types are exported correctly at compile time
      const _typeCheck: QueryTypes = {} as any;
      expect(_typeCheck).toBeDefined();
    });
  });
});