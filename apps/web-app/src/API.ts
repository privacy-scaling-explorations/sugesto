const zkGroupsUrl = process.env.NEXT_PUBLIC_ZK_GROUPS_API_URL;

type Invite = {
  code: string;
  redeemed: boolean;
  group: string;
}

export default class API {
  static async getInvite(inviteCode: string) {
    const response = await fetch(`${zkGroupsUrl}/invites/${inviteCode}`)
    return response.json() as Promise<Invite>;
  }
}