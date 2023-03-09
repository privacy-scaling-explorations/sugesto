
import React from "react"
import { Spinner, Text } from "@chakra-ui/react"
import { useRouter } from "next/router"
import Subgraph from "../../../subgraph"
import usePromise from "../../../hooks/use-promise"

export default function NewFeedbackPage() {
    const router = useRouter()
    const { groupId } = router.query

    const [feedback, { isFetching, error }] = usePromise<any[]>(() => Subgraph.getFeedbacksForEvent(groupId as string), {
        conditions: [groupId],
        dependencies: [groupId],
        defaultValue: []
    })

    if (isFetching) {
        return <Spinner />
    }

    if (error) {
        return <Text>Error while fetching feedback for group</Text>
    }

    return (
        <>
            {feedback.map(f => (
              <Text>{f.feedback}</Text>
            ))}
        </>
    )
}

