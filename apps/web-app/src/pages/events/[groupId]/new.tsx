import React from "react"
import { Heading, Spinner, Text } from "@chakra-ui/react"
import { useRouter } from "next/router"
import API from "../../../API"
import usePromise from "../../../hooks/use-promise"

export default function NewFeedbackPage() {
    const router = useRouter()

    const { groupId } = router.query
    const [group, { isFetching, error }] = usePromise(() => API.getGroup(groupId as string), {
        conditions: [groupId]
    })

    if (isFetching) {
        return <Spinner />
    }

    if (!group) {
        return <Text>Group not found</Text>
    }

    return (
        <>
            <Text>Thanks for attending</Text>
            <Heading as="h3" size="xl">
                {group.name}
            </Heading>

            <Text pt="2" fontSize="md">
                Leave feedback
            </Text>
        </>
    )
}
