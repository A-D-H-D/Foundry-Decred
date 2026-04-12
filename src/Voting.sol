// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract Voting is EIP712, Ownable {
    struct Candidate {
        uint256 id;
        string name;
        string party;
        string imageURL;
        string slogan;
        string[] platform;
        uint256 voteCount;
    }

    struct VoterCredential {
        address subject;
        uint256 electionId;
        bytes32 nonce;
    }

    address public immutable issuer;
    uint256 public currentElectionId;
    mapping(bytes32 => bool) public nullifiersUsed;
    mapping(address => mapping(uint256 => bool)) public votedInElection;

    Candidate[] public candidates;

    event Voted(address indexed voter, uint256 indexed candidateId);

    constructor(address _issuerAddress, uint256 _initialElectionId) EIP712("De-Cred Voting", "1") Ownable(msg.sender) {
        issuer = _issuerAddress;
        currentElectionId = _initialElectionId;

        string[] memory platform1 = new string[](3);
        platform1[0] = "Judicial Reform";
        platform1[1] = "Constitutional Integrity";
        platform1[2] = "Rule of Law";

        candidates.push(
            Candidate({
                id: 1,
                name: "David Maraga",
                party: "Justice Party",
                imageURL: "/maraga.jpg",
                slogan: "The Law is Clear",
                platform: platform1,
                voteCount: 0
            })
        );

        string[] memory platform2 = new string[](3);
        platform2[0] = "Urban Development";
        platform2[1] = "Youth Empowerment";
        platform2[2] = "Public Accountability";

        candidates.push(
            Candidate({
                id: 2,
                name: "Edwin Sifuna",
                party: "Progressive Alliance",
                imageURL: "/sifuna.webp",
                slogan: "For a Better Tomorrow",
                platform: platform2,
                voteCount: 0
            })
        );
    }

    function getCandidateCount() public view returns (uint256) {
        return candidates.length;
    }

    function getCandidate(uint256 index)
        public
        view
        returns (
            uint256 id,
            string memory name,
            string memory party,
            string memory imageURL,
            string memory slogan,
            string[] memory platform,
            uint256 voteCount
        )
    {
        require(index < candidates.length, "Candidate index out of bounds");
        Candidate storage c = candidates[index];
        return (c.id, c.name, c.party, c.imageURL, c.slogan, c.platform, c.voteCount);
    }

    function vote(uint256 candidateId, VoterCredential calldata cred, bytes calldata signature) public {
        // 0. Verify the voter hasn't already voted in this election
        require(!votedInElection[cred.subject][cred.electionId], "De-Cred: Voter has already voted in this election");

        // 1. Verify the credential was signed by the official issuer
        bytes32 digest = _hashTypedDataV4(
            keccak256(
                abi.encode(
                    keccak256("VoterCredential(address subject,uint256 electionId,bytes32 nonce)"),
                    cred.subject,
                    cred.electionId,
                    cred.nonce
                )
            )
        );
        address signer = ECDSA.recover(digest, signature);
        require(signer == issuer, "De-Cred: Invalid credential signature");
        require(signer != address(0), "De-Cred: Invalid signer");

        // 2. Verify the credential is for the person trying to use it
        require(cred.subject == msg.sender, "De-Cred: Credential is not for you");

        // 3. Verify this credential hasn't been used before (prevents double voting)
        bytes32 nullifier = keccak256(abi.encodePacked(cred.nonce, cred.electionId));
        require(!nullifiersUsed[nullifier], "De-Cred: Credential has already been used");
        nullifiersUsed[nullifier] = true;

        // 4. Verify the election ID is current
        require(cred.electionId == currentElectionId, "De-Cred: Wrong election");

        // --- If all checks pass, proceed with original voting logic ---
        require(candidateId < candidates.length, "De-Cred: Invalid candidate");
        candidates[candidateId].voteCount++;
        votedInElection[cred.subject][cred.electionId] = true; // Mark voter as having voted
        emit Voted(msg.sender, candidateId);
    }

    function startNewElection() public onlyOwner {
        currentElectionId++;
    }

    function addCandidate(
        string memory _name,
        string memory _party,
        string memory _imageURL,
        string memory _slogan,
        string[] memory _platform
    ) public onlyOwner {
        candidates.push(
            Candidate({
                id: candidates.length,
                name: _name,
                party: _party,
                imageURL: _imageURL,
                slogan: _slogan,
                platform: _platform,
                voteCount: 0
            })
        );
    }

    function getVoteCount(uint256 candidateIndex) public view returns (uint256) {
        require(candidateIndex < candidates.length, "Invalid candidate");
        return candidates[candidateIndex].voteCount;
    }
}
