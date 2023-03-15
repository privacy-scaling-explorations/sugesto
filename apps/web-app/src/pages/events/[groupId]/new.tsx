import React from "react"
import { Button, Heading, Spinner, Text, Textarea } from "@chakra-ui/react"
import { useRouter } from "next/router"
import ZkGroupsAPI from "../../../api/zk-groups"
import usePromise from "../../../hooks/use-promise"
import useSemaphore from "../../../hooks/use-sempahore"

export default function NewFeedbackPage() {
    const router = useRouter()
    const { groupId } = router.query

    const { generateProof } = useSemaphore()
    const [feedback, setFeedback] = React.useState("")
    const [isSubmitting, setIsSubmitting] = React.useState(false)

    const [group, { isFetching, error: apiError }] = usePromise(() => ZkGroupsAPI.getGroup(groupId as string), {
        conditions: [groupId]
    })

    async function onSubmitClick(e: React.MouseEvent<HTMLButtonElement>) {
        try {
            e.preventDefault()
            setIsSubmitting(true)

            const feedbackNumber = 2 // TODO: Compute this dynamically

            const proof = await generateProof(groupId as string, feedback, feedbackNumber)

            await ZkGroupsAPI.submitFeedback({
                groupId: groupId as string,
                proof: proof.proof,
                merkleTreeDepth: group.treeDepth,
                feedback,
                feedbackNumber,
                nullifierHash: proof.nullifierHash.toString()
            })

            router.push(`/events/${groupId}/thank-you`)
        } catch (error) {
            alert("Unexpected error occurred. Please try again later.")
            console.error(error)
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isFetching) {
        return <Spinner />
    }

    if (!group) {
        return <Text>Group not found</Text>
    }

    if (apiError) {
        return <Text>Error while fetching group details</Text>
    }

    return (
        <>
            <Text>Thanks for attending</Text>
            <Heading as="h3" size="xl">
                {group.name}
            </Heading>

            <Text pt="2" fontSize="md">
                What feedback do you have for the event organizers?
            </Text>

            <Textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} />

            <Button isLoading={isSubmitting} onClick={onSubmitClick}>
                Share
            </Button>
        </>
    )
}
