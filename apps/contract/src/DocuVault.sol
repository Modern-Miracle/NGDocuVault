// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import {DidAuth} from "./DidAuth.sol";

/**
 * @title DocuVault
 * @dev An optimized contract for document verification with issuer-holder-verifier model
 * @custom:security-contact security@docuvault.com
 */
contract DocuVault is Ownable, Pausable, AccessControl {
    /////////////////////////////////////////////////
    //                ERRORS                       //
    /////////////////////////////////////////////////
    error DocuVault__NotAdmin();
    error DocuVault__NotIssuer();
    error DocuVault__NotActive();
    error DocuVault__NotHolder();
    error DocuVault__InvalidHash();
    error DocuVault__AlreadyRegistered();
    error DocuVault__ZeroAddress();
    error DocuVault__IssuerRegistered();
    error DocuVault__IsActive();
    error DocuVault__AlreadyAdmin();
    error DocuVault__NotRegistered();
    error DocuVault__AlreadyVerified();
    error DocuVault__NotVerified();
    error DocuVault__NotAuthorized();
    error DocuVault__AlreadyGranted();
    error DocuVault__NotGranted();
    error DocuVault__Expired();
    error DocuVault__InvalidDate();
    error DocuVault__InvalidInput();
    error DocuVault__CidMismatch();
    error DocuVault__InvalidDID();
    error DocuVault__NotVerifier();

    /////////////////////////////////////////////////
    //                ENUMS                        //
    /////////////////////////////////////////////////

    enum Consent {
        PENDING,
        GRANTED,
        REJECTED
    }

    enum DocumentType {
        GENERIC,
        BIRTH_CERTIFICATE,
        DEATH_CERTIFICATE,
        MARRIAGE_CERTIFICATE,
        ID_CARD,
        PASSPORT,
        OTHER
    }

    /////////////////////////////////////////////////
    //                DATA STRUCTURES              //
    /////////////////////////////////////////////////

    struct ShareRequest {
        Consent consent;
        uint256 validUntil;
    }

    struct Document {
        address issuer; // Who issued the document
        address holder; // Who owns the document
        uint256 issuanceDate; // When the document was registered
        uint256 expirationDate; // When the document expires
        bool isVerified; // Whether document is verified by issuer
        DocumentType documentType; // Type of the document
    }

    // ========== STORAGE ==========
    // Mapping from document ID to Document struct
    mapping(bytes32 => Document) public documents;

    // List of document IDs for each holder
    mapping(address => bytes32[]) private holderDocuments;

    // Mapping from document ID to requester address to ShareRequest
    mapping(bytes32 => mapping(address => ShareRequest)) public shareRequests;

    // Mapping from DID to address
    DidAuth public didAuth;

    // ========== EVENTS ==========
    event IssuerRegistered(address indexed issuer, uint256 timestamp);
    event AdminRegistered(address indexed admin, uint256 timestamp);
    event VerifierAdded(address indexed verifier, uint256 timestamp);
    event UserRegistered(bytes32 indexed role, string did, uint256 timestamp);

    event DocumentRegistered(
        bytes32 indexed documentId, address indexed issuer, address indexed holder, uint256 timestamp
    );
    event DocumentVerified(bytes32 indexed documentId, address indexed verifier, uint256 timestamp);
    event DocumentBatchVerified(
        bytes32[] indexed documentIds, uint256 count, address indexed verifier, uint256 timestamp
    );
    event IssuerDeactivated(address indexed issuer, uint256 timestamp);
    event IssuerActivated(address indexed issuer, uint256 timestamp);
    event DocumentShared(bytes32 indexed documentId, address indexed holder, uint256 timestamp);
    event VerificationRequested(bytes32 indexed documentId, address indexed holder, uint256 timestamp);
    event ConsentGranted(bytes32 indexed documentId, address indexed requester, uint256 timestamp);
    event ConsentRevoked(bytes32 indexed documentId, address indexed requester, uint256 timestamp);
    event ShareRequested(bytes32 indexed documentId, address indexed requester, uint256 timestamp);
    event DocumentUpdated(
        bytes32 indexed oldDocumentId, bytes32 indexed newDocumentId, address indexed issuer, uint256 timestamp
    );

    /////////////////////////////////////////////////
    //                CONSTRUCTOR                  //
    /////////////////////////////////////////////////

    constructor(address _didAuth) Ownable(msg.sender) {
        // _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        // _grantRole(ADMIN_ROLE, msg.sender);
        didAuth = DidAuth(_didAuth);
        // string memory did = didAuth.getDidFromAddress(msg.sender);

        // didAuth.grantDidRole(did, didAuth.ADMIN_ROLE());
        // didAuth.grantDidRole(did, didAuth.DEFAULT_ADMIN_ROLE());
    }

    /////////////////////////////////////////////////
    //                MODIFIERS                    //
    /////////////////////////////////////////////////
    modifier onlyAdmin() {
        // if (!hasRole(ADMIN_ROLE, msg.sender) && !hasRole(DEFAULT_ADMIN_ROLE, msg.sender)) {
        //     revert DocuVault__NotAdmin();
        // }

        string memory did = didAuth.getDidFromAddress(msg.sender);
        if (bytes(did).length == 0) {
            revert DocuVault__InvalidDID();
        }

        if (!didAuth.hasDidRole(did, didAuth.ADMIN_ROLE())) revert DocuVault__NotAdmin();

        _;
    }

    modifier onlyIssuer() {
        string memory did = didAuth.getDidFromAddress(msg.sender);
        if (bytes(did).length == 0) {
            revert DocuVault__InvalidDID();
        }

        if (!didAuth.hasDidRole(did, didAuth.ISSUER_ROLE())) revert DocuVault__NotIssuer();

        _;
    }

    modifier onlyVerifier() {
        string memory did = didAuth.getDidFromAddress(msg.sender);
        if (bytes(did).length == 0) {
            revert DocuVault__InvalidDID();
        }

        if (!didAuth.hasDidRole(did, didAuth.VERIFIER_ROLE())) revert DocuVault__NotVerifier();

        _;
    }

    modifier onlyHolder(bytes32 documentId) {
        if (documents[documentId].holder != msg.sender) revert DocuVault__NotHolder();
        _;
    }

    modifier onlyVerifiedDocument(bytes32 documentId) {
        Document storage doc = documents[documentId];
        if (!doc.isVerified) {
            revert DocuVault__NotVerified();
        }
        _;
    }

    modifier onlyActiveDocument(bytes32 documentId) {
        if (documents[documentId].expirationDate <= block.timestamp) {
            revert DocuVault__Expired();
        }
        _;
    }

    modifier onlyValidDocument(bytes32 documentId) {
        if (documents[documentId].issuanceDate == 0) {
            revert DocuVault__NotRegistered();
        }
        _;
    }

    /////////////////////////////////////////////////
    //                USER MANAGEMENT             //
    /////////////////////////////////////////////////
    /**
     * @dev Register a new issuer: this can be any issuing government entity
     * @param issuerAddr The address of the issuer to register
     */
    function registerIssuer(address issuerAddr) external whenNotPaused {
        if (issuerAddr == address(0)) revert DocuVault__ZeroAddress();
        // if (hasRole(ISSUER_ROLE, issuerAddr)) revert DocuVault__IssuerRegistered(); // NOTE: this is not needed

        // check if the issuer has a DID
        string memory did = didAuth.getDidFromAddress(issuerAddr);

        if (bytes(did).length == 0) {
            revert DocuVault__InvalidDID();
        }

        // check if the issuer has the ISSUER_ROLE
        if (didAuth.hasDidRole(did, didAuth.ISSUER_ROLE())) {
            revert DocuVault__IssuerRegistered();
        }

        didAuth.grantDidRole(did, didAuth.ISSUER_ROLE());

        // _grantRole(ISSUER_ROLE, issuerAddr); // NOTE:

        emit IssuerRegistered(issuerAddr, block.timestamp);
    }

    /**
     * @dev Deactivate an existing issuer
     * @param issuerAddr The address of the issuer to deactivate
     */
    function deactivateIssuer(address issuerAddr) external onlyAdmin {
        string memory did = didAuth.getDidFromAddress(issuerAddr);
        if (bytes(did).length == 0) {
            revert DocuVault__InvalidDID();
        }

        if (!didAuth.hasDidRole(did, didAuth.ISSUER_ROLE())) revert DocuVault__NotActive();

        didAuth.revokeDidRole(did, didAuth.ISSUER_ROLE());
        // _revokeRole(ISSUER_ROLE, issuerAddr); // NOTE: this is not needed

        emit IssuerDeactivated(issuerAddr, block.timestamp);
    }

    /**
     * @dev Activate an existing issuer
     * @param issuerAddr The address of the issuer to activate
     */
    function activateIssuer(address issuerAddr) external onlyAdmin {
        string memory did = didAuth.getDidFromAddress(issuerAddr);
        if (bytes(did).length == 0) {
            revert DocuVault__InvalidDID();
        }

        if (didAuth.hasDidRole(did, didAuth.ISSUER_ROLE())) revert DocuVault__IsActive();

        didAuth.grantDidRole(did, didAuth.ISSUER_ROLE());
        // _grantRole(ISSUER_ROLE, issuerAddr); // NOTE: this is not needed
        emit IssuerActivated(issuerAddr, block.timestamp);
    }

    /**
     * @dev Add an admin
     * @param adminAddr The address of the admin to add
     */
    function addAdmin(address adminAddr) external onlyAdmin whenNotPaused {
        if (adminAddr == address(0)) revert DocuVault__ZeroAddress();
        // if (hasRole(ADMIN_ROLE, adminAddr)) revert DocuVault__AlreadyAdmin(); // NOTE: this is not needed

        // check if the admin has a DID
        string memory did = didAuth.getDidFromAddress(adminAddr);
        if (bytes(did).length == 0) {
            revert DocuVault__InvalidDID();
        }

        // check if the admin has the ADMIN_ROLE
        if (didAuth.hasDidRole(did, didAuth.ADMIN_ROLE())) {
            revert DocuVault__AlreadyAdmin();
        }

        didAuth.grantDidRole(did, didAuth.ADMIN_ROLE());

        // _grantRole(ADMIN_ROLE, adminAddr); // NOTE: this is not needed

        emit AdminRegistered(adminAddr, block.timestamp);
    }

    /**
     * @dev Remove an admin
     * @param adminAddr The address of the admin to remove
     */
    function removeAdmin(address adminAddr) external onlyAdmin whenNotPaused {
        // if (!hasRole(ADMIN_ROLE, adminAddr)) revert DocuVault__NotAdmin(); // NOTE: this is not needed

        string memory did = didAuth.getDidFromAddress(adminAddr);
        if (bytes(did).length == 0) {
            revert DocuVault__InvalidDID();
        }

        if (!didAuth.hasDidRole(did, didAuth.ADMIN_ROLE())) revert DocuVault__NotAdmin();

        didAuth.revokeDidRole(did, didAuth.ADMIN_ROLE());

        // _revokeRole(ADMIN_ROLE, adminAddr); // NOTE: this is not needed
    }

    /**
     * @dev add verifier role
     * @param verifierAddr The address of the verifier to add
     */
    function addVerifier(address verifierAddr) external whenNotPaused {
        if (verifierAddr == address(0)) revert DocuVault__ZeroAddress();

        // check if the verifier has a DID
        string memory did = didAuth.getDidFromAddress(verifierAddr);
        if (bytes(did).length == 0) {
            revert DocuVault__InvalidDID();
        }

        // check if the verifier has the VERIFIER_ROLE
        if (didAuth.hasDidRole(did, didAuth.VERIFIER_ROLE())) {
            revert DocuVault__AlreadyRegistered();
        }

        didAuth.grantDidRole(did, didAuth.VERIFIER_ROLE());

        // _grantRole(VERIFIER_ROLE, verifierAddr); // NOTE: this is not needed

        emit VerifierAdded(verifierAddr, block.timestamp);
    }

    /**
     * @dev remove verifier role
     * @param verifierAddr The address of the verifier to remove
     */
    function removeVerifier(address verifierAddr) external onlyAdmin whenNotPaused {
        // if (!hasRole(VERIFIER_ROLE, verifierAddr)) revert DocuVault__NotActive();

        string memory did = didAuth.getDidFromAddress(verifierAddr);
        if (bytes(did).length == 0) {
            revert DocuVault__InvalidDID();
        }

        if (!didAuth.hasDidRole(did, didAuth.VERIFIER_ROLE())) revert DocuVault__NotActive();

        didAuth.revokeDidRole(did, didAuth.VERIFIER_ROLE());

        // _revokeRole(VERIFIER_ROLE, verifierAddr); // NOTE: this is not needed
    }

    /**
     * @dev Register a new user and grant the HOLDER_ROLE to the user
     */
    function registerUser() external whenNotPaused {
        string memory did = didAuth.getDidFromAddress(msg.sender);

        if (bytes(did).length == 0) {
            revert DocuVault__InvalidDID();
        }

        // check if the user has the HOLDER_ROLE
        if (didAuth.hasDidRole(did, didAuth.HOLDER_ROLE())) revert DocuVault__AlreadyRegistered();

        didAuth.grantDidRole(did, didAuth.HOLDER_ROLE());

        emit UserRegistered(didAuth.HOLDER_ROLE(), did, block.timestamp);
    }

    /**
     * @dev Remove the HOLDER_ROLE from the user
     */
    function removeUser() external whenNotPaused {
        string memory did = didAuth.getDidFromAddress(msg.sender);
        if (bytes(did).length == 0) {
            revert DocuVault__InvalidDID();
        }

        if (!didAuth.hasDidRole(did, didAuth.HOLDER_ROLE())) revert DocuVault__NotRegistered();

        didAuth.revokeDidRole(did, didAuth.HOLDER_ROLE());
    }

    /////////////////////////////////////////////////
    //             DOCUMENT MANAGEMENT             //
    /////////////////////////////////////////////////
    /**
     * @dev Generate a unique document ID from content hash, holder, and cid
     * @param contentHash The hash of the document content
     * @param holder The address of the document holder
     * @param cid The IPFS CID where the document is stored
     * @return documentId A unique deterministic identifier for the document
     */
    function generateDocumentId(bytes32 contentHash, address holder, string calldata cid)
        public
        pure
        returns (bytes32)
    {
        bytes32 cidHash = keccak256(abi.encodePacked(cid));
        return keccak256(abi.encodePacked(contentHash, holder, cidHash));
    }

    /**
     * @dev Register a new document
     * @param contentHash The hash of the document content for on-chain verification
     * @param cid The IPFS CID where the document is stored
     * @param holder The address of the document holder
     * @param issuanceDate The date when the document was issued (0 to use current timestamp)
     * @param expirationDate The date when the document expires
     * @param documentType The type of the document
     * @return documentId The generated ID for the document
     */
    function registerDocument(
        bytes32 contentHash,
        string calldata cid,
        address holder,
        uint256 issuanceDate,
        uint256 expirationDate,
        DocumentType documentType
    ) external whenNotPaused onlyIssuer returns (bytes32) {
        return _registerDocument(contentHash, cid, holder, issuanceDate, expirationDate, documentType);
    }

    /**
     * @notice Batch processing of document registration
     * @param contentHashes The array of content hashes to register
     * @param cids The array of IPFS CIDs where the documents are stored
     * @param holders The array of holders of the documents
     * @param issuanceDates The array of issuance dates of the documents
     * @param expirationDates The array of expiration dates of the documents
     * @param documentTypes The array of document types
     * @return documentIds Array of generated document IDs
     */
    function registerDocuments(
        bytes32[] calldata contentHashes,
        string[] calldata cids,
        address[] calldata holders,
        uint256[] calldata issuanceDates,
        uint256[] calldata expirationDates,
        DocumentType[] calldata documentTypes
    ) external whenNotPaused onlyIssuer returns (bytes32[] memory) {
        uint256 length = contentHashes.length;
        if (length == 0) revert DocuVault__InvalidInput();

        // Validate that all arrays have the same length
        if (
            length != cids.length || length != holders.length || length != issuanceDates.length
                || length != expirationDates.length || length != documentTypes.length
        ) {
            revert DocuVault__InvalidInput();
        }

        bytes32[] memory documentIds = new bytes32[](length);

        // Process each document
        for (uint256 i = 0; i < length; i++) {
            documentIds[i] = _registerDocument(
                contentHashes[i], cids[i], holders[i], issuanceDates[i], expirationDates[i], documentTypes[i]
            );
        }

        return documentIds;
    }

    /**
     * @dev Internal function to register a document
     * @param contentHash The hash of the document content
     * @param cid The IPFS CID where the document is stored
     * @param holder The address of the document holder
     * @param issuanceDate The issuance date (0 to use current timestamp)
     * @param expirationDate The expiration date
     * @param documentType The type of the document
     * @return documentId The generated ID for the document
     */
    function _registerDocument(
        bytes32 contentHash,
        string calldata cid,
        address holder,
        uint256 issuanceDate,
        uint256 expirationDate,
        DocumentType documentType
    ) internal returns (bytes32) {
        // Validate input parameters
        if (contentHash == bytes32(0) || bytes(cid).length == 0) {
            revert DocuVault__InvalidHash();
        }
        if (holder == address(0)) revert DocuVault__ZeroAddress();

        // Generate document ID
        bytes32 cidHash = keccak256(abi.encodePacked(cid));
        bytes32 documentId = keccak256(abi.encodePacked(contentHash, holder, cidHash));

        // Check if document already exists
        if (documents[documentId].issuanceDate > 0) revert DocuVault__AlreadyRegistered();

        // Set default issuance date if not provided
        uint256 effectiveIssuanceDate = issuanceDate == 0 ? block.timestamp : issuanceDate;

        // Validate dates
        if (expirationDate <= block.timestamp) revert DocuVault__Expired();
        if (expirationDate <= effectiveIssuanceDate) revert DocuVault__InvalidDate();

        // Validate sender authorization
        bool isSenderIssuer = didAuth.hasDidRole(didAuth.getDidFromAddress(msg.sender), didAuth.ISSUER_ROLE());

        if (!isSenderIssuer && msg.sender != holder) revert DocuVault__NotAuthorized();

        // Create document record
        documents[documentId] = Document({
            issuer: msg.sender,
            holder: holder,
            issuanceDate: effectiveIssuanceDate,
            expirationDate: expirationDate,
            isVerified: isSenderIssuer, // auto-verified if issuer registers
            documentType: documentType
        });

        // Add document to holder's document list
        holderDocuments[holder].push(documentId);

        // Emit event
        emit DocumentRegistered(documentId, msg.sender, holder, block.timestamp);

        return documentId;
    }

    /**
     * @dev Update a document with a new version (creates a new document entry)
     * @param oldDocumentId The ID of the document to update
     * @param contentHash The hash of the new document content
     * @param cid The IPFS CID where the new document is stored
     * @param expirationDate The new expiration date of the document
     * @param documentType The type of the document (can be different from original)
     * @return newDocumentId The ID of the new document version
     */
    function updateDocument(
        bytes32 oldDocumentId,
        bytes32 contentHash,
        string calldata cid,
        uint256 expirationDate,
        DocumentType documentType
    ) external onlyValidDocument(oldDocumentId) whenNotPaused onlyIssuer returns (bytes32) {
        // Validate input parameters
        if (contentHash == bytes32(0) || bytes(cid).length == 0) {
            revert DocuVault__InvalidHash();
        }
        if (expirationDate <= block.timestamp) revert DocuVault__Expired();

        Document storage oldDoc = documents[oldDocumentId];

        // Validate sender authorization
        bool isSenderIssuer = didAuth.hasDidRole(didAuth.getDidFromAddress(msg.sender), didAuth.ISSUER_ROLE());
        if (oldDoc.holder != msg.sender && !isSenderIssuer) {
            revert DocuVault__NotAuthorized();
        }

        // Generate new document ID
        bytes32 cidHash = keccak256(abi.encodePacked(cid));
        bytes32 newDocumentId = keccak256(abi.encodePacked(contentHash, oldDoc.holder, cidHash));

        // Check if new document ID already exists
        if (documents[newDocumentId].issuanceDate > 0) revert DocuVault__AlreadyRegistered();

        // Create new document version
        documents[newDocumentId] = Document({
            issuer: msg.sender,
            holder: oldDoc.holder,
            issuanceDate: block.timestamp,
            expirationDate: expirationDate,
            isVerified: isSenderIssuer, // auto-verified if issuer updates
            documentType: documentType
        });

        // Add new document to holder's document list
        holderDocuments[oldDoc.holder].push(newDocumentId);

        // Emit event
        emit DocumentUpdated(oldDocumentId, newDocumentId, msg.sender, block.timestamp);

        return newDocumentId;
    }

    /**
     * @dev Request verification of a document by its issuer
     * @param documentId The ID of the document to verify
     */
    function requestVerification(bytes32 documentId)
        external
        onlyValidDocument(documentId)
        onlyActiveDocument(documentId)
        onlyHolder(documentId)
        whenNotPaused
    {
        Document storage doc = documents[documentId];
        if (doc.isVerified) revert DocuVault__AlreadyVerified();

        emit VerificationRequested(documentId, msg.sender, block.timestamp);
    }

    /**
     * @dev Request to share a document with a third party verifier
     * @param documentId The ID of the document to share
     * @param requester The address of the requester to share the document with
     */
    function requestShare(bytes32 documentId, address requester)
        external
        onlyHolder(documentId)
        onlyValidDocument(documentId)
        onlyActiveDocument(documentId)
    {
        if (requester == address(0)) revert DocuVault__ZeroAddress();

        // Check if there is already a pending or granted request
        ShareRequest storage request = shareRequests[documentId][requester];
        if (request.consent != Consent.PENDING) revert DocuVault__AlreadyGranted();

        // Update the request status
        request.consent = Consent.PENDING;
        request.validUntil = 0; // Reset validity period

        emit ShareRequested(documentId, requester, block.timestamp);
    }

    /**
     * @dev Revoke a previously granted consent
     * @param documentId The ID of the document to revoke consent for
     * @param requester The address of the requester to revoke consent from
     */
    function revokeConsent(bytes32 documentId, address requester)
        external
        onlyHolder(documentId)
        onlyValidDocument(documentId)
    {
        ShareRequest storage request = shareRequests[documentId][requester];
        if (request.consent != Consent.GRANTED) revert DocuVault__NotGranted();

        request.consent = Consent.REJECTED;
        request.validUntil = 0; // Clear the validity period

        emit ConsentRevoked(documentId, requester, block.timestamp);
    }

    /**
     * @dev Grant or reject a consent request for document sharing
     * @param documentId The ID of the document
     * @param requester The address of the requester
     * @param consent The consent status (GRANTED or REJECTED)
     * @param validUntil The timestamp until which the consent is valid (if granted)
     */
    function giveConsent(bytes32 documentId, address requester, Consent consent, uint256 validUntil)
        external
        onlyHolder(documentId)
        onlyValidDocument(documentId)
        onlyActiveDocument(documentId)
    {
        // Consent should be either GRANTED or REJECTED
        if (consent == Consent.PENDING) revert DocuVault__InvalidInput();

        ShareRequest storage request = shareRequests[documentId][requester];

        // Check if the request is already granted
        if (request.consent == Consent.GRANTED) revert DocuVault__AlreadyGranted();

        // Validate validity period if granting consent
        if (consent == Consent.GRANTED) {
            if (validUntil <= block.timestamp) revert DocuVault__InvalidDate();

            // Ensure consent doesn't extend beyond document expiration
            Document storage doc = documents[documentId];
            if (validUntil > doc.expirationDate) {
                validUntil = doc.expirationDate;
            }
        }

        // Update consent status
        request.consent = consent;
        request.validUntil = validUntil;

        emit ConsentGranted(documentId, requester, block.timestamp);
    }

    /**
     * @dev Share a document with a requester who has been granted consent
     * @param documentId The ID of the document to share
     * @param requester The address of the requester to share the document with
     * @return issuer The document issuer
     * @return holder The document holder
     * @return issuanceDate The document issuance date
     * @return expirationDate The document expiration date
     * @return documentType The document type
     */
    function shareDocument(bytes32 documentId, address requester)
        external
        onlyHolder(documentId)
        onlyValidDocument(documentId)
        onlyActiveDocument(documentId)
        returns (
            address issuer,
            address holder,
            uint256 issuanceDate,
            uint256 expirationDate,
            DocumentType documentType
        )
    {
        Document storage doc = documents[documentId];

        // Check document verification
        if (!doc.isVerified) {
            revert DocuVault__NotVerified();
        }

        ShareRequest storage request = shareRequests[documentId][requester];

        // Validate consent status
        if (request.consent != Consent.GRANTED) revert DocuVault__NotGranted();

        // Validate consent expiration
        if (request.validUntil < block.timestamp) revert DocuVault__Expired();

        // Record sharing event
        emit DocumentShared(documentId, requester, block.timestamp);

        // Return the document data
        return (doc.issuer, doc.holder, doc.issuanceDate, doc.expirationDate, doc.documentType);
    }

    /**
     * @dev Verify a document as an issuer
     * @param documentId The ID of the document to verify
     */
    function verifyDocument(bytes32 documentId)
        external
        onlyIssuer
        onlyValidDocument(documentId)
        onlyActiveDocument(documentId)
        whenNotPaused
    {
        Document storage doc = documents[documentId];

        // Validate document status
        if (doc.isVerified) revert DocuVault__AlreadyVerified();

        // Update verification status
        doc.isVerified = true;

        // Emit verification event
        emit DocumentVerified(documentId, msg.sender, block.timestamp);
    }

    /**
     * @dev Batch verify multiple documents
     * @param documentIds Array of document IDs to verify
     */
    function verifyDocuments(bytes32[] calldata documentIds) external onlyIssuer whenNotPaused {
        uint256 length = documentIds.length;
        if (length == 0) revert DocuVault__InvalidInput();

        bytes32[] memory verifiedDocs = new bytes32[](length);
        uint256 verifiedCount = 0;

        for (uint256 i = 0; i < length; i++) {
            bytes32 documentId = documentIds[i];
            Document storage doc = documents[documentId];

            // Skip invalid docs, already verified ones, or expired ones
            if (doc.issuanceDate == 0 || doc.isVerified || doc.expirationDate <= block.timestamp) {
                continue;
            }

            // Update verification status
            doc.isVerified = true;
            verifiedDocs[verifiedCount++] = documentId;
        }

        // Emit event if any documents were verified
        if (verifiedCount > 0) {
            emit DocumentBatchVerified(verifiedDocs, verifiedCount, msg.sender, block.timestamp);
        }
    }

    /////////////////////////////////////////////////
    //               VIEW FUNCTIONS                //
    /////////////////////////////////////////////////

    /**
     * @dev Get all documents for a holder
     * @param holder The address of the holder
     * @return Array of document IDs belonging to the holder
     */
    function getDocuments(address holder) external view returns (bytes32[] memory) {
        return holderDocuments[holder];
    }

    /**
     * @dev Check if an address is an active issuer
     * @param issuerAddr The address to check
     * @return Whether the address is an active issuer
     */
    function isIssuerActive(address issuerAddr) external view returns (bool) {
        string memory did = didAuth.getDidFromAddress(issuerAddr);
        if (bytes(did).length == 0) {
            revert DocuVault__InvalidDID();
        }

        return didAuth.hasDidRole(did, didAuth.ISSUER_ROLE());
    }

    /**
     * @dev Check if a document is expired
     * @param documentId The ID of the document to check
     * @return Whether the document is expired
     */
    function isDocumentExpired(bytes32 documentId) external view onlyValidDocument(documentId) returns (bool) {
        return documents[documentId].expirationDate <= block.timestamp;
    }

    /**
     * @dev Get the consent status for a document and requester
     * @param documentId The ID of the document
     * @param requester The address of the requester
     * @return consentStatus The consent status
     * @return validUntil The timestamp until which the consent is valid
     */
    function getConsentStatus(bytes32 documentId, address requester)
        external
        view
        returns (Consent consentStatus, uint256 validUntil)
    {
        ShareRequest storage request = shareRequests[documentId][requester];
        return (request.consent, request.validUntil);
    }

    /**
     * @dev Get document information by its ID
     * @param documentId The ID of the document
     * @return isVerified Whether the document is verified
     * @return isExpired Whether the document is expired
     * @return issuer The address of the document issuer
     * @return holder The address of the document holder
     * @return issuanceDate The issuance date of the document
     * @return expirationDate The expiration date of the document
     * @return documentType The type of the document
     */
    function getDocumentInfo(bytes32 documentId)
        external
        view
        returns (
            bool isVerified,
            bool isExpired,
            address issuer,
            address holder,
            uint256 issuanceDate,
            uint256 expirationDate,
            DocumentType documentType
        )
    {
        Document storage doc = documents[documentId];
        bool expired = doc.expirationDate <= block.timestamp;

        return (
            doc.isVerified && !expired,
            expired,
            doc.issuer,
            doc.holder,
            doc.issuanceDate,
            doc.expirationDate,
            doc.documentType
        );
    }

    /**
     * @dev Verify a CID matches a document ID
     * @param contentHash The content hash used to generate the document ID
     * @param holder The document holder address
     * @param cid The IPFS CID to verify
     * @param documentId The document ID to check against
     * @return Whether the CID matches the document ID
     */
    function verifyCid(bytes32 contentHash, address holder, string calldata cid, bytes32 documentId)
        external
        pure
        returns (bool)
    {
        bytes32 cidHash = keccak256(abi.encodePacked(cid));
        bytes32 computedId = keccak256(abi.encodePacked(contentHash, holder, cidHash));
        return computedId == documentId;
    }

    /////////////////////////////////////////////////
    //               ADMIN FUNCTIONS               //
    /////////////////////////////////////////////////

    /**
     * @dev Pauses all contract operations
     */
    function pause() external onlyAdmin {
        _pause();
    }

    /**
     * @dev Unpauses all contract operations
     */
    function unpause() external onlyAdmin {
        _unpause();
    }
}
