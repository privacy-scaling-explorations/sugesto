import { Contract, providers, Wallet } from "ethers"
import type { NextApiRequest, NextApiResponse } from "next"
import Sugesto from "../../../contract-artifacts/Sugesto.json"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (typeof process.env.CONTRACT_ADDRESS !== "string") {
        throw new Error("Please, define CONTRACT_ADDRESS in your .env file")
    }

    if (typeof process.env.DEFAULT_NETWORK !== "string") {
        throw new Error("Please, define DEFAULT_NETWORK in your .env file")
    }

    if (typeof process.env.INFURA_API_KEY !== "string") {
        throw new Error("Please, define INFURA_API_KEY in your .env file")
    }

    if (typeof process.env.ETHEREUM_PRIVATE_KEY !== "string") {
        throw new Error("Please, define ETHEREUM_PRIVATE_KEY in your .env file")
    }

    const ethereumPrivateKey = process.env.ETHEREUM_PRIVATE_KEY
    const ethereumNetwork = process.env.DEFAULT_NETWORK
    const infuraApiKey = process.env.INFURA_API_KEY
    const contractAddress = process.env.CONTRACT_ADDRESS

    const provider =
        ethereumNetwork === "localhost"
            ? new providers.JsonRpcProvider()
            : new providers.InfuraProvider(ethereumNetwork, infuraApiKey)

    const signer = new Wallet(ethereumPrivateKey, provider)
    const contract = new Contract(contractAddress, Sugesto.abi, signer)

    const { groupId, merkleTreeDepth, feedback, feedbackNumber, nullifierHash, proof } = req.body

    try {
        const transaction = await contract.sendFeedback(
            groupId,
            merkleTreeDepth,
            feedback,
            feedbackNumber,
            nullifierHash,
            proof
        )

        await transaction.wait()

        res.json({ transactionHash: transaction.hash })
    } catch (error: any) {
        console.error(error)

        res.status(500).json({
            error: error.message
        })
    }
}
