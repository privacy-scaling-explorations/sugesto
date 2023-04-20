//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@bandada/contracts/protocols/IBandadaSemaphore.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

contract Sugesto is Ownable {
    error Sugesto__FeedbackLimitExceeded();

    event NewFeedback(uint256 groupId, string feedback, uint256 nullifierHash);
    event BlacklistedFeedback(uint256[] feedbackNullifierHashes);

    uint8 public feedbackLimit;

    IBandadaSemaphore public bandadaSemaphore;

    constructor(address bandadaSemaphoreAddress, uint8 _feedbackLimit) {
        bandadaSemaphore = IBandadaSemaphore(bandadaSemaphoreAddress);
        feedbackLimit = _feedbackLimit;
    }

    function sendFeedback(
        uint256 groupId,
        uint256 merkleTreeDepth,
        string calldata feedback,
        uint8 feedbackNumber,
        uint256 nullifierHash,
        uint256[8] calldata proof
    ) external {
        if (feedbackNumber > feedbackLimit) {
            revert Sugesto__FeedbackLimitExceeded();
        }

        bandadaSemaphore.verifyProof(
            groupId,
            merkleTreeDepth,
            uint256(keccak256(abi.encodePacked(feedback))), // Hash of the signal is used for proof computation
            nullifierHash,
            feedbackNumber, // feedbackNumber is the externalNullifier
            proof
        );

        emit NewFeedback(groupId, feedback, nullifierHash);
    }

    function blacklistFeedback(uint256[] calldata feedbackNullifierHashes) external onlyOwner {
        emit BlacklistedFeedback(feedbackNullifierHashes);
    }

    function updateFeedbackLimit(uint8 newLimit) external onlyOwner {
        feedbackLimit = newLimit;
    }
}
