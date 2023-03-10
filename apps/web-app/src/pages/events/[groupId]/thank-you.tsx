import React from "react"
import { Button, Heading, Text } from "@chakra-ui/react"
import { useRouter } from "next/router"

export default function ThaknkYouPage() {
    const router = useRouter()

    const { groupId } = router.query

    return (
        <>
            <Heading as="h3" size="xl">
                Thank you for sharing your feedback!
            </Heading>

            <Text>Want to read what other attendees wrote?</Text>

            <Button onClick={() => router.push(`/events/${groupId}`)}>All Feedback →</Button>
        </>
    )
}
