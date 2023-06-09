// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.4;

import "hardhat/console.sol";

contract WavePortal {
	uint256 totalWaves;
	uint256 private seed;
	
	event NewWave(address indexed from, uint256 timestamp, string message);

	struct Wave {
		address waver;
		string message;
		uint256 timestamp;
	}

	Wave[] waves;
	mapping(address => uint256) public lastWavedAt;

	constructor() payable {
		console.log("Hi there");
		seed = (block.timestamp + block.difficulty) % 100;
	}

	function wave(string memory _message) public {
		require(
			lastWavedAt[msg.sender] + 15 minutes < block.timestamp,
			"Wait 15 minutes"
		);

		lastWavedAt[msg.sender] = block.timestamp;

		totalWaves += 1;
		console.log("%s waved with message %s", msg.sender, _message);

		waves.push(Wave(msg.sender, _message, block.timestamp));

		seed = (block.timestamp + block.difficulty + seed) % 100;
		console.log("Randomly generated seed: %d", seed);

		if(seed < 50) {
			console.log("%s won!", msg.sender);

			uint256 prizeAmount = 0.0001 ether;
			require(
				prizeAmount <= address(this).balance,
				"Insufficient funds!"
			);
			(bool success, ) = (msg.sender).call{value: prizeAmount}("");
			require(success, "Failed to withdraw money from the contract.");
		}

		emit NewWave(msg.sender, block.timestamp, _message);
	}

	function getAllWaves() public view returns(Wave[] memory) {
		return waves;
	}

	function getTotalWaves() public view returns (uint256) {
		console.log("We have %d total waves!", totalWaves);
		return totalWaves;
	}
}
