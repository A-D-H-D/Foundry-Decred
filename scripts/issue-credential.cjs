// scripts/issue-credential.cjs
require('dotenv').config();
const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

// --- Configuration ---
const {
  ISSUER_PRIVATE_KEY,
  CONTRACT_ADDRESS,
  CHAIN_ID,
  DOMAIN_NAME,
  DOMAIN_VERSION
} = process.env;

const REGISTRY_PATH = path.join(__dirname, '../voter-registry.json');

// --- EIP-712 Data Structures ---
const domain = {
  name: DOMAIN_NAME,
  version: DOMAIN_VERSION,
  chainId: CHAIN_ID,
  verifyingContract: CONTRACT_ADDRESS,
};

const types = {
  VoterCredential: [
    { name: 'subject', type: 'address' },
    { name: 'electionId', type: 'uint256' },
    { name: 'nonce', type: 'bytes32' },
  ],
};

async function createAndSignCredential(voterAddress) {
  if (!ISSUER_PRIVATE_KEY || !voterAddress) {
    throw new Error("Missing issuer private key or voter address.");
  }

  const issuerSigner = new ethers.Wallet(ISSUER_PRIVATE_KEY);

  const credential = {
    subject: voterAddress,
    electionId: 1, // Example election ID
    nonce: ethers.hexlify(ethers.randomBytes(32)),
  };

  console.log("Signing credential for address:", voterAddress);

  const signature = await issuerSigner.signTypedData(domain, types, credential);

  return { credential, signature };
}

function loadRegistry() {
  if (!fs.existsSync(REGISTRY_PATH)) {
    throw new Error("Registry file not found. Please create voter-registry.json first.");
  }
  return JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
}

function saveRegistry(registry) {
  fs.writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2));
}

async function main() {
  const regNo = process.argv[2];
  const voterAddress = process.argv[3];

  if (!regNo || !voterAddress || !ethers.isAddress(voterAddress)) {
    console.error("Usage: node scripts/issue-credential.cjs <REG_NO> <VOTER_ADDRESS>");
    console.error("Example: node scripts/issue-credential.cjs CT201/106113/21 0x123...");
    process.exit(1);
  }

  try {
    const registry = loadRegistry();

    // 1. Check if Reg No is eligible
    if (!registry[regNo]) {
      console.error(`❌ Error: Registration Number ${regNo} is not in the eligible list.`);
      process.exit(1);
    }

    const studentRecord = registry[regNo];

    // 2. Check if student has already registered a different wallet
    if (studentRecord.walletAddress && studentRecord.walletAddress.toLowerCase() !== voterAddress.toLowerCase()) {
      console.error(`❌ Security Violation: Student ${regNo} is already linked to wallet ${studentRecord.walletAddress}.`);
      console.error(`Attempted to use: ${voterAddress}`);
      process.exit(1);
    }

    // 3. Check if credential has already been issued
    if (studentRecord.credentialIssued) {
      console.error(`❌ Error: Credential for Student ${regNo} has already been issued.`);
      process.exit(1);
    }

    // 4. Issue the credential
    const { credential, signature } = await createAndSignCredential(voterAddress);
    
    // 5. Update Registry
    registry[regNo].walletAddress = voterAddress;
    registry[regNo].credentialIssued = true;
    saveRegistry(registry);

    console.log(`✅ Success: Credential issued for ${regNo}`);
    
    // Output the final JSON object
    console.log("\n--- Verifiable Credential Bundle (Paste this in Frontend) ---");
    console.log(JSON.stringify({
        credential,
        signature
    }, null, 2));
    console.log("--- End of Bundle ---\n");

  } catch (error) {
    console.error("Error creating credential:", error.message);
    process.exit(1);
  }
}

main();
