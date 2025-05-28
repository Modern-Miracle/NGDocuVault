import { 
  ConsentStatus,
  DocumentType,
  Did,
  Document,
  Holder,
  Issuer,
  Maybe,
  Scalars
} from '../src/generated/graphql';

describe('Generated Types', () => {
  describe('Scalars', () => {
    it('should handle BigInt scalar', () => {
      const bigInt: Scalars['BigInt']['output'] = '123456789';
      expect(typeof bigInt).toBe('string');
    });

    it('should handle Bytes scalar', () => {
      const bytes: Scalars['Bytes']['output'] = '0x1234567890123456789012345678901234567890';
      expect(bytes).toMatch(/^0x[a-fA-F0-9]+$/);
    });

    it('should handle DateTime scalar', () => {
      const dateTime: Scalars['DateTime']['output'] = new Date();
      expect(dateTime).toBeInstanceOf(Date);
    });
  });

  describe('Enums', () => {
    it('should have correct ConsentStatus values', () => {
      expect(ConsentStatus.Pending).toBe('PENDING');
      expect(ConsentStatus.Granted).toBe('GRANTED');
      expect(ConsentStatus.Rejected).toBe('REJECTED');
    });

    it('should have correct DocumentType values', () => {
      expect(DocumentType.Generic).toBe('GENERIC');
      expect(DocumentType.BirthCertificate).toBe('BIRTH_CERTIFICATE');
      expect(DocumentType.DeathCertificate).toBe('DEATH_CERTIFICATE');
      expect(DocumentType.MarriageCertificate).toBe('MARRIAGE_CERTIFICATE');
      expect(DocumentType.IdCard).toBe('ID_CARD');
      expect(DocumentType.Passport).toBe('PASSPORT');
      expect(DocumentType.Other).toBe('OTHER');
    });
  });

  describe('DID Type', () => {
    it('should have correct properties', () => {
      const did: Did = {
        id: '1',
        did: 'did:example:123',
        active: true,
        controller: '0x123',
        lastUpdated: '1234567890',
        credentials: [],
        roles: []
      };

      expect(did.id).toBeDefined();
      expect(did.did).toBeDefined();
      expect(did.active).toBe(true);
      expect(did.controller).toBeDefined();
      expect(did.lastUpdated).toBeDefined();
    });

    it('should accept optional fields', () => {
      const did: Did = {
        id: '1',
        did: 'did:example:123',
        active: true,
        controller: '0x123',
        lastUpdated: '1234567890',
        credentials: [],
        roles: [],
        document: 'some document',
        publicKey: 'public key data'
      };

      expect(did.document).toBe('some document');
      expect(did.publicKey).toBe('public key data');
    });
  });

  describe('Document Type', () => {
    it('should have correct properties', () => {
      const doc: Document = {
        id: '1',
        documentId: '0xabc',
        issuer: {} as Issuer,
        holder: {} as Holder,
        issuanceDate: '1234567890',
        expirationDate: '1234567890',
        isVerified: false,
        documentType: DocumentType.Generic,
        shareRequests: [],
        verificationRequests: [],
        isExpired: false,
        registeredAt: '1234567890',
        updates: []
      };

      expect(doc.id).toBeDefined();
      expect(doc.documentId).toBeDefined();
      expect(doc.isVerified).toBe(false);
      expect(doc.documentType).toBe(DocumentType.Generic);
    });
  });

  describe('Holder Type', () => {
    it('should have correct properties', () => {
      const holder: Holder = {
        id: '1',
        address: '0x123',
        documents: [],
        shareRequests: [],
        verificationRequests: []
      };

      expect(holder.id).toBeDefined();
      expect(holder.address).toBeDefined();
      expect(holder.documents).toBeInstanceOf(Array);
      expect(holder.shareRequests).toBeInstanceOf(Array);
      expect(holder.verificationRequests).toBeInstanceOf(Array);
    });
  });

  describe('Issuer Type', () => {
    it('should have correct properties', () => {
      const issuer: Issuer = {
        id: '1',
        address: '0x123',
        isActive: true,
        registeredAt: '1234567890',
        documents: []
      };

      expect(issuer.id).toBeDefined();
      expect(issuer.address).toBeDefined();
      expect(issuer.isActive).toBe(true);
      expect(issuer.documents).toBeInstanceOf(Array);
    });

    it('should accept optional fields', () => {
      const issuer: Issuer = {
        id: '1',
        address: '0x123',
        isActive: true,
        registeredAt: '1234567890',
        documents: [],
        activatedAt: '1234567890',
        deactivatedAt: '9876543210'
      };

      expect(issuer.activatedAt).toBe('1234567890');
      expect(issuer.deactivatedAt).toBe('9876543210');
    });
  });

  describe('Maybe Type', () => {
    it('should handle nullable values', () => {
      const maybeString: Maybe<string> = null;
      const maybeNumber: Maybe<number> = undefined;
      const maybeValue: Maybe<string> = 'value';

      expect(maybeString).toBeNull();
      expect(maybeNumber).toBeUndefined();
      expect(maybeValue).toBe('value');
    });
  });

  describe('Type relationships', () => {
    it('should properly type nested relationships', () => {
      const holder: Holder = {
        id: '1',
        address: '0x123',
        documents: [],
        shareRequests: [],
        verificationRequests: []
      };

      const issuer: Issuer = {
        id: '2',
        address: '0x456',
        isActive: true,
        registeredAt: '1234567890',
        documents: []
      };

      const document: Document = {
        id: '1',
        documentId: '0xabc',
        issuer: issuer,
        holder: holder,
        issuanceDate: '1234567890',
        expirationDate: '1234567890',
        isVerified: true,
        documentType: DocumentType.IdCard,
        shareRequests: [],
        verificationRequests: [],
        isExpired: false,
        registeredAt: '1234567890',
        updates: []
      };

      expect(document.holder).toBe(holder);
      expect(document.issuer).toBe(issuer);
    });
  });
});