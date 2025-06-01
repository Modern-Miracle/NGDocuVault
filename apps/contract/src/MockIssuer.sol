// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MockIssuer {
    // ========== STORAGE ==========
    mapping(bytes32 => bool) public documents;
    address public issuer;

    constructor(address _issuer) {
        issuer = _issuer;
    }

    // ========== MODIFIERS ==========
    modifier onlyIssuer() {
        require(msg.sender == issuer, "Only issuer can call this function");
        _;
    }

    // ========== EVENTS ==========
    event DocumentIssued(
        bytes32 indexed documentHash, address indexed issuer, address indexed holder, uint256 timestamp
    );
    event DocumentRevoked(
        bytes32 indexed documentHash, address indexed issuer, address indexed holder, uint256 timestamp
    );

    // ========== FUNCTIONS ==========
    /**
     * @dev Issue a document
     * @param documentHash The hash of the document
     */
    function issueDocument(bytes32 documentHash) external onlyIssuer {
        emit DocumentIssued(documentHash, issuer, msg.sender, block.timestamp);
    }

    /**
     * @dev Revoke a document
     * @param documentHash The hash of the document
     */
    function revokeDocument(bytes32 documentHash) external onlyIssuer {
        emit DocumentRevoked(documentHash, issuer, msg.sender, block.timestamp);
    }
    /**
     * @dev Get the document details
     * @param documentHash The hash of the document
     * @return The document hash
     * @return The issuer
     * @return The holder
     * @return The timestamp
     */

    function getDocument(bytes32 documentHash) external view returns (bytes32, address, address, uint256) {
        return (documentHash, issuer, msg.sender, block.timestamp);
    }
}
