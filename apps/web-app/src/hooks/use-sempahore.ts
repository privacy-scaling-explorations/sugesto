import { Identity } from "@semaphore-protocol/identity"

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

    return {
        getIdentity,
        generateIdentity
    }
}
