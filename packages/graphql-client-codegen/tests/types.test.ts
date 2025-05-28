import {
  DocumentType,
  ConsentStatus,
  Document,
  Issuer,
  Holder,
  GetDocumentsQuery,
  GetDocumentsQueryVariables,
  GetDocumentQuery,
  GetDocumentQueryVariables
} from '../src';

describe('Generated Types', () => {
  describe('Enums', () => {
    it('should export DocumentType enum', () => {
      expect(DocumentType.Generic).toBe('GENERIC');
      expect(DocumentType.BirthCertificate).toBe('BIRTH_CERTIFICATE');
      expect(DocumentType.DeathCertificate).toBe('DEATH_CERTIFICATE');
      expect(DocumentType.MarriageCertificate).toBe('MARRIAGE_CERTIFICATE');
      expect(DocumentType.IdCard).toBe('ID_CARD');
      expect(DocumentType.Passport).toBe('PASSPORT');
      expect(DocumentType.Other).toBe('OTHER');
    });

    it('should export ConsentStatus enum', () => {
      expect(ConsentStatus.Pending).toBe('PENDING');
      expect(ConsentStatus.Granted).toBe('GRANTED');
      expect(ConsentStatus.Rejected).toBe('REJECTED');
    });
  });

  describe('Type Interfaces', () => {
    it('should correctly type Document', () => {
      const doc: Document = {
        id: '1',
        documentId: '0xabc',
        issuer: {
          id: '1',
          address: '0x123',
          isActive: true,
          registeredAt: '1234567890',
          documents: []
        },
        holder: {
          id: '2',
          address: '0x456',
          documents: [],
          shareRequests: [],
          verificationRequests: []
        },
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

      expect(doc.id).toBe('1');
      expect(doc.documentType).toBe(DocumentType.Passport);
      expect(doc.isVerified).toBe(true);
    });

    it('should correctly type Issuer', () => {
      const issuer: Issuer = {
        id: '1',
        address: '0x123',
        isActive: true,
        registeredAt: '1234567890',
        documents: []
      };

      expect(issuer.id).toBe('1');
      expect(issuer.isActive).toBe(true);
    });

    it('should correctly type Holder', () => {
      const holder: Holder = {
        id: '1',
        address: '0x456',
        documents: [],
        shareRequests: [],
        verificationRequests: []
      };

      expect(holder.id).toBe('1');
      expect(holder.documents).toEqual([]);
    });
  });

  describe('Query Types', () => {
    it('should correctly type GetDocumentsQuery', () => {
      const queryResult: GetDocumentsQuery = {
        documents: [
          {
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
            },
            issuanceDate: '1234567890',
            expirationDate: '9876543210',
            shareRequests: [],
            verificationRequests: [],
            isExpired: false,
            registeredAt: '1234567890',
            updates: []
          }
        ]
      };

      expect(queryResult.documents).toHaveLength(1);
      expect(queryResult.documents?.[0].documentType).toBe(DocumentType.IdCard);
    });

    it('should correctly type GetDocumentsQueryVariables', () => {
      const variables: GetDocumentsQueryVariables = {
        first: 10,
        skip: 0,
        where: {
          documentType: DocumentType.Passport,
          isVerified: true
        }
      };

      expect(variables.first).toBe(10);
      expect(variables.where?.documentType).toBe(DocumentType.Passport);
    });

    it('should correctly type GetDocumentQuery', () => {
      const queryResult: GetDocumentQuery = {
        document: {
          id: '1',
          documentId: '0xabc',
          documentType: DocumentType.BirthCertificate,
          isVerified: false,
          holder: {
            id: '1',
            address: '0x123'
          },
          issuer: {
            id: '2',
            address: '0x456'
          },
          issuanceDate: '1234567890',
          expirationDate: '9876543210',
          shareRequests: [],
          verificationRequests: [],
          isExpired: false,
          registeredAt: '1234567890',
          updates: []
        }
      };

      expect(queryResult.document?.id).toBe('1');
      expect(queryResult.document?.documentType).toBe(DocumentType.BirthCertificate);
    });

    it('should correctly type GetDocumentQueryVariables', () => {
      const variables: GetDocumentQueryVariables = {
        id: '123'
      };

      expect(variables.id).toBe('123');
    });

    it('should handle nullable fields', () => {
      const queryResult: GetDocumentQuery = {
        document: null
      };

      expect(queryResult.document).toBeNull();
    });
  });

  describe('Optional Fields', () => {
    it('should handle optional Issuer fields', () => {
      const issuer: Issuer = {
        id: '1',
        address: '0x123',
        isActive: true,
        registeredAt: '1234567890',
        documents: [],
        activatedAt: '1234567890',
        deactivatedAt: undefined
      };

      expect(issuer.activatedAt).toBe('1234567890');
      expect(issuer.deactivatedAt).toBeUndefined();
    });

    it('should handle optional Document fields', () => {
      const doc: Partial<Document> = {
        id: '1',
        verifiedAt: '1234567890',
        verifiedBy: '0x789'
      };

      expect(doc.verifiedAt).toBe('1234567890');
      expect(doc.verifiedBy).toBe('0x789');
    });
  });
});