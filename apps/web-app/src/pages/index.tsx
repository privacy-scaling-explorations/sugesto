import React from "react"
import { Card, CardBody, Heading, Text } from "@chakra-ui/react"
import Link from "next/link"
import usePromise from "../hooks/use-promise"
import BandadaAPI from "../api/bandada"

export default function AllEventsPage() {
    const [events] = usePromise(() => BandadaAPI.getAllSugestoGroups(), {
        defaultValue: []
    })

    return (
        <>
            <Heading as="h3" size="xl" mb={10}>
                All Events
            </Heading>

            {events.map((event) => (
                <Link href={`/${event.id}`} key={event.id}>
                    <Card key={event.id} p={4} mb={4}>
                        <CardBody>
                            <Heading as="h4" size="sm">
                                {event.name}
                            </Heading>
                            <Text>{event.description}</Text>
                        </CardBody>
                    </Card>
                </Link>
            ))}
        </>
    )
}
