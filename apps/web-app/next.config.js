/** @type {import('next').NextConfig} */

const fs = require("fs")
const withPWA = require("next-pwa")

if (!fs.existsSync("./.env")) {
    // eslint-disable-next-line global-require
    require("dotenv").config({ path: "../../.env" })
}

const nextConfig = withPWA({
    dest: "public",
    disable: process.env.NODE_ENV === "development"
})({
    eslint: {
        ignoreDuringBuilds: true
    },
    reactStrictMode: true,
    swcMinify: true,
    env: {
        DEFAULT_NETWORK: process.env.DEFAULT_NETWORK,
        INFURA_API_KEY: process.env.INFURA_API_KEY,
        ETHEREUM_PRIVATE_KEY: process.env.ETHEREUM_PRIVATE_KEY,
        CONTRACT_ADDRESS: process.env.CONTRACT_ADDRESS
    },
    publicRuntimeConfig: {
        SUGESTO_GROUP_IDS: process.env.SUGESTO_GROUP_IDS,
        SUBGRAPH_URL: process.env.SUBGRAPH_URL,
        ZK_GROUPS_API_URL: process.env.ZK_GROUPS_API_URL,
        OPENZEPPELIN_AUTOTASK_WEBHOOK: process.env.OPENZEPPELIN_AUTOTASK_WEBHOOK,
        CONTRACT_ADDRESS: process.env.CONTRACT_ADDRESS
    },
    webpack: (config, { isServer }) => {
        if (!isServer) {
            config.resolve.fallback = {
                fs: false
            }
        }

        return config
    }
})

module.exports = nextConfig
