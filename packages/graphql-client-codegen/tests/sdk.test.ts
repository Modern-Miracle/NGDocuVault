import { getSdk } from '../src/generated/graphql-request';
import { GraphQLClient } from 'graphql-request';
import { DocumentType, ConsentStatus } from '../src/generated/graphql';

// Mock GraphQLClient
jest.mock('graphql-request');

describe('GraphQL SDK', () => {
  let mockClient: any;
  let sdk: ReturnType<typeof getSdk>;

  beforeEach(() => {
    mockClient = {
      request: jest.fn()
    };
    sdk = getSdk(mockClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Query methods', () => {
    describe('GetDocuments', () => {
      it('should call request with correct query and variables', async () => {
        const mockResponse = {
          documents: [
            {
              id: '1',
              documentId: '0xabc',
              documentType: DocumentType.Passport,
              isVerified: true
            }
          ]
        };

        mockClient.request.mockResolvedValue(mockResponse);

        const variables = {
          first: 10,
          skip: 0
        };

        const result = await sdk.GetDocuments(variables);

        expect(mockClient.request).toHaveBeenCalledTimes(1);
        // Check that it was called with a string (the query), variables, and options
        expect(mockClient.request).toHaveBeenCalledWith(
          expect.stringContaining('query GetDocuments'),
          variables,
          expect.any(Object)
        );
        expect(result).toEqual(mockResponse);
      });

      it('should handle empty results', async () => {
        mockClient.request.mockResolvedValue({ documents: [] });

        const result = await sdk.GetDocuments({ first: 10, skip: 0 });

        expect(result.documents).toEqual([]);
      });
    });

    describe('GetDocument', () => {
      it('should fetch single document by id', async () => {
        const mockDocument = {
          document: {
            id: '1',
            documentId: '0xabc',
            documentType: DocumentType.IdCard,
            isVerified: true,
            holder: {
              id: '1',
              address: '0x123'
            },
            issuer: {
              id: '2',
              address: '0x456'
            }
          }
        };

        mockClient.request.mockResolvedValue(mockDocument);

        const result = await sdk.GetDocument({ id: '1' });

        expect(mockClient.request).toHaveBeenCalledWith(
          expect.stringContaining('query GetDocument'),
          { id: '1' },
          expect.any(Object)
        );
        expect(result).toEqual(mockDocument);
      });

      it('should handle null document', async () => {
        mockClient.request.mockResolvedValue({ document: null });

        const result = await sdk.GetDocument({ id: 'nonexistent' });

        expect(result.document).toBeNull();
      });
    });

    describe('GetDocumentsByHolder', () => {
      it('should fetch documents by holder id', async () => {
        const mockDocuments = {
          holder: {
            id: '1',
            documents: [
              {
                id: '1',
                documentId: '0xabc',
                documentType: DocumentType.BirthCertificate
              },
              {
                id: '2',
                documentId: '0xdef',
                documentType: DocumentType.MarriageCertificate
              }
            ]
          }
        };

        mockClient.request.mockResolvedValue(mockDocuments);

        const result = await sdk.GetDocumentsByHolder({
          holderId: '1',
          first: 10,
          skip: 0
        });

        expect(mockClient.request).toHaveBeenCalledWith(
          expect.stringContaining('query GetDocumentsByHolder'),
          { holderId: '1', first: 10, skip: 0 },
          expect.any(Object)
        );
        expect(result.holder?.documents).toHaveLength(2);
      });
    });

    describe('GetIssuer', () => {
      it('should fetch issuer by id', async () => {
        const mockIssuer = {
          issuer: {
            id: '1',
            address: '0x123',
            isActive: true,
            registeredAt: '1234567890',
            documents: []
          }
        };

        mockClient.request.mockResolvedValue(mockIssuer);

        const result = await sdk.GetIssuer({ id: '1' });

        expect(result).toEqual(mockIssuer);
      });
    });

    describe('GetHolder', () => {
      it('should fetch holder by id', async () => {
        const mockHolder = {
          holder: {
            id: '1',
            address: '0x456',
            documents: []
          }
        };

        mockClient.request.mockResolvedValue(mockHolder);

        const result = await sdk.GetHolder({ id: '1' });

        expect(result).toEqual(mockHolder);
      });
    });

    describe('GetDocumentsCount', () => {
      it('should fetch total documents count', async () => {
        const mockCount = {
          documentsCount: 42
        };

        mockClient.request.mockResolvedValue(mockCount);

        const result = await sdk.GetDocumentsCount();

        expect(mockClient.request).toHaveBeenCalledWith(
          expect.stringContaining('query GetDocumentsCount'),
          undefined,
          expect.any(Object)
        );
        expect(result.documentsCount).toBe(42);
      });
    });

    describe('GetIssuers', () => {
      it('should fetch issuers with pagination', async () => {
        const mockIssuers = {
          issuers: [
            { id: '1', address: '0x123', isActive: true },
            { id: '2', address: '0x456', isActive: false }
          ]
        };

        mockClient.request.mockResolvedValue(mockIssuers);

        const result = await sdk.GetIssuers({ first: 10, skip: 0 });

        expect(result.issuers).toHaveLength(2);
      });
    });
  });

  describe('Error handling', () => {
    it('should propagate GraphQL errors', async () => {
      const graphqlError = new Error('GraphQL error: Invalid query');
      mockClient.request.mockRejectedValue(graphqlError);

      await expect(sdk.GetDocument({ id: '1' })).rejects.toThrow('GraphQL error: Invalid query');
    });

    it('should handle network errors', async () => {
      const networkError = new Error('Network error: Failed to fetch');
      mockClient.request.mockRejectedValue(networkError);

      await expect(sdk.GetDocuments({ first: 10, skip: 0 })).rejects.toThrow('Network error: Failed to fetch');
    });
  });

  describe('Integration with real client', () => {
    it('should work with actual GraphQLClient instance', () => {
      // Create a real GraphQLClient instance (mocked in this test)
      const realClient = new GraphQLClient('http://localhost:8000/graphql');
      const realSdk = getSdk(realClient);

      // Verify all methods are available
      expect(typeof realSdk.GetDocuments).toBe('function');
      expect(typeof realSdk.GetDocument).toBe('function');
      expect(typeof realSdk.GetDocumentsByHolder).toBe('function');
      expect(typeof realSdk.GetIssuer).toBe('function');
      expect(typeof realSdk.GetHolder).toBe('function');
      expect(typeof realSdk.GetDocumentsCount).toBe('function');
      expect(typeof realSdk.GetIssuers).toBe('function');
    });
  });
});