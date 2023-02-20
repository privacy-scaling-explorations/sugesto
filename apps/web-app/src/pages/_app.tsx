import { ChakraProvider, Container, HStack, Spinner, Stack, Text } from "@chakra-ui/react"
import "@fontsource/inter/400.css"
import type { AppProps } from "next/app"
import Head from "next/head"
import { useRouter } from "next/router"
import { useState } from "react"
import LogsContext from "../context/LogsContext"
import theme from "../styles/index"

export default function App({ Component, pageProps }: AppProps) {
    const router = useRouter()
    const [_logs, setLogs] = useState<string>("")

    return (
        <>
            <Head>
                <title>Sugesto</title>
            </Head>

            <ChakraProvider theme={theme}>
                <Container maxW="lg" flex="1" display="flex" alignItems="center">
                    <Stack py="8" display="flex" width="100%">
                        <LogsContext.Provider
                            value={{
                                _logs,
                                setLogs
                            }}
                        >
                            <Component {...pageProps} />
                        </LogsContext.Provider>
                    </Stack>
                </Container>

                <HStack
                    flexBasis="56px"
                    borderTop="1px solid #8f9097"
                    backgroundColor="#DAE0FF"
                    align="center"
                    justify="center"
                    spacing="4"
                    p="4"
                >
                    {_logs.endsWith("...") && <Spinner color="primary.400" />}
                    <Text fontWeight="bold">{_logs || `Current step: ${router.route}`}</Text>
                </HStack>
            </ChakraProvider>
        </>
    )
}
