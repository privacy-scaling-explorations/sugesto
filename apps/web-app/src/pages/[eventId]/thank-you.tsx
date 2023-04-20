import React from "react"
import { Button, Heading, Text } from "@chakra-ui/react"
import { useRouter } from "next/router"

export default function ThaknkYouPage() {
    const router = useRouter()

    const { eventId } = router.query

    return (
        <>
            <Heading as="h3" size="md" mb={5}>
                Thank you for sharing your feedback!
            </Heading>

            <Text mb={10}>Want to read what other attendees wrote?</Text>

            <Button colorScheme="gray" onClick={() => router.push(`/${eventId}`)}>
                All Feedback →
            </Button>
        </>
    )
}
