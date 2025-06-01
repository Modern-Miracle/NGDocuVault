export interface CredentialSubject {
  id: string;
  [key: string]: any;
}

export interface VerifiableCredential {
  '@context': string[];
  id: string;
  type: string[];
  issuer: string;
  issuanceDate: string;
  expirationDate?: string;
  credentialSubject: {
    id: string;
    [key: string]: any;
  };
  proof?: CredentialProof;
  [key: string]: any;
}

export interface CredentialProof {
  type: string;
  created: string;
  proofPurpose: string;
  verificationMethod: string;
  jws: string;
  signature?: string;
  [key: string]: any;
}

export interface CredentialStatus {
  id: string;
  type: string;
  status: 'active' | 'revoked';
  statusDate: string;
}

export interface CreateCredentialOptions {
  type: string[];
  subject: CredentialSubject;
  expirationDate?: string;
  status?: CredentialStatus;
}

export interface CreateCredentialParams {
  subject: string;
  type: string[];
  claims: Record<string, any>;
}

/**
 * Represents the purpose result in a verification result.
 */
export interface PurposeResult {
  valid: boolean;
  error?: string;
}

/**
 * Represents a single verification result.
 */
export interface VerificationResult {
  proof: CredentialProof;
  verified: boolean;
  purposeResult: PurposeResult;
  error?: string;
}

/**
 * Represents the complete verification result.
 */
export interface VerificationResults {
  verified: boolean;
  results: VerificationResult[];
  error?: string;
}

/**
 * Request to verify a Verifiable Credential.
 */
export interface VerifyCredentialRequest {
  credential: VerifiableCredential;
}

/**
 * Response from verifying a Verifiable Credential.
 */
export interface VerifyCredentialResponse {
  verified: boolean;
  results: VerificationResult[];
  error?: string;
}

/**
 * Request to issue a Verifiable Credential.
 */
export interface IssueCredentialRequest {
  issuer: string;
  subject: string;
  type: string[];
  claims: Record<string, any>;
  expirationDate?: string;
}

/**
 * Response from issuing a Verifiable Credential.
 */
export interface IssueCredentialResponse {
  credential: VerifiableCredential;
}
