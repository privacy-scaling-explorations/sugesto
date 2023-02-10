//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@zk-groups/contracts/protocols/IZKGroupsSemaphore.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

contract Sugesto is Ownable {
    error Sugesto__FeedbackLimitExceeded();

    event NewFeedback(string feedback);
    event BlacklistedFeedback(uint256[] feedbackHashes);

    uint8 constant FEEDBACK_LIMIT = 3;

    IZKGroupsSemaphore public zkGroupsSemaphore;

    constructor(address zkGroupsAddress) {
        zkGroupsSemaphore = IZKGroupsSemaphore(zkGroupsAddress);
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

        zkGroupsSemaphore.verifyProof(
            groupId,
            merkleTreeDepth,
            uint256(keccak256(abi.encodePacked(feedback))), // Hash of the signal is used for proof computation
            nullifierHash,
            feedbackNumber, // feedbackNumber is the externalNullifier
            proof
        );

        emit NewFeedback(feedback);
    }

    function blacklistFeedback(uint256[] calldata feedbackHashes) external onlyOwner {
        emit BlacklistedFeedback(feedbackHashes);
    }
}
