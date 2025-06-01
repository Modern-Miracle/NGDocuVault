// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import {IZKPVerifier} from "./interfaces/IZKPVerifier.sol";
import {AgeVerifier} from "./verifiers/AgeVerifier.sol";
import {FhirVerifier} from "./verifiers/FhirVerifier.sol";
import {HashVerifier} from "./verifiers/HashVerifier.sol";

/**
 * @title VerifierFactory
 * @dev Factory contract that manages all circuit verifiers
 */
contract VerifierFactory {
    AgeVerifier public ageverifier;
    FhirVerifier public fhirverifier;
    HashVerifier public hashverifier;

    /**
     * @dev Constructor creates instances of all verifiers
     */
    constructor() {
        ageverifier = new AgeVerifier();
        fhirverifier = new FhirVerifier();
        hashverifier = new HashVerifier();
    }

    /**
     * @dev Verifies a AgeVerifier proof
     */
    function verifyAge(uint256[2] memory a, uint256[2][2] memory b, uint256[2] memory c, uint256[4] memory input)
        public
        view
        returns (bool)
    {
        return ageverifier.verifyProof(a, b, c, input);
    }

    /**
     * @dev Verifies a FhirVerifier proof
     */
    function verifyFhir(uint256[2] memory a, uint256[2][2] memory b, uint256[2] memory c, uint256[21] memory input)
        public
        view
        returns (bool)
    {
        return fhirverifier.verifyProof(a, b, c, input);
    }

    /**
     * @dev Verifies a HashVerifier proof
     */
    function verifyHash(uint256[2] memory a, uint256[2][2] memory b, uint256[2] memory c, uint256[3] memory input)
        public
        view
        returns (bool)
    {
        return hashverifier.verifyProof(a, b, c, input);
    }
}
