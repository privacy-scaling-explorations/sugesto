import React from "react"
import { Box, Button, Divider, Heading, Spinner, Text } from "@chakra-ui/react"
import { useConnectModal } from "@rainbow-me/rainbowkit"
import { useRouter } from "next/router"
import { useAccount, useSignMessage } from "wagmi"
import API from "../API"
import usePromise from "../hooks/use-promise"
import useSemaphore from "../hooks/use-sempahore"

export default function JoinPage() {
    const router = useRouter()
    const { openConnectModal } = useConnectModal()
    const { signMessageAsync } = useSignMessage()
    const { generateIdentity, getIdentity } = useSemaphore()

    const [isModalOpen, setIsModalOpen] = React.useState(false)

    const { inviteCode } = router.query
    const [invite, { isFetching, error }] = usePromise(() => API.getInvite(inviteCode as string), {
        conditions: [inviteCode]
    })

    async function generateIdentityAndJoinGroup() {
        try {
            let identity = getIdentity(invite.groupId)

            if (!identity) {
                const signature = await signMessageAsync({ message: invite.groupName })
                identity = generateIdentity(invite.groupId, signature)
            }

            await API.joinGroup({
                groupName: invite.groupName,
                identityCommitment: identity.getCommitment().toString(),
                inviteCode: inviteCode as string
            })

            router.push(`/event/${invite.groupId}`)
        } catch (e) {
            console.error("error", e)
            alert("Error ocurred while join group")
        }
    }

    const { isConnected } = useAccount({ onConnect: generateIdentityAndJoinGroup })

    function onLeaveFeedbackClick() {
        // If user already has an identity, join group and redirect
        if (getIdentity(invite.groupId)) {
            generateIdentityAndJoinGroup()
        } else {
            setIsModalOpen(true)
        }
    }

    async function onConnectWalletClick() {
        if (isConnected) {
            await generateIdentityAndJoinGroup()
        } else {
            openConnectModal?.()
        }
    }

    if (isFetching) {
        return <Spinner className="text-center" />
    }

    if (error || !invite || invite.redeemed === true) {
        return <Text>Invitation code is invalid or already redeemed.</Text>
    }

    return (
        <>
            <Text>Thanks for attending</Text>
            <Heading as="h3" size="xl">
                {invite.groupName}
            </Heading>

            <Text pt="2" fontSize="md">
                This invite was only sent to people who attended the event. Sugesto will use Semaphore to create an
                anonymous identity for you to use within the group.
            </Text>

            <Box py="6">
                <Button
                    w="100%"
                    fontWeight="bold"
                    justifyContent="left"
                    colorScheme="primary"
                    px="4"
                    disabled={isModalOpen}
                    onClick={onLeaveFeedbackClick}
                >
                    Leave event feedback
                </Button>
            </Box>

            <Text>
                If you do not wish to join this group, simply close this tab in your browser. Every invitation link can
                only be used once and may expire. Learn more about Sugesto
            </Text>

            {isModalOpen && (
                <>
                    <Divider my={8} />
                    <Box>
                        <Text>
                            Use your wallet to generate an anonymous Semaphore identity. Sugesto cannot learn your
                            wallet address from your anonymous identity.
                        </Text>

                        <Button
                            w="100%"
                            fontWeight="bold"
                            justifyContent="left"
                            colorScheme="primary"
                            px="4"
                            mt={4}
                            onClick={onConnectWalletClick}
                        >
                            Connect Wallet
                        </Button>
                    </Box>
                </>
            )}
        </>
    )
}
