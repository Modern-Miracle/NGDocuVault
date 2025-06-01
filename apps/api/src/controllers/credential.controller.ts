// import { Request, Response, NextFunction } from 'express';
// import { AlastriaDid } from '../lib/did-document';
// import { CredentialManager } from '../lib/credential-manager';
// import { VerifiableCredential } from '../types/credential';
// import { config } from '../config/blockchain.config';
// import { logger } from '../utils/logger';

// export class CredentialController {
//   private readonly credentialManager: CredentialManager;
//   private readonly credentials: Map<string, VerifiableCredential>;
//   private readonly issuerDid: AlastriaDid;

//   constructor() {
//     this.issuerDid = new AlastriaDid('local', config.privateKey);
//     this.credentialManager = new CredentialManager(this.issuerDid);
//     this.credentials = new Map();
//   }

//   public issueCredential = async (
//     req: Request,
//     res: Response,
//     next: NextFunction
//   ): Promise<void> => {
//     try {
//       const { subject, type, claims } = req.body;
//       const credential = await this.credentialManager.issueCredential({
//         subject,
//         type,
//         claims
//       });

//       this.credentials.set(credential.id, credential);
//       logger.info(`Issued credential: ${credential.id}`);

//       res.status(201).json({
//         success: true,
//         data: credential
//       });
//     } catch (error) {
//       next(error);
//     }
//   };

//   public getCredential = async (
//     req: Request,
//     res: Response,
//     next: NextFunction
//   ): Promise<void> => {
//     try {
//       const credential = await this.findCredential(req.params.id);
//       res.json({ success: true, data: credential });
//     } catch (error) {
//       next(error);
//     }
//   };

//   public verifyCredential = async (
//     req: Request,
//     res: Response,
//     next: NextFunction
//   ): Promise<void> => {
//     try {
//       const credential = await this.findCredential(req.body.credentialId);
//       const isValid = await this.credentialManager.verifyCredential(credential);

//       res.json({
//         success: true,
//         data: { isValid, credential }
//       });
//     } catch (error) {
//       next(error);
//     }
//   };

//   public getCredentials = async (
//     req: Request,
//     res: Response,
//     next: NextFunction
//   ): Promise<void> => {
//     try {
//       const credentials = this.filterCredentials(req.query);
//       res.json({ success: true, data: credentials });
//     } catch (error) {
//       next(error);
//     }
//   };

//   public revokeCredential = async (
//     req: Request,
//     res: Response,
//     next: NextFunction
//   ): Promise<void> => {
//     try {
//       const { id } = req.params;
//       await this.findCredential(id);

//       this.credentials.delete(id);
//       logger.info(`Revoked credential: ${id}`);

//       res.json({
//         success: true,
//         data: { id, status: 'revoked' }
//       });
//     } catch (error) {
//       next(error);
//     }
//   };

//   private async findCredential(id: string): Promise<VerifiableCredential> {
//     const credential = this.credentials.get(id);
//     if (!credential) {
//       throw new Error('Credential not found');
//     }
//     return credential;
//   }

//   private filterCredentials(query: any): VerifiableCredential[] {
//     let credentials = Array.from(this.credentials.values());

//     if (query.issuer) {
//       credentials = credentials.filter((c) => c.issuer === query.issuer);
//     }
//     if (query.subject) {
//       credentials = credentials.filter(
//         (c) => c.credentialSubject.id === query.subject
//       );
//     }

//     return credentials;
//   }
// }
