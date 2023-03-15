const zkGroupsUrl = process.env.NEXT_PUBLIC_ZK_GROUPS_API_URL

type Invite = {
    code: string
    redeemed: boolean
    groupId: string
    groupName: string
}

type Group = {
    admin: string
    name: string
    description: string
    treeDepth: number
}

export default class API {
    static async getInvite(inviteCode: string) {
        const response = await fetch(`${zkGroupsUrl}/invites/${inviteCode}`)
        if (!response.ok) {
            throw new Error(response.statusText)
        }

        return response.json() as Promise<Invite>
    }

    static async getGroup(groupId: string) {
        const response = await fetch(`${zkGroupsUrl}/groups/${groupId}`)
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
        const response = await fetch(`${zkGroupsUrl}/groups/${groupId}/${identityCommitment}`, {
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
        const response = await fetch(`${zkGroupsUrl}/groups/${groupId}/${memberId}/proof`)
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
        feedbackNumber: number
        nullifierHash: string
        proof: any
    }) {
        const response = await fetch(`/api/feedback`, {
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
