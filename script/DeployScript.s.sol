// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {Voting} from "../src/Voting.sol";

contract DeployScript is Script {
    function run() external returns (Voting) {
        // Read environment variables
        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        uint256 issuerPrivateKey = vm.envUint("ISSUER_PRIVATE_KEY");
        address issuerAddress = vm.addr(issuerPrivateKey); // ← derive, don't read from env
        uint256 initialElectionId = vm.envOr("INITIAL_ELECTION_ID", uint256(1));

        console.log("Deploying with:");
        console.log("- Deployer:", vm.addr(deployerPrivateKey));
        console.log("- Issuer:", issuerAddress);
        console.log("- Election ID:", initialElectionId);

        // Start broadcasting transactions
        vm.startBroadcast(deployerPrivateKey);

        // Deploy the Voting contract
        Voting voting = new Voting(issuerAddress, initialElectionId);

        console.log("\n=== Deployment Successful ===");
        console.log("Voting contract deployed to:", address(voting));
        console.log("Candidate count:", voting.getCandidateCount());

        vm.stopBroadcast();

        return voting;
    }
}
