import { resolvers } from '../src/resolvers';
import { GraphQLContext } from '../src/types';
import { ConsentStatus, DocumentType } from '../src/generated/graphql';

// Mock context
const mockContext: GraphQLContext = {
  dataSources: {
    documents: {
      getDocumentById: jest.fn(),
      getDocuments: jest.fn(),
      getDocumentsByHolder: jest.fn(),
      getDocumentsCount: jest.fn()
    },
    issuers: {
      getIssuerById: jest.fn(),
      getIssuers: jest.fn(),
      getIssuersCount: jest.fn()
    },
    holders: {
      getHolderById: jest.fn(),
      getHolders: jest.fn(),
      getHoldersCount: jest.fn()
    },
    dids: {
      getDIDById: jest.fn(),
      getDIDs: jest.fn()
    },
    verifiers: {
      getVerifierById: jest.fn(),
      getVerifiers: jest.fn()
    }
  }
};

describe('Resolvers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Query Resolvers', () => {
    describe('document', () => {
      it('should fetch document by id', async () => {
        const mockDocument = {
          id: '1',
          documentId: '0xabc',
          issuer: { id: '1' },
          holder: { id: '2' },
          issuanceDate: '1234567890',
          expirationDate: '9876543210',
          isVerified: true,
          documentType: DocumentType.Passport,
          shareRequests: [],
          verificationRequests: [],
          isExpired: false,
          registeredAt: '1234567890',
          updates: []
        };

        mockContext.dataSources.documents.getDocumentById = jest.fn().mockResolvedValue(mockDocument);

        const result = await resolvers.Query.document(
          {},
          { id: '1' },
          mockContext,
          {} as any
        );

        expect(result).toEqual(mockDocument);
        expect(mockContext.dataSources.documents.getDocumentById).toHaveBeenCalledWith('1');
      });

      it('should return null if document not found', async () => {
        mockContext.dataSources.documents.getDocumentById = jest.fn().mockResolvedValue(null);

        const result = await resolvers.Query.document(
          {},
          { id: 'nonexistent' },
          mockContext,
          {} as any
        );

        expect(result).toBeNull();
      });
    });

    describe('documents', () => {
      it('should fetch documents with pagination', async () => {
        const mockDocuments = [
          {
            id: '1',
            documentId: '0xabc',
            documentType: DocumentType.IdCard,
            isVerified: true
          },
          {
            id: '2',
            documentId: '0xdef',
            documentType: DocumentType.Passport,
            isVerified: false
          }
        ];

        mockContext.dataSources.documents.getDocuments = jest.fn().mockResolvedValue(mockDocuments);

        const result = await resolvers.Query.documents(
          {},
          { first: 10, skip: 0 },
          mockContext,
          {} as any
        );

        expect(result).toEqual(mockDocuments);
        expect(mockContext.dataSources.documents.getDocuments).toHaveBeenCalledWith({
          first: 10,
          skip: 0,
          where: undefined
        });
      });

      it('should filter documents by criteria', async () => {
        const mockDocuments = [{
          id: '1',
          documentId: '0xabc',
          documentType: DocumentType.IdCard,
          isVerified: true
        }];

        mockContext.dataSources.documents.getDocuments = jest.fn().mockResolvedValue(mockDocuments);

        const result = await resolvers.Query.documents(
          {},
          { 
            first: 10, 
            skip: 0,
            where: {
              documentType: DocumentType.IdCard,
              isVerified: true
            }
          },
          mockContext,
          {} as any
        );

        expect(result).toEqual(mockDocuments);
        expect(mockContext.dataSources.documents.getDocuments).toHaveBeenCalledWith({
          first: 10,
          skip: 0,
          where: {
            documentType: DocumentType.IdCard,
            isVerified: true
          }
        });
      });
    });

    describe('issuer', () => {
      it('should fetch issuer by id', async () => {
        const mockIssuer = {
          id: '1',
          address: '0x123',
          isActive: true,
          registeredAt: '1234567890',
          documents: []
        };

        mockContext.dataSources.issuers.getIssuerById = jest.fn().mockResolvedValue(mockIssuer);

        const result = await resolvers.Query.issuer(
          {},
          { id: '1' },
          mockContext,
          {} as any
        );

        expect(result).toEqual(mockIssuer);
        expect(mockContext.dataSources.issuers.getIssuerById).toHaveBeenCalledWith('1');
      });
    });

    describe('holder', () => {
      it('should fetch holder by id', async () => {
        const mockHolder = {
          id: '1',
          address: '0x456',
          documents: [],
          shareRequests: [],
          verificationRequests: []
        };

        mockContext.dataSources.holders.getHolderById = jest.fn().mockResolvedValue(mockHolder);

        const result = await resolvers.Query.holder(
          {},
          { id: '1' },
          mockContext,
          {} as any
        );

        expect(result).toEqual(mockHolder);
        expect(mockContext.dataSources.holders.getHolderById).toHaveBeenCalledWith('1');
      });
    });

    describe('documentsCount', () => {
      it('should return total documents count', async () => {
        mockContext.dataSources.documents.getDocumentsCount = jest.fn().mockResolvedValue(42);

        const result = await resolvers.Query.documentsCount(
          {},
          {},
          mockContext,
          {} as any
        );

        expect(result).toBe(42);
        expect(mockContext.dataSources.documents.getDocumentsCount).toHaveBeenCalled();
      });
    });

    describe('issuersCount', () => {
      it('should return total issuers count', async () => {
        mockContext.dataSources.issuers.getIssuersCount = jest.fn().mockResolvedValue(10);

        const result = await resolvers.Query.issuersCount(
          {},
          {},
          mockContext,
          {} as any
        );

        expect(result).toBe(10);
        expect(mockContext.dataSources.issuers.getIssuersCount).toHaveBeenCalled();
      });
    });

    describe('holdersCount', () => {
      it('should return total holders count', async () => {
        mockContext.dataSources.holders.getHoldersCount = jest.fn().mockResolvedValue(100);

        const result = await resolvers.Query.holdersCount(
          {},
          {},
          mockContext,
          {} as any
        );

        expect(result).toBe(100);
        expect(mockContext.dataSources.holders.getHoldersCount).toHaveBeenCalled();
      });
    });

    describe('did', () => {
      it('should fetch DID by id', async () => {
        const mockDID = {
          id: '1',
          did: 'did:example:123',
          active: true,
          controller: '0x123',
          lastUpdated: '1234567890',
          credentials: [],
          roles: []
        };

        mockContext.dataSources.dids.getDIDById = jest.fn().mockResolvedValue(mockDID);

        const result = await resolvers.Query.did(
          {},
          { id: '1' },
          mockContext,
          {} as any
        );

        expect(result).toEqual(mockDID);
        expect(mockContext.dataSources.dids.getDIDById).toHaveBeenCalledWith('1');
      });
    });

    describe('verifier', () => {
      it('should fetch verifier by id', async () => {
        const mockVerifier = {
          id: '1',
          address: '0x789',
          verifierType: 'AgeVerifier',
          owner: '0x123',
          createdAt: '1234567890',
          verifications: []
        };

        mockContext.dataSources.verifiers.getVerifierById = jest.fn().mockResolvedValue(mockVerifier);

        const result = await resolvers.Query.verifier(
          {},
          { id: '1' },
          mockContext,
          {} as any
        );

        expect(result).toEqual(mockVerifier);
        expect(mockContext.dataSources.verifiers.getVerifierById).toHaveBeenCalledWith('1');
      });
    });
  });

  describe('Mutation Resolvers', () => {
    describe('ping', () => {
      it('should return pong', async () => {
        const result = await resolvers.Mutation.ping(
          {},
          {},
          mockContext,
          {} as any
        );

        expect(result).toBe('pong');
      });
    });
  });

  describe('Field Resolvers', () => {
    describe('Document', () => {
      it('should return issuer if already loaded as object', async () => {
        const mockIssuer = { id: '1', address: '0x123' };
        const document = { issuer: mockIssuer };

        const result = await resolvers.Document.issuer(
          document as any,
          {},
          mockContext,
          {} as any
        );

        expect(result).toBe(mockIssuer);
        expect(mockContext.dataSources.issuers.getIssuerById).not.toHaveBeenCalled();
      });

      it('should return issuer ID as-is when it is a string', async () => {
        const document = { issuer: '1' };

        const result = await resolvers.Document.issuer(
          document as any,
          {},
          mockContext,
          {} as any
        );

        // The resolver returns the string ID as-is due to the if (parent.issuer) check
        expect(result).toBe('1');
        expect(mockContext.dataSources.issuers.getIssuerById).not.toHaveBeenCalled();
      });

      it('should return holder if already loaded as object', async () => {
        const mockHolder = { id: '2', address: '0x456' };
        const document = { holder: mockHolder };

        const result = await resolvers.Document.holder(
          document as any,
          {},
          mockContext,
          {} as any
        );

        expect(result).toBe(mockHolder);
        expect(mockContext.dataSources.holders.getHolderById).not.toHaveBeenCalled();
      });

      it('should return holder ID as-is when it is a string', async () => {
        const document = { holder: '2' };

        const result = await resolvers.Document.holder(
          document as any,
          {},
          mockContext,
          {} as any
        );

        // The resolver returns the string ID as-is due to the if (parent.holder) check
        expect(result).toBe('2');
        expect(mockContext.dataSources.holders.getHolderById).not.toHaveBeenCalled();
      });
    });

    describe('Holder', () => {
      it('should resolve documents field with pagination', async () => {
        const mockDocuments = [
          {
            id: '1',
            documentId: '0xabc',
            holderId: '1'
          }
        ];

        mockContext.dataSources.documents.getDocumentsByHolder = jest.fn().mockResolvedValue(mockDocuments);

        const holder = { id: '1' };
        const result = await resolvers.Holder.documents(
          holder as any,
          { first: 10, skip: 0 },
          mockContext,
          {} as any
        );

        expect(result).toEqual(mockDocuments);
        expect(mockContext.dataSources.documents.getDocumentsByHolder).toHaveBeenCalledWith('1', 10, 0);
      });

      it('should use default values for pagination', async () => {
        const mockDocuments = [];

        mockContext.dataSources.documents.getDocumentsByHolder = jest.fn().mockResolvedValue(mockDocuments);

        const holder = { id: '1' };
        const result = await resolvers.Holder.documents(
          holder as any,
          {},
          mockContext,
          {} as any
        );

        expect(result).toEqual(mockDocuments);
        expect(mockContext.dataSources.documents.getDocumentsByHolder).toHaveBeenCalledWith('1', 10, 0);
      });
    });
  });
});