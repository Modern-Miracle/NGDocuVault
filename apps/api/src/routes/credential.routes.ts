// import { Router } from 'express';
// import { CredentialController } from '../controllers/credential.controller';

// const router = Router();
// const credentialController = new CredentialController();

// /**
//  * @route POST /api/v1/credentials/issue
//  * @desc Issue a new verifiable credential
//  */
// router.post('/', credentialController.issueCredential);

// /**
//  * @route GET /api/v1/credentials/:id
//  * @desc Get a specific credential
//  */
// router.get('/:id', credentialController.getCredential);

// /**
//  * @route POST /api/v1/credentials/verify
//  * @desc Verify a credential
//  */
// router.post('/verify', credentialController.verifyCredential);

// /**
//  * @route GET /api/v1/credentials
//  * @desc Get all credentials
//  */
// router.get('/', credentialController.getCredentials);

// /**
//  * @route DELETE /api/v1/credentials/:id
//  * @desc Revoke a credential
//  */
// router.delete('/:id', credentialController.revokeCredential);

// export const credentialRouter: Router = router;
