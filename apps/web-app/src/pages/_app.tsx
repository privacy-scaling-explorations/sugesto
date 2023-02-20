import { ChakraProvider, Container, Stack } from "@chakra-ui/react"
import "@fontsource/inter/400.css"
import "@rainbow-me/rainbowkit/styles.css"
import type { AppProps } from "next/app"
import Head from "next/head"
import { connectorsForWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit"
import { configureChains, createClient, WagmiConfig } from "wagmi"
import { goerli } from "wagmi/chains"
import {
    metaMaskWallet,
    coinbaseWallet,
    walletConnectWallet,
    injectedWallet
} from "@rainbow-me/rainbowkit/wallets"
import { publicProvider } from "wagmi/providers/public"
import theme from "../styles/index"

const { chains, provider, webSocketProvider } = configureChains([goerli], [publicProvider()])

const connectors = connectorsForWallets([
    {
        groupName: "Wallets",
        wallets: [
            injectedWallet({ chains }),
            metaMaskWallet({ chains }),
            coinbaseWallet({ appName: "Zk Groups", chains }),
            walletConnectWallet({ chains })
        ]
    }
])

const wagmiClient = createClient({
    autoConnect: false,
    connectors,
    provider,
    webSocketProvider
})

export default function App({ Component, pageProps }: AppProps) {
    return (
        <>
            <Head>
                <title>Sugesto</title>
            </Head>

            <WagmiConfig client={wagmiClient}>
                <RainbowKitProvider chains={chains} initialChain={goerli}>
                    <ChakraProvider theme={theme}>
                        <Container
                            maxW="lg"
                            flex="1"
                            display="flex"
                            justifyContent="center"
                            width="100%"
                            flexDir="column"
                        >
                            <Component {...pageProps} />
                        </Container>
                    </ChakraProvider>
                </RainbowKitProvider>
            </WagmiConfig>
        </>
    )
}
