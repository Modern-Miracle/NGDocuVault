// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/**
 * @title IZKPVerifier
 * @dev Interface for zero-knowledge proof verifiers
 */
interface IZKPVerifier {
    function verifyProof(
        uint256[2] memory a,
        uint256[2][2] memory b,
        uint256[2] memory c,
        uint256[] memory input
    ) external view returns (bool);
}
