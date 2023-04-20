import React from "react"
import { Box, Button, Card, CardBody, Heading, Spinner, Text } from "@chakra-ui/react"
import { useRouter } from "next/router"
import Link from "next/link"
import Subgraph from "../../api/subgraph"
import usePromise from "../../hooks/use-promise"
import BandadaAPI from "../../api/bandada"

export default function NewFeedbackPage() {
    const router = useRouter()
    const { eventId } = router.query

    const [group, { isFetching: isFetchingGroup, error: apiError }] = usePromise(
        () => BandadaAPI.getGroup(eventId as string),
        {
            conditions: [eventId],
            defaultValue: {}
        }
    )

    const [feedback, { isFetching: isFetchingFeedback, error: subgraphError }] = usePromise<any[]>(
        () => Subgraph.getFeedbacksForEvent(eventId as string),
        {
            conditions: [eventId],
            dependencies: [eventId],
            defaultValue: []
        }
    )

    if (isFetchingGroup || isFetchingFeedback) {
        return <Spinner />
    }

    if (subgraphError || apiError) {
        return <Text>Error while fetching feedback for group</Text>
    }

    return (
        <>
            <Link href="/">
                <Text color="blue.500" mb="1rem">
                    All Events
                </Text>
            </Link>

            <Heading size="md" mb="2rem">
                {group.name}
            </Heading>

            <Box mb="5rem">
                {feedback.length === 0 && (
                    <Text fontSize={16} mb={1}>
                        No feedback yet. Be the first to share your thoughts!
                    </Text>
                )}

                {feedback.map((f, i) => (
                    <Card key={i} mb={2}>
                        <CardBody>
                            <Text>{f.feedback}</Text>
                        </CardBody>
                    </Card>
                ))}
            </Box>

            <Text fontSize={12} mb={1}>
                Do you have more to say? You can leave feedback up to 5 times.
            </Text>

            <Button colorScheme="gray" onClick={() => router.push(`/${eventId}/new`)}>
                Share Again
            </Button>
        </>
    )
}
