import hre from 'hardhat';
const { ethers } = hre;
import * as path from 'path';
import * as dotenv from 'dotenv';
import { DocuVault, DidAuth } from '../typechain-types';
import accounts from './accounts';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

interface DocumentData {
  contentHash: string;
  cid: string;
  holder: string;
  issuanceDate: number;
  expirationDate: number;
  documentType: number;
}

// Document types enum
enum DocumentType {
  GENERIC = 0,
  BIRTH_CERTIFICATE = 1,
  DEATH_CERTIFICATE = 2,
  MARRIAGE_CERTIFICATE = 3,
  ID_CARD = 4,
  PASSPORT = 5,
  OTHER = 6,
}

// Sample document templates
const documentTemplates = [
  {
    type: DocumentType.BIRTH_CERTIFICATE,
    name: 'Birth Certificate',
    cidPrefix: 'Qm1BirthCert',
  },
  {
    type: DocumentType.ID_CARD,
    name: 'Identity Card',
    cidPrefix: 'Qm2IdCard',
  },
  {
    type: DocumentType.PASSPORT,
    name: 'Passport',
    cidPrefix: 'Qm3Passport',
  },
  {
    type: DocumentType.MARRIAGE_CERTIFICATE,
    name: 'Marriage Certificate',
    cidPrefix: 'Qm4Marriage',
  },
  {
    type: DocumentType.GENERIC,
    name: 'Generic Document',
    cidPrefix: 'Qm5Generic',
  },
  {
    type: DocumentType.DEATH_CERTIFICATE,
    name: 'Death Certificate',
    cidPrefix: 'Qm6DeathCert',
  },
  {
    type: DocumentType.OTHER,
    name: 'Medical Record',
    cidPrefix: 'Qm7Medical',
  },
  {
    type: DocumentType.GENERIC,
    name: 'Education Certificate',
    cidPrefix: 'Qm8Education',
  },
  {
    type: DocumentType.OTHER,
    name: 'Employment Record',
    cidPrefix: 'Qm9Employment',
  },
  {
    type: DocumentType.GENERIC,
    name: 'Property Deed',
    cidPrefix: 'Qm10Property',
  },
];

function generateContentHash(holderAddress: string, documentIndex: number, templateIndex: number): string {
  const data = `${holderAddress}-${documentIndex}-${templateIndex}-${Date.now()}`;
  return ethers.keccak256(ethers.toUtf8Bytes(data));
}

function generateCID(template: (typeof documentTemplates)[0], holderAddress: string, documentIndex: number): string {
  // Generate a mock IPFS CID (in production, this would be from actual IPFS upload)
  const suffix = ethers.keccak256(ethers.toUtf8Bytes(`${holderAddress}-${documentIndex}`)).slice(2, 12);
  return `${template.cidPrefix}${suffix}`;
}

async function registerDocumentForHolder(
  docuVault: DocuVault,
  issuerSigner: any,
  holderAddress: string,
  holderName: string,
  documentCount: number = 5
): Promise<void> {
  console.log(`\n=� Registering 5 documents for ${holderName} (${holderAddress})...`);

  const documents: DocumentData[] = [];
  const currentTime = Math.floor(Date.now() / 1000);
  const oneYear = 365 * 24 * 60 * 60; // 1 year in seconds

  // Generate documents for this holder
  for (let i = 0; i < documentCount; i++) {
    const template = documentTemplates[i % documentTemplates.length]; // Cycle through templates if more docs than templates
    const contentHash = generateContentHash(holderAddress, i, template.type);
    const cid = generateCID(template, holderAddress, i);

    documents.push({
      contentHash,
      cid,
      holder: holderAddress,
      issuanceDate: currentTime,
      expirationDate: currentTime + oneYear, // 1 year from now
      documentType: template.type,
    });

    console.log(`   Prepared ${template.name} - CID: ${cid}`);
  }

  try {
    // Register documents using batch registration
    console.log(`  =� Submitting batch registration transaction...`);

    const tx = await docuVault.connect(issuerSigner).registerDocuments(
      documents.map((d) => d.contentHash),
      documents.map((d) => d.cid),
      documents.map((d) => d.holder),
      documents.map((d) => d.issuanceDate),
      documents.map((d) => d.expirationDate),
      documents.map((d) => d.documentType)
    );

    console.log(`  � Transaction submitted: ${tx.hash}`);
    const receipt = await tx.wait();
    console.log(`   Documents registered successfully! Gas used: ${receipt?.gasUsed}`);

    // Extract document IDs from events
    if (receipt?.logs) {
      const documentRegisteredInterface = docuVault.interface;
      const documentEvents = receipt.logs
        .map((log) => {
          try {
            return documentRegisteredInterface.parseLog(log);
          } catch {
            return null;
          }
        })
        .filter((event) => event?.name === 'DocumentRegistered');

      console.log(`  =� Registered ${documentEvents.length} documents:`);
      documentEvents.forEach((event, index) => {
        if (event?.args) {
          const template = documentTemplates[index];
          console.log(`    - ${template.name}: ${event.args.documentId}`);
        }
      });
    }
  } catch (error) {
    console.error(`  L Error registering documents for ${holderName}:`, error);
    throw error;
  }
}

async function main() {
  console.log('=� Starting document registration for holders as issuer...\n');

  // Get contract addresses from environment
  const docuVaultAddress = process.env.DOCU_VAULT_CONTRACT_ADDRESS;
  const didAuthAddress = process.env.DID_AUTH_CONTRACT_ADDRESS;

  if (!docuVaultAddress || !didAuthAddress) {
    throw new Error('Required contract addresses not found in environment variables');
  }

  console.log(`=� Contract Addresses:`);
  console.log(`  DocuVault: ${docuVaultAddress}`);
  console.log(`  DidAuth: ${didAuthAddress}`);

  // Get contract instances
  const docuVault = (await ethers.getContractAt('DocuVault', docuVaultAddress)) as unknown as DocuVault;
  const didAuth = (await ethers.getContractAt('DidAuth', didAuthAddress)) as unknown as DidAuth;

  // Setup issuer signer (using Issuer1 from accounts)
  const issuerPrivateKey = accounts.Issuer1.privateKey;
  const issuerSigner = new ethers.Wallet(issuerPrivateKey, ethers.provider);
  const issuerAddress = accounts.Issuer1.account;

  console.log(`\n=d Using Issuer: ${issuerAddress}`);

  // Verify issuer has the correct role
  try {
    const hasIssuerRole = await didAuth.hasRole(await didAuth.ISSUER_ROLE(), issuerAddress);

    if (!hasIssuerRole) {
      console.error(`L Address ${issuerAddress} does not have ISSUER_ROLE`);
      console.log('Please run the role registration script first.');
      return;
    }

    console.log(` Issuer role verified for ${issuerAddress}`);
  } catch (error) {
    console.error('L Error checking issuer role:', error);
    return;
  }

  // Get accounts to register documents for
  const accountsToRegister = [
    { account: accounts.Deployer.account, name: 'Deployer', documentCount: 10 },
    { account: accounts.Holder1.account, name: 'Holder1', documentCount: 5 },
    { account: accounts.Holder2.account, name: 'Holder2', documentCount: 5 },
    { account: accounts.Holder3.account, name: 'Holder3', documentCount: 5 },
  ];

  console.log(`\n=� Registering documents for ${accountsToRegister.length} holders...`);

  // Register documents for each holder
  let totalDocuments = 0;
  for (const account of accountsToRegister) {
    try {
      await registerDocumentForHolder(docuVault, issuerSigner, account.account, account.name, account.documentCount);
      totalDocuments += account.documentCount;

      // Add a small delay between accounts to avoid nonce issues
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`L Failed to register documents for ${account.name}:`, error);
    }
  }

  console.log(`\n<� Document registration completed!`);
  console.log(`=� Summary:`);
  console.log(`  - Total accounts: ${accountsToRegister.length}`);
  console.log(`  - Deployer documents: 10`);
  console.log(`  - Documents per holder: 5`);
  console.log(`  - Total documents registered: ${totalDocuments}`);
  console.log(`  - Issuer used: ${issuerAddress}`);

  // Display document types registered
  console.log(`\n=� Document types registered for each holder:`);
  documentTemplates.forEach((template, index) => {
    console.log(`  ${index + 1}. ${template.name}`);
  });
}

main()
  .then(() => {
    console.log('\n Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\nL Script failed:', error);
    process.exit(1);
  });
