import { Identity } from "@semaphore-protocol/identity"
import { FullProof, generateProof as generateSemaphoreProof, calculateNullifierHash } from "@semaphore-protocol/proof"
import { solidityKeccak256 } from "ethers/lib/utils.js"
import BandadaAPI from "../api/bandada"
import Subgraph from "../api/subgraph"

const LOCAL_STORAGE_KEY = "sugesto.identity"

export default function useSemaphore() {
    function _getStorageKeyForGroup(groupId: string) {
        return `${LOCAL_STORAGE_KEY}.${groupId}`
    }

    function _saveIdentity(groupId: string, identity: Identity) {
        localStorage.setItem(_getStorageKeyForGroup(groupId), identity.toString())
    }

    function getIdentity(groupId: string) {
        const identityString = localStorage.getItem(_getStorageKeyForGroup(groupId))
        if (identityString) {
            return new Identity(identityString)
        }
        return null
    }

    function generateIdentity(groupId: string, signature: string) {
        const identity = new Identity(signature)
        _saveIdentity(groupId, identity)

        return identity
    }

    async function generateProof(groupId: string, signal: string): Promise<FullProof | null> {
        const identity = getIdentity(groupId)

        if (!identity) {
            console.error("You should provide a valid identity")
            return null
        }

        // Calculate next external nullifier.
        const nullifierHashes = (await Subgraph.getFeedbacksForEvent(groupId)).map(
            ({ nullifierHash }: any) => nullifierHash
        )

        for (let index = 0; index < 5; index += 1) {
            if (!nullifierHashes.includes(calculateNullifierHash(identity.nullifier, index).toString())) {
                const membershipProof = await BandadaAPI.getMembershipProof(
                    groupId,
                    identity!.getCommitment().toString()
                )

                const feedbackHash = solidityKeccak256(["string"], [signal])

                return generateSemaphoreProof(identity as Identity, membershipProof, index, feedbackHash)
            }
        }

        return null
    }

    return {
        getIdentity,
        generateIdentity,
        generateProof
    }
}
