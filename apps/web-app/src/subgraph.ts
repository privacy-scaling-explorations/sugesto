const subgraphURL = process.env.NEXT_PUBLIC_SUBGRAPH_URL

export default class SemaphoreAPI {
    static async getFeedbacksForEvent(groupId: string) {
        const response = await fetch(`${subgraphURL}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                query: `{
                    feedbacks(where: { groupId: "${groupId}" }) {
                        feedback
                        createdAt
                    }
                }`
            })
        })

        if (!response.ok) {
            throw new Error(response.statusText)
        }

        const { data } = await response.json()
        return data.feedbacks
    }
}
