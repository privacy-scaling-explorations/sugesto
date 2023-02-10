//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@zk-groups/contracts/protocols/IZKGroupsSemaphore.sol";
import "hardhat/console.sol";

contract Sugesto {
    error Sugesto__FeedbackLimitExceeded();

    event NewFeedback(string feedback);

    uint8 FEEDBACK_LIMIT = 3;
    IZKGroupsSemaphore public zkGroupsSempahore;

    constructor(address zkGroupsAddress) {
        zkGroupsSempahore = IZKGroupsSemaphore(zkGroupsAddress);
    }

    function sendFeedback(
        uint256 groupId,
        uint256 merkleTreeDepth,
        string calldata feedback,
        uint8 feedbackNumber,
        uint256 nullifierHash,
        uint256[8] calldata proof
    ) external {
        if (feedbackNumber > FEEDBACK_LIMIT) {
            revert Sugesto__FeedbackLimitExceeded();
        }

        zkGroupsSempahore.verifyProof(
            groupId,
            merkleTreeDepth,
            uint256(keccak256(abi.encodePacked(feedback))), // Hash of the signal is used for proof computation
            nullifierHash,
            feedbackNumber, // feedbackNumber is the externalNullifier
            proof
        );

        emit NewFeedback(feedback);
    }
}
