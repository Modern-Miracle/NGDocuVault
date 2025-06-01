export const MOCK_DID_DOCUMENT = {
  "@context": [
    "https://www.w3.org/ns/did/v1",
    "https://w3id.org/security/suites/ed25519-2020/v1"
  ],
  "id": "did:ala:testnet:0x1234567890123456789012345678901234567890",
  "verificationMethod": [
    {
      "id": "did:ala:testnet:0x1234567890123456789012345678901234567890#key-1",
      "type": "Ed25519VerificationKey2020",
      "controller": "did:ala:testnet:0x1234567890123456789012345678901234567890",
      "publicKeyMultibase": "z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK"
    }
  ],
  "authentication": [
    "did:ala:testnet:0x1234567890123456789012345678901234567890#key-1"
  ],
  "assertionMethod": [
    "did:ala:testnet:0x1234567890123456789012345678901234567890#key-1"
  ]
};
