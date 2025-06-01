// import { ethers } from 'ethers';
// import { DidDocument } from './did-document';
// import {
//   VerifiableCredential,
//   CreateCredentialParams,
//   CredentialProof
// } from '../types/credential';
// import { logger } from '../utils/logger';

// export class CredentialManager {
//   private readonly issuerDid: DidDocument;

//   constructor(issuerDid: DidDocument) {
//     this.issuerDid = issuerDid;
//   }

//   public async issueCredential(
//     params: CreateCredentialParams
//   ): Promise<VerifiableCredential> {
//     const { subject, type, claims } = params;

//     try {
//       // Create base credential
//       const credential: Omit<VerifiableCredential, 'proof'> = {
//         '@context': [
//           'https://www.w3.org/2018/credentials/v1',
//           'https://www.w3.org/2018/credentials/examples/v1'
//         ],
//         id: this.generateCredentialId({ subject, claims }),
//         type: ['VerifiableCredential', ...type],
//         issuer: this.issuerDid.getDid(),
//         issuanceDate: new Date().toISOString(),
//         credentialSubject: {
//           id: subject,
//           ...claims
//         }
//       };

//       const proof = await this.createProof(credential);

//       // Create a complete VerifiableCredential with all required properties
//       const verifiableCredential = {
//         ...credential,
//         proof
//       } as VerifiableCredential;

//       return verifiableCredential;
//     } catch (error) {
//       logger.error('Error issuing credential:', error);
//       throw new Error('Failed to issue credential');
//     }
//   }

//   public async verifyCredential(
//     credential: VerifiableCredential
//   ): Promise<boolean> {
//     try {
//       if (!this.isValidCredential(credential)) {
//         return false;
//       }

//       const { proof, ...credentialWithoutProof } = credential;
//       const message = this.createSigningMessage(credentialWithoutProof);
//       const recoveredAddr = this.recoverSignerAddress(
//         message,
//         proof?.jws || ''
//       );
//       const issuerAddr = this.extractAddressFromDid(credential.issuer);

//       return recoveredAddr.toLowerCase() === issuerAddr.toLowerCase();
//     } catch (error) {
//       logger.error('Verification error:', error);
//       return false;
//     }
//   }

//   private generateCredentialId(params: {
//     subject: string;
//     claims: any;
//   }): string {
//     return ethers.keccak256(
//       ethers.toUtf8Bytes(JSON.stringify({ ...params, timestamp: Date.now() }))
//     );
//   }

//   private async createProof(
//     credential: Omit<VerifiableCredential, 'proof'>
//   ): Promise<CredentialProof> {
//     const message = this.createSigningMessage(credential);
//     const signer = new ethers.Wallet(this.issuerDid.getPrivateKey());
//     const signature = await signer.signMessage(ethers.getBytes(message));

//     return {
//       type: 'EcdsaSecp256k1Signature2019',
//       created: new Date().toISOString(),
//       proofPurpose: 'assertionMethod',
//       verificationMethod: `${credential.issuer}#keys-1`,
//       jws: signature
//     };
//   }

//   private createSigningMessage(data: any): string {
//     return ethers.keccak256(ethers.toUtf8Bytes(JSON.stringify(data)));
//   }

//   private recoverSignerAddress(message: string, signature: string): string {
//     return ethers.verifyMessage(ethers.getBytes(message), signature);
//   }

//   private extractAddressFromDid(did: string): string {
//     const [, , , address] = did.split(':');
//     return address;
//   }

//   private isValidCredential(credential: VerifiableCredential): boolean {
//     return !!(
//       credential?.proof?.jws &&
//       credential.issuer &&
//       credential.credentialSubject?.id
//     );
//   }
// }
