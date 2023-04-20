import { Identity } from "@semaphore-protocol/identity"
import { generateProof as generateSemaphoreProof } from "@semaphore-protocol/proof"
import { solidityKeccak256 } from "ethers/lib/utils.js"
import BandadaAPI from "../api/bandada"

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

    async function generateProof(groupId: string, signal: string, externalNullifier: number) {
        const identity = getIdentity(groupId)
        const membershipProof = await BandadaAPI.getMembershipProof(groupId, identity!.getCommitment().toString())

        const feedbackHash = solidityKeccak256(["string"], [signal])

        const proof = await generateSemaphoreProof(
            identity as Identity,
            membershipProof,
            externalNullifier,
            feedbackHash
        )

        return proof
    }

    return {
        getIdentity,
        generateIdentity,
        generateProof
    }
}
