import { log } from "@graphprotocol/graph-ts"
import { NewFeedback, BlacklistedFeedback as BlacklistedFeedbackEvent } from "../generated/Sugesto/Sugesto"
import { Feedback } from "../generated/schema"

/**
 * Creates a new Feedback.
 * @param event Ethereum event emitted when a user sends a feedback anonymously.
 */
export function handleNewFeedback(event: NewFeedback): void {
    log.debug(`NewFeedback event at block: {}`, [event.block.number.toString()])

    const feedbackId = event.params.nullifierHash.toString()

    const feedback = new Feedback(feedbackId)
    feedback.feedback = event.params.feedback
    feedback.nullifierHash = event.params.nullifierHash
    feedback.isBlacklisted = false

    feedback.save()

    log.info("Feedback '{}' has been created", [feedback.id])
}


export function handleBlacklistedFeedback(event: BlacklistedFeedbackEvent): void {
    log.debug(`BlacklistedFeedback event at block: {}`, [event.block.number.toString()])

    for (let i = 0; i < event.params.feedbackNullifierHashes.length; i += 1) {
        const feedbackId = event.params.feedbackNullifierHashes[i].toString()
        log.info("Blacklisting feedback '{}'", [feedbackId])
        const feedback = Feedback.load(feedbackId)

        if (feedback != null) {
            feedback.isBlacklisted = true
            feedback.save()

            log.info("Feedback '{}' has been blacklisted", [feedback.id])
        }
    }
}
