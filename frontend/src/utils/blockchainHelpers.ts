import { BrowserProvider, ethers } from "ethers";
import VotingContractABI from "../abi/Voting.json";

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

export async function getProviderAndContract() {
  if (!window.ethereum) throw new Error("MetaMask not installed");
  const provider = new BrowserProvider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(
    CONTRACT_ADDRESS,
    VotingContractABI.abi,
    signer,
  );
  return { contract, signer };
}

// getCandidates, voteForCandidate, getVoteCounts, truncateAddress stay exactly as they are
export async function getCandidates() {
  const { contract } = await getProviderAndContract();
  try {
    const count = await contract.getCandidateCount();
    const promises = [];
    for (let i = 0; i < BigInt(count); i++) {
      promises.push(contract.getCandidate(i));
    }
    const rawCandidates = await Promise.all(promises);
    return rawCandidates.map((c, index) => ({
      id: index,
      name: c.name,
      party: c.party,
      image: c.imageURL,
      slogan: c.slogan,
      platform: c.platform,
    }));
  } catch (err) {
    throw err;
  }
}
export async function voteForCandidate(
  candidateId: number,
  cred: any,
  sig: string,
) {
  const { contract } = await getProviderAndContract();
  // The contract expects the nonce to be bytes32, so we pass it as a hex string
  const credentialStruct = {
    subject: cred.subject,
    electionId: cred.electionId,
    nonce: cred.nonce,
  };
  const tx = await contract.vote(candidateId, credentialStruct, sig);
  await tx.wait();
}

export async function getVoteCounts() {
  const { contract } = await getProviderAndContract();
  const count = await contract.getCandidateCount();
  const promises = [];
  for (let i = 0; i < BigInt(count); i++) {
    promises.push(contract.getVoteCount(i));
  }
  const counts = await Promise.all(promises);
  return counts.map((c) => parseInt(c.toString()));
}

export const truncateAddress = (address: string) => {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};
