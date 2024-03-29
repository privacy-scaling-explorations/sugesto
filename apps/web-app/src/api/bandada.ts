import getNextConfig from "next/config"
import Sugesto from "../../contract-artifacts/Sugesto.json"

const { publicRuntimeConfig: env } = getNextConfig()

type Invite = {
    code: string
    redeemed: boolean
    groupId: string
    groupName: string
}

type Group = {
    id: string
    admin: string
    name: string
    description: string
    treeDepth: number
}

export default class BandadaAPI {
    static async getInvite(inviteCode: string) {
        const response = await fetch(`${env.BANDADA_API_URL}/invites/${inviteCode}`)
        if (!response.ok) {
            throw new Error(response.statusText)
        }

        return response.json() as Promise<Invite>
    }

    static async getAllSugestoGroups() {
        const sugestoGroupsIds = env.SUGESTO_GROUP_IDS?.split(",") || []

        const groups = await Promise.all(
            sugestoGroupsIds.map(async (groupId: any) => {
                const response = await fetch(`${env.BANDADA_API_URL}/groups/${groupId}`)
                if (!response.ok) {
                    throw new Error(response.statusText)
                }

                return response.json() as Promise<Group>
            })
        )

        return groups
    }

    static async getGroup(groupId: string) {
        const response = await fetch(`${env.BANDADA_API_URL}/groups/${groupId}`)
        if (!response.ok) {
            throw new Error(response.statusText)
        }

        return response.json() as Promise<Group>
    }

    static async joinGroup({
        groupId,
        inviteCode,
        identityCommitment
    }: {
        groupId: string
        inviteCode: string
        identityCommitment: string
    }) {
        const response = await fetch(`${env.BANDADA_API_URL}/groups/${groupId}/${identityCommitment}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                inviteCode
            })
        })

        if (!response.ok) {
            throw new Error(response.statusText)
        }
    }

    static async getMembershipProof(groupId: string, memberId: string) {
        const response = await fetch(`${env.BANDADA_API_URL}/groups/${groupId}/${memberId}/proof`)
        if (!response.ok) {
            throw new Error(response.statusText)
        }

        const result = (await response.json()) as {
            root: string
            leaf: string
            siblings: string[]
            pathIndices: number[]
        }

        const proof = {
            root: BigInt(result!.root),
            leaf: BigInt(result!.leaf),
            siblings: result!.siblings.map((s) => BigInt(s)),
            pathIndices: result!.pathIndices
        }

        return proof
    }

    static async submitFeedback({
        groupId,
        feedback,
        proof,
        nullifierHash,
        merkleTreeDepth,
        feedbackNumber
    }: {
        groupId: string
        feedback: string
        merkleTreeDepth: number
        feedbackNumber: string
        nullifierHash: string
        proof: any
    }) {
        let response: any

        if (env.OPENZEPPELIN_AUTOTASK_WEBHOOK) {
            response = await fetch(env.OPENZEPPELIN_AUTOTASK_WEBHOOK, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    abi: Sugesto.abi,
                    address: env.CONTRACT_ADDRESS,
                    functionName: "sendFeedback",
                    functionParameters: [groupId, merkleTreeDepth, feedback, feedbackNumber, nullifierHash, proof]
                })
            })
        } else {
            response = await fetch(`/api/feedback`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    groupId,
                    merkleTreeDepth,
                    feedback,
                    feedbackNumber,
                    nullifierHash,
                    proof
                })
            })
        }

        if (!response.ok) {
            const errorResponse = await response.json()
            if (errorResponse) {
                throw new Error(JSON.stringify(errorResponse, null, 2))
            } else {
                throw new Error(response.statusText)
            }
        }
    }
}
