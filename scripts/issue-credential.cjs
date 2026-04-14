// scripts/issue-credential.cjs
require("dotenv").config();
const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");

// --- Configuration ---
const {
  ISSUER_PRIVATE_KEY,
  CONTRACT_ADDRESS,
  CHAIN_ID,
  DOMAIN_NAME,
  DOMAIN_VERSION,
  EMAIL_USER,
  EMAIL_PASS,
} = process.env;

const REGISTRY_PATH = path.join(__dirname, "../voter-registry.json");

const domain = {
  name: DOMAIN_NAME,
  version: DOMAIN_VERSION,
  chainId: CHAIN_ID,
  verifyingContract: CONTRACT_ADDRESS,
};

const types = {
  VoterCredential: [
    { name: "subject", type: "address" },
    { name: "electionId", type: "uint256" },
    { name: "nonce", type: "bytes32" },
  ],
};

/**
 * Sends the credential bundle via email using SMTP
 */
async function sendCredentialEmail(voterEmail, regNo, credential, signature) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  });

  const bundle = JSON.stringify({ credential, signature }, null, 2);

  await transporter.sendMail({
    from: `"De-Cred University" <${EMAIL_USER}>`,
    to: voterEmail,
    subject: `Your Voter Credential - De-Cred Election`,
    text: `Dear Student (${regNo}),

Your Verifiable Credential for the De-Cred election has been issued.
Paste the JSON below into the Identity Portal on the voting platform.

${bundle}

This credential is tied to your wallet address and can only be used once.

- De-Cred System`,
  });

  console.log(`✅ Credential emailed to ${voterEmail}`);
}

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

  const signature = await issuerSigner.signTypedData(domain, types, credential);
  return { credential, signature };
}

function loadRegistry() {
  if (!fs.existsSync(REGISTRY_PATH)) {
    throw new Error("Registry file not found.");
  }
  return JSON.parse(fs.readFileSync(REGISTRY_PATH, "utf8"));
}

function saveRegistry(registry) {
  fs.writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2));
}

async function main() {
  const regNo = process.argv[2];
  const voterAddress = process.argv[3];
  const voterEmail = process.argv[4];

  if (!regNo || !voterAddress || !ethers.isAddress(voterAddress)) {
    console.error(
      "Usage: node scripts/issue-credential.cjs <REG_NO> <VOTER_ADDRESS> <EMAIL>",
    );
    process.exit(1);
  }

  try {
    const registry = loadRegistry();

    if (!registry[regNo]) {
      console.error(
        `❌ Error: Registration Number ${regNo} is not in the eligible list.`,
      );
      process.exit(1);
    }

    const studentRecord = registry[regNo];

    if (
      studentRecord.walletAddress &&
      studentRecord.walletAddress.toLowerCase() !== voterAddress.toLowerCase()
    ) {
      console.error(
        `❌ Security Violation: Student ${regNo} is already linked to wallet ${studentRecord.walletAddress}.`,
      );
      process.exit(1);
    }

    if (studentRecord.credentialIssued) {
      console.error(
        `❌ Error: Credential for Student ${regNo} has already been issued.`,
      );
      process.exit(1);
    }

    // Issue and Sign
    const { credential, signature } =
      await createAndSignCredential(voterAddress);

    // Update Local Registry
    registry[regNo].walletAddress = voterAddress;
    registry[regNo].credentialIssued = true;
    saveRegistry(registry);

    console.log(`✅ Success: Credential recorded locally for ${regNo}`);

    // Dispatch Email
    if (voterEmail) {
      await sendCredentialEmail(voterEmail, regNo, credential, signature);
    } else {
      console.log("\n--- Verifiable Credential Bundle (Terminal Only) ---");
      console.log(JSON.stringify({ credential, signature }, null, 2));
      console.log("--- End of Bundle ---\n");
    }
  } catch (error) {
    console.error("Error creating credential:", error.message);
    process.exit(1);
  }
}

main();
