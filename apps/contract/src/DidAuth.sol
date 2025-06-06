// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

import {DidRegistry} from "./DidRegistry.sol";
import {DidVerifier} from "./DidVerifier.sol";
import {DidIssuer} from "./DidIssuer.sol";

/**
 * @title DidAuth1
 * @dev Implements DID-based authentication and authorization with credential verification
 */
contract DidAuth {
    /*===================== ERRORS ======================*/
    error DidAuth__Unauthorized();
    error DidAuth__InvalidDID();
    error DidAuth__DeactivatedDID();
    error DidAuth__InvalidCredential();
    error DidAuth__InvalidRole();
    error DidAuth__CredentialVerificationFailed();

    /*================ STATE VARIABLES =================*/
    DidRegistry public didRegistry;
    DidVerifier public didVerifier;
    DidIssuer public didIssuer;

    struct Role {
        address verifiedBy;
        bool isVerified;
    }

    // Role definitions for different access levels
    bytes32 public constant DEFAULT_ADMIN_ROLE = keccak256("DEFAULT_ADMIN_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    bytes32 public constant ISSUER_ROLE = keccak256("ISSUER_ROLE");
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    bytes32 public constant HOLDER_ROLE = keccak256("HOLDER_ROLE");

    // Credential type definitions
    string public constant HOLDER_CREDENTIAL = "HolderCredential";
    string public constant ISSUER_CREDENTIAL = "IssuerCredential";
    string public constant VERIFIER_CREDENTIAL = "VerifierCredential";

    /*===================== EVENTS ======================*/
    event RoleGranted(string did, bytes32 role, uint256 timestamp);
    event RoleRevoked(string did, bytes32 role, uint256 timestamp);
    event AuthenticationSuccessful(string did, bytes32 role, uint256 timestamp);
    event AuthenticationFailed(string did, bytes32 role, uint256 timestamp);
    event CredentialVerified(string did, string credentialType, bytes32 credentialId, uint256 timestamp);
    event CredentialVerificationFailed(string did, string credentialType, bytes32 credentialId, uint256 timestamp);

    // Role management mapping
    mapping(bytes32 => mapping(bytes32 => Role)) private didRoles; // didHash => role => hasRole
    mapping(bytes32 => string) private roleRequirements; // role => credentialType

    // Trusted issuers for credential types
    mapping(string => mapping(address => bool)) private trustedIssuers; // credentialType => issuer => trusted

    /*===================== MODIFIERS ======================*/

    modifier onlyActiveDID(string memory did) {
        if (!didRegistry.isActive(did)) {
            revert DidAuth__DeactivatedDID();
        }
        _;
    }

    constructor(address _didRegistryAddress, address _verifierAddress, address _issuerAddress, address _owner) {
        didRegistry = DidRegistry(_didRegistryAddress);
        didVerifier = DidVerifier(_verifierAddress);
        didIssuer = DidIssuer(_issuerAddress);

        // Set up default role requirements

        roleRequirements[HOLDER_ROLE] = HOLDER_CREDENTIAL;
        roleRequirements[ISSUER_ROLE] = ISSUER_CREDENTIAL;
        roleRequirements[VERIFIER_ROLE] = VERIFIER_CREDENTIAL;

        // Set owner as trusted issuer for all credential types
        trustedIssuers[HOLDER_CREDENTIAL][_owner] = true;
        trustedIssuers[ISSUER_CREDENTIAL][_owner] = true;
        trustedIssuers[VERIFIER_CREDENTIAL][_owner] = true;

        bytes32 didHash = keccak256(abi.encodePacked(didRegistry.addressToDID(_owner)));

        // Grant default admin role to deployer
        didRoles[didHash][DEFAULT_ADMIN_ROLE] = Role(_owner, true);
        didRoles[didHash][ADMIN_ROLE] = Role(_owner, true);
    }

    /**
     * @dev Authenticates a DID, verifies its role
     * @param did The DID to authenticate
     * @param role The role to verify
     * @return bool indicating if authentication was successful
     */
    function authenticate(string memory did, bytes32 role) public view returns (bool) {
        // Basic validation
        if (bytes(did).length == 0) {
            return false;
        }

        // Check if DID exists and is active
        if (!didRegistry.isActive(did)) {
            return false;
        }

        // Check role - make sure the DID has the specific role
        bytes32 didHash = keccak256(abi.encodePacked(did));
        return didRoles[didHash][role].isVerified;
    }

    /**
     * @dev Gets the DID for the caller's address
     */
    function getCallerDid() public view returns (string memory) {
        return didRegistry.addressToDID(msg.sender);
    }

    /**
     * @dev Grants a role to a DID
     * @param did The DID to grant the role to
     * @param role The role to grant
     */
    function grantDidRole(string memory did, bytes32 role) public {
        // Check if DID exists and is active

        if (role == 0 || !didRegistry.isActive(did)) {
            revert DidAuth__InvalidDID();
        }

        bytes32 didHash = keccak256(abi.encodePacked(did));

        didRoles[didHash][role] = Role(msg.sender, true);

        emit RoleGranted(did, role, block.timestamp);
    }

    /**
     * @dev Revokes a role from a DID
     * @param did The DID to revoke the role from
     * @param role The role to revoke
     */
    function revokeDidRole(string memory did, bytes32 role) public {
        bytes32 didHash = keccak256(abi.encodePacked(did));
        didRoles[didHash][role] = Role(address(0), false);

        emit RoleRevoked(did, role, block.timestamp);
    }

    /**
     * @dev Checks if a DID has a role
     * @param did The DID to check
     * @param role The role to check
     * @return bool indicating if the DID has the role
     */
    function hasDidRole(string memory did, bytes32 role) public view returns (bool) {
        bytes32 didHash = keccak256(abi.encodePacked(did));
        return didRoles[didHash][role].isVerified;
    }

    /**
     * @dev Standard hasRole function for compatibility
     * @param role The role to check
     * @param account The account to check
     * @return bool indicating if the account has the role
     */
    function hasRole(bytes32 role, address account) public view returns (bool) {
        string memory did = didRegistry.addressToDID(account);
        if (bytes(did).length == 0) {
            return false;
        }

        return hasDidRole(did, role);
    }

    /**
     * @dev Resolves a DID to its controller address
     * @param did The DID to resolve
     * @return address The controller address
     */
    function resolveDid(string memory did) public view returns (address) {
        return didRegistry.getController(did);
    }

    /**
     * @dev Gets the DID associated with an address
     * @param addr The address to check
     * @return string The associated DID
     */
    function getDidFromAddress(address addr) public view returns (string memory) {
        return didRegistry.addressToDID(addr);
    }

    /**
     * @dev Sets a trusted issuer for a credential type
     * @param credentialType The type of credential
     * @param issuer The address of the issuer
     * @param trusted Whether the issuer should be trusted
     */
    function setTrustedIssuer(string memory credentialType, address issuer, bool trusted) public {
        if (issuer == address(0)) {
            revert DidAuth__InvalidDID();
        }
        trustedIssuers[credentialType][issuer] = trusted;
    }

    /**
     * @dev Checks if an issuer is trusted for a credential type
     * @param credentialType The type of credential
     * @param issuer The address of the issuer
     * @return bool indicating if the issuer is trusted
     */
    function isTrustedIssuer(string memory credentialType, address issuer) public view returns (bool) {
        return trustedIssuers[credentialType][issuer];
    }

    /**
     * @dev Gets the required credential type for a role
     * @param role The role to get credential for
     * @return string The required credential type
     */
    function getRequiredCredentialForRole(bytes32 role) public view returns (string memory) {
        string memory credentialType = roleRequirements[role];

        if (bytes(credentialType).length == 0) {
            revert DidAuth__InvalidCredential();
        }

        return credentialType;
    }

    /**
     * @dev Sets the credential requirement for a role
     * @param role The role to set requirement for
     * @param requirement The credential type required
     */
    function setRoleRequirement(bytes32 role, string memory requirement) public {
        if (role == 0) {
            revert DidAuth__InvalidRole();
        }

        roleRequirements[role] = requirement;
    }

    /**
     * @dev Gets the requirement for a role
     * @param role The role to check
     * @return string The credential type required
     */
    function getRoleRequirement(bytes32 role) public view returns (string memory) {
        return roleRequirements[role];
    }

    /**
     * @dev Verifies a credential for a specific DID and credential type
     * @param did The DID to verify
     * @param credentialType The type of credential required
     * @param credentialId The unique identifier of the credential
     * @return bool indicating if the credential is valid
     */
    function verifyCredentialForAction(string memory did, string memory credentialType, bytes32 credentialId)
        public
        view
        returns (bool)
    {
        // Check if DID is active
        if (!didRegistry.isActive(did)) {
            return false;
        }

        // Check if credential exists in the issuer contract
        bool isCredentialValid = didIssuer.isCredentialValid(credentialId);
        if (!isCredentialValid) {
            return false;
        }

        // Get the controller/issuer of the DID
        address controller = didRegistry.getController(did);

        // Check if the issuer is trusted for this credential type
        if (!trustedIssuers[credentialType][controller]) {
            return false;
        }

        // If we got here, the credential is valid
        return true;
    }

    /**
     * @dev Issues a new credential for a DID
     * @param credentialType The type of credential to issue
     * @param did The DID to issue the credential to
     * @param credentialId The unique identifier for the credential
     */
    function issueCredential(string memory credentialType, string memory did, bytes32 credentialId) public {
        // Check if DID is active
        if (!didRegistry.isActive(did)) {
            revert DidAuth__DeactivatedDID();
        }

        // Issue the credential using the issuer contract
        didIssuer.issueCredential(credentialType, did, credentialId);
    }

    /**
     * @dev Checks if a DID has multiple required roles and credentials
     * @param did The DID to check
     * @param roles Array of roles to check
     * @param credentialIds Array of credential IDs to check
     * @return bool indicating if all roles and credentials are valid
     */
    function hasRequiredRolesAndCredentials(string memory did, bytes32[] memory roles, bytes32[] memory credentialIds)
        public
        view
        returns (bool)
    {
        if (roles.length != credentialIds.length) {
            return false;
        }

        // Check if DID is active
        if (!didRegistry.isActive(did)) {
            return false;
        }

        // Check if DID has all roles and valid credentials
        for (uint256 i = 0; i < roles.length; i++) {
            if (!hasDidRole(did, roles[i])) {
                return false;
            }

            // Get required credential type for this role
            string memory credentialType = getRequiredCredentialForRole(roles[i]);

            // Check if the credential is valid
            if (!verifyCredentialForAction(did, credentialType, credentialIds[i])) {
                return false;
            }
        }

        // All checks passed
        return true;
    }

    /**
     * @dev Get all roles assigned to a DID
     * @param did The DID to check roles for
     * @return Array of roles the user has
     */
    function getUserRoles(string memory did) public view returns (bytes32[] memory) {
        if (bytes(did).length == 0) {
            revert DidAuth__InvalidDID();
        }

        // Check if DID exists and is active
        if (!didRegistry.isActive(did)) {
            revert DidAuth__DeactivatedDID();
        }

        // Define all possible roles to check
        bytes32[] memory allRoles = new bytes32[](6);
        allRoles[0] = DEFAULT_ADMIN_ROLE;
        allRoles[1] = ADMIN_ROLE;
        allRoles[2] = OPERATOR_ROLE;
        allRoles[3] = ISSUER_ROLE;
        allRoles[4] = VERIFIER_ROLE;
        allRoles[5] = HOLDER_ROLE;

        // First, count how many roles the DID has to size our array correctly
        uint256 roleCount = 0;
        bytes32 didHash = keccak256(abi.encodePacked(did));

        for (uint256 i = 0; i < allRoles.length; i++) {
            if (didRoles[didHash][allRoles[i]].isVerified) {
                roleCount++;
            }
        }

        // Create an array of the correct size
        bytes32[] memory userRoles = new bytes32[](roleCount);

        // Fill the array with the roles the DID has
        uint256 currentIndex = 0;
        for (uint256 i = 0; i < allRoles.length; i++) {
            if (didRoles[didHash][allRoles[i]].isVerified) {
                userRoles[currentIndex] = allRoles[i];
                currentIndex++;
            }
        }

        return userRoles;
    }

    /**
     * @dev Get all roles assigned to an address
     * @param addr The address to check roles for
     * @return Array of roles the address has
     */
    function getUserRolesByAddress(address addr) public view returns (bytes32[] memory) {
        // Get DID from address
        string memory did = didRegistry.addressToDID(addr);

        // Validate DID exists
        if (bytes(did).length == 0) {
            revert DidAuth__InvalidDID();
        }

        // Forward to the DID-based function
        return getUserRoles(did);
    }
}
