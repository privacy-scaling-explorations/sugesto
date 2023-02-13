import { Contract, providers, Wallet } from "ethers"
import type { NextApiRequest, NextApiResponse } from "next"
import Sugesto from "../../../contract-artifacts/Sugesto.json"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (typeof process.env.CONTRACT_ADDRESS !== "string") {
        throw new Error("Please, define CONTRACT_ADDRESS in your .env file")
    }

    if (typeof process.env.ETHEREUM_URL !== "string") {
        throw new Error("Please, define ETHEREUM_URL in your .env file")
    }

    if (typeof process.env.ETHEREUM_PRIVATE_KEY !== "string") {
        throw new Error("Please, define ETHEREUM_PRIVATE_KEY in your .env file")
    }

    const ethereumPrivateKey = process.env.ETHEREUM_PRIVATE_KEY
    const ethereumURL = process.env.ETHEREUM_URL
    const contractAddress = process.env.CONTRACT_ADDRESS

    const provider = new providers.JsonRpcProvider(ethereumURL)
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

        res.status(200).end()
    } catch (error: any) {
        console.error(error)

        res.status(500).end()
    }
}
