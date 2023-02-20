import React from "react"
import { Box, Button, Divider, Heading, Spinner, Text } from "@chakra-ui/react"
import { useConnectModal } from "@rainbow-me/rainbowkit"
import { Identity } from "@semaphore-protocol/identity"
import { useRouter } from "next/router"
import API from "../API"
import usePromise from "../hooks/use-promise"

export default function JoinPage() {
    const router = useRouter()
    const { openConnectModal } = useConnectModal()

    const [_identity, setIdentity] = React.useState<Identity>()
    const [isModalOpen, setIsModalOpen] = React.useState(false)

    const { inviteCode } = router.query
    const [invite, { isFetching, error }] = usePromise(() => API.getInvite(inviteCode as string), {
        conditions: [inviteCode]
    })

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
                {invite.group}
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
                    onClick={() => setIsModalOpen(true)}
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
                            onClick={() => openConnectModal?.()}
                        >
                            Connect Wallet
                        </Button>
                    </Box>
                </>
            )}

            {/* {_identity ? (
                <Box py="6" whiteSpace="nowrap">
                    <Box p="5" borderWidth={1} borderColor="gray.500" borderRadius="4px">
                        <Text textOverflow="ellipsis" overflow="hidden">
                            Trapdoor: {_identity.trapdoor.toString()}
                        </Text>
                        <Text textOverflow="ellipsis" overflow="hidden">
                            Nullifier: {_identity.nullifier.toString()}
                        </Text>
                        <Text textOverflow="ellipsis" overflow="hidden">
                            Commitment: {_identity.commitment.toString()}
                        </Text>
                    </Box>
                </Box>
            ) : (
                <Box py="6">
                    <Button
                        w="100%"
                        fontWeight="bold"
                        justifyContent="left"
                        colorScheme="primary"
                        px="4"
                        // onClick={createIdentity}
                        // leftIcon={<IconAddCircleFill />}
                    >
                        Create identity
                    </Button>
                </Box>
            )} */}
        </>
    )
}
