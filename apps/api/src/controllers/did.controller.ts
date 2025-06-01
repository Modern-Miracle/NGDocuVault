// import { Request, Response, NextFunction } from 'express';
// import { AlastriaDid } from '../lib/did-document';
// import { AlastriaDidResolver } from '../lib/resolver';
// import { Resolver } from 'did-resolver';
// import { BlockchainManager } from '../lib/blockchain';
// import { config } from '../config/blockchain.config';
// import { ethers } from 'ethers';
// import {
//   ValidationError,
//   BlockchainError,
//   NotFoundError,
//   AuthorizationError
// } from '../utils/errors';
// import { logger } from '../utils/logger';

// /**
//  * Controller for managing Decentralized Identifiers (DIDs)
//  *
//  * This controller provides endpoints to create, retrieve, update, and deactivate
//  * DIDs on the blockchain. It uses the Alastria DID method specification.
//  */
// export class DidController {
//   private resolver: Resolver;
//   private blockchainManager: BlockchainManager;

//   /**
//    * Creates a new instance of the DID controller
//    *
//    * @param blockchainManager - Optional blockchain manager instance for dependency injection
//    * @param resolver - Optional DID resolver instance for dependency injection
//    */
//   constructor(blockchainManager?: BlockchainManager, resolver?: Resolver) {
//     if (blockchainManager && resolver) {
//       this.blockchainManager = blockchainManager;
//       this.resolver = resolver;
//     } else {
//       const alastriaResolver = new AlastriaDidResolver();
//       this.resolver = new Resolver(alastriaResolver.getResolver());
//       this.blockchainManager = new BlockchainManager();
//     }
//   }

//   /**
//    * Creates a new DID on the blockchain
//    *
//    * @param req - Express request object with optional network parameter in body
//    * @param res - Express response object
//    * @param next - Express next function
//    * @returns Promise<void>
//    * @throws BlockchainError if the DID creation fails on the blockchain
//    */
//   public createDid = async (
//     req: Request,
//     res: Response,
//     next: NextFunction
//   ): Promise<void> => {
//     try {
//       const { network = 'local', address } = req.body;

//       if (!address) {
//         throw new ValidationError('Wallet address is required to create a DID');
//       }

//       logger.debug(
//         `Creating new DID on network: ${network} for address: ${address}`
//       );

//       // Use the provided address to create the DID
//       const did = new AlastriaDid(network, undefined, address);

//       const signer = new ethers.Wallet(
//         config.privateKey,
//         this.blockchainManager.getProvider()
//       );

//       try {
//         const tx = await this.blockchainManager.registerDid(did, signer);
//         await tx.wait();

//         logger.info(`DID created successfully: ${did.getDid()}`);
//         res.status(201).json({
//           success: true,
//           data: {
//             did: did.getDid(),
//             document: did.getDidDocument(),
//             transaction: tx.hash
//           }
//         });
//       } catch (error: any) {
//         throw new BlockchainError(`Failed to register DID: ${error.message}`);
//       }
//     } catch (error) {
//       next(error);
//     }
//   };

//   /**
//    * Resolves a DID to retrieve its full resolution result
//    *
//    * @param req - Express request object with DID as a path parameter
//    * @param res - Express response object
//    * @param next - Express next function
//    * @returns Promise<void>
//    * @throws NotFoundError if the DID cannot be resolved
//    */
//   public resolveDid = async (
//     req: Request,
//     res: Response,
//     next: NextFunction
//   ): Promise<void> => {
//     try {
//       const { did } = req.params;
//       logger.debug(`Resolving DID: ${did}`);

//       try {
//         const resolution = await this.resolver.resolve(did);

//         if (resolution.didResolutionMetadata.error) {
//           logger.warn(
//             `DID resolution failed: ${did}`,
//             resolution.didResolutionMetadata
//           );
//           throw new NotFoundError(`DID ${did}`);
//         }

//         logger.debug(`DID resolved successfully: ${did}`);
//         res.json({
//           success: true,
//           data: resolution
//         });
//       } catch (error: any) {
//         if (error instanceof NotFoundError) {
//           throw error;
//         }
//         throw new BlockchainError(`Failed to resolve DID: ${error.message}`);
//       }
//     } catch (error) {
//       next(error);
//     }
//   };

//   public getDidDocument = async (
//     req: Request,
//     res: Response,
//     next: NextFunction
//   ): Promise<void> => {
//     try {
//       const { did } = req.params;
//       const resolution = await this.resolver.resolve(did);

//       if (resolution.didResolutionMetadata.error) {
//         res.status(404).json({
//           success: false,
//           error: resolution.didResolutionMetadata
//         });
//         return;
//       }

//       res.json({
//         success: true,
//         data: resolution.didDocument
//       });
//     } catch (error) {
//       next(error);
//     }
//   };

//   /**
//    * Updates a DID document on the blockchain
//    *
//    * @param req - Express request object with DID as path param and document in body
//    * @param res - Express response object
//    * @param next - Express next function
//    * @returns Promise<void>
//    * @throws ValidationError if document is missing
//    * @throws AuthorizationError if not authorized to update the DID
//    * @throws BlockchainError if the update fails on the blockchain
//    */
//   public updateDidDocument = async (
//     req: Request,
//     res: Response,
//     next: NextFunction
//   ): Promise<void> => {
//     try {
//       const { did } = req.params;
//       const { document } = req.body;

//       if (!document) {
//         throw new ValidationError('Document is required for updating a DID');
//       }

//       logger.debug(`Updating DID document for: ${did}`);

//       // Create DID instance with the existing DID
//       const [, , network, address] = did.split(':');
//       if (!network || !address) {
//         throw new ValidationError('Invalid DID format');
//       }

//       const didInstance = new AlastriaDid(network, undefined, address); // Pass the existing address

//       // Use the configured private key for signing
//       const signer = new ethers.Wallet(
//         config.privateKey,
//         this.blockchainManager.getProvider()
//       );

//       // First verify ownership
//       try {
//         const isOwner = await this.blockchainManager.isOwner(
//           did,
//           signer.address
//         );
//         if (!isOwner) {
//           throw new AuthorizationError(`Not authorized to update DID ${did}`);
//         }
//       } catch (error: any) {
//         if (error instanceof AuthorizationError) {
//           throw error;
//         }
//         throw new BlockchainError(
//           `Failed to verify DID ownership: ${error.message}`
//         );
//       }

//       try {
//         const tx = await this.blockchainManager.updateDidDocument(
//           didInstance,
//           document,
//           signer
//         );
//         await tx.wait();

//         logger.info(`DID document updated successfully: ${did}`);
//         res.json({
//           success: true,
//           data: {
//             did,
//             document,
//             transaction: tx.hash
//           }
//         });
//       } catch (error: any) {
//         throw new BlockchainError(
//           `Failed to update DID document: ${error.message}`
//         );
//       }
//     } catch (error) {
//       next(error);
//     }
//   };

//   public updatePublicKey = async (
//     req: Request,
//     res: Response,
//     next: NextFunction
//   ): Promise<void> => {
//     try {
//       const { did } = req.params;
//       const { publicKey } = req.body;

//       if (!publicKey) {
//         res.status(400).json({
//           success: false,
//           error: 'Public key is required'
//         });
//         return;
//       }

//       // Create DID instance with the existing DID
//       const [, , network, address] = did.split(':');
//       const didInstance = new AlastriaDid(network, undefined, address); // Pass the existing address

//       // Use the configured private key for signing
//       const signer = new ethers.Wallet(
//         config.privateKey,
//         this.blockchainManager.getProvider()
//       );

//       // First verify ownership
//       const isOwner = await this.blockchainManager.isOwner(did, signer.address);
//       if (!isOwner) {
//         throw new Error('Not authorized to update this DID');
//       }

//       const tx = await this.blockchainManager.updatePublicKey(
//         didInstance,
//         publicKey,
//         signer
//       );
//       await tx.wait();

//       res.json({
//         success: true,
//         data: {
//           did,
//           publicKey,
//           transaction: tx.hash
//         }
//       });
//     } catch (error) {
//       next(error);
//     }
//   };

//   public deactivateDid = async (
//     req: Request,
//     res: Response,
//     next: NextFunction
//   ): Promise<void> => {
//     try {
//       const { did } = req.params;

//       const signer = new ethers.Wallet(
//         config.privateKey,
//         this.blockchainManager.getProvider()
//       );

//       const tx = await this.blockchainManager.deactivateDid(did, signer);
//       await tx.wait();

//       res.json({
//         success: true,
//         data: {
//           did,
//           transaction: tx.hash,
//           status: 'deactivated'
//         }
//       });
//     } catch (error) {
//       next(error);
//     }
//   };

//   /**
//    * Get DID by address
//    * Resolves an Ethereum address to its associated DID
//    *
//    * @param req - Express request object with address as path parameter
//    * @param res - Express response object
//    * @param next - Express next function
//    */
//   public getDidByAddress = async (
//     req: Request,
//     res: Response,
//     next: NextFunction
//   ): Promise<void> => {
//     try {
//       const { address } = req.params;
//       logger.debug(`Looking up DID for address: ${address}`);

//       try {
//         const did = await this.blockchainManager.addressToDid(address);
//         logger.debug(`Found DID for address ${address}: ${did}`);

//         res.json({
//           success: true,
//           data: {
//             address,
//             did
//           }
//         });
//       } catch (error: any) {
//         // If the address doesn't have a DID, return a 404
//         if (error.message.includes('No DID found for address')) {
//           logger.debug(`No DID found for address: ${address}`);
//           res.status(404).json({
//             success: false,
//             error: {
//               message: `No DID found for address ${address}`
//             }
//           });
//           return;
//         }
//         throw error;
//       }
//     } catch (error) {
//       next(error);
//     }
//   };
// }
