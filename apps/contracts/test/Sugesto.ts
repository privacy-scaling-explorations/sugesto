import { Group } from "@semaphore-protocol/group"
import { Identity } from "@semaphore-protocol/identity"
import { generateProof } from "@semaphore-protocol/proof"
import { expect } from "chai"
import { solidityKeccak256 } from "ethers/lib/utils"
import { ethers, run } from "hardhat"
// @ts-ignore: typechain folder will be generated after contracts compilation
import { Sugesto, ZKGroups } from "../build/typechain"
import { config } from "../package.json"

describe("Sugesto", () => {
    let sugesto: Sugesto

    const groupId = 42
    const merkleTreeDepth = 20

    const group = new Group(groupId, merkleTreeDepth)
    const members = [new Identity(), new Identity(), new Identity()]

    before(async () => {
        sugesto = await run("deploy", { logs: false, group: groupId })

        group.addMembers(members.map(({ commitment }) => commitment))

        const zkGroupsSemaphoreAddress = await sugesto.zkGroupsSemaphore()
        const zkGroupsSemaphore = await ethers.getContractAt("ZKGroupsSemaphore", zkGroupsSemaphoreAddress)

        const zkGroupsAddress = await zkGroupsSemaphore.zkGroups()
        const zkGroups = await ethers.getContractAt("ZKGroups", zkGroupsAddress)

        await zkGroups.updateGroups([
            {
                id: groupId,
                fingerprint: group.root.toString()
            }
        ])

        const fingerprint = await zkGroups.groups(groupId)

        expect(group.root.toString()).eq(fingerprint.toString())
    })

    describe("# sendFeedback", () => {
        const wasmFilePath = `${config.paths.build["snark-artifacts"]}/semaphore.wasm`
        const zkeyFilePath = `${config.paths.build["snark-artifacts"]}/semaphore.zkey`

        it("Should allow users to send feedback anonymously", async () => {
            const feedback = "Hello World"
            const feedbackHash = solidityKeccak256(["string"], [feedback])
            const feedbackNumber = 1

            const fullProof = await generateProof(members[1], group, feedbackNumber, feedbackHash, {
                wasmFilePath,
                zkeyFilePath
            })

            const transaction = sugesto.sendFeedback(
                groupId,
                merkleTreeDepth,
                feedback,
                feedbackNumber,
                fullProof.nullifierHash,
                fullProof.proof
            )

            await expect(transaction).to.emit(sugesto, "NewFeedback").withArgs(feedback)
        })
    })
})
