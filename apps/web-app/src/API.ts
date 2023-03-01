const zkGroupsUrl = process.env.NEXT_PUBLIC_ZK_GROUPS_API_URL

type Invite = {
    code: string
    redeemed: boolean
    groupId: string
    groupName: string
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

        return response.json() as Promise<{ name: string }>
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
}
