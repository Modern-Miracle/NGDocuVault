// import { Router } from 'express';
// import { DidController } from '../controllers/did.controller';

// const router = Router();
// const didController = new DidController();

// /**
//  * @route POST /api/v1/did
//  * @desc Create a new DID
//  */
// router.post('/', didController.createDid);

// /**
//  * @route GET /api/v1/did/:did
//  * @desc Resolve a DID
//  */
// router.get('/:did', didController.resolveDid);

// /**
//  * @route GET /api/v1/did/:did/document
//  * @desc Get DID Document
//  */
// router.get('/:did/document', didController.getDidDocument);

// /**
//  * @route PUT /api/v1/did/:did
//  * @desc Update DID Document
//  */
// router.put('/:did', didController.updateDidDocument);

// /**
//  * @route PUT /api/v1/did/:did/publicKey
//  * @desc Update DID Public Key
//  */
// router.put('/:did/publicKey', didController.updatePublicKey);

// /**
//  * @route DELETE /api/v1/did/:did
//  * @desc Deactivate a DID
//  */
// router.delete('/:did', didController.deactivateDid);

// /**
//  * @route GET /api/v1/did/address/:address
//  * @desc Get a DID by address
//  */
// router.get('/address/:address', didController.getDidByAddress);

// export const didRouter: Router = router;
