import { Group } from "@semaphore-protocol/group"
import { Identity } from "@semaphore-protocol/identity"
import { generateProof, packToSolidityProof } from "@semaphore-protocol/proof"
import { expect } from "chai"
import { solidityKeccak256 } from "ethers/lib/utils"
import { run, ethers } from "hardhat"
import { Sugesto, ZKGroups, ZKGroupsSemaphore } from "../build/typechain"
import { config } from "../package.json"

describe("Sugesto", () => {
    let sugestoContract: Sugesto

    const users: any = []
    const groupId = 42
    const merkleTreeDepth = 20
    const group = new Group(merkleTreeDepth)

    before(async () => {
        sugestoContract = await run("deploy", { logs: false, group: groupId })

        users.push({
            identity: new Identity(),
        })

        users.push({
            identity: new Identity(),
        })

        group.addMember(users[0].identity.generateCommitment())
        group.addMember(users[1].identity.generateCommitment())

        const zkGroupsSemaphore = await ethers.getContractAt("ZKGroupsSemaphore", await sugestoContract.zkGroupsSempahore()) as ZKGroupsSemaphore;
        const zkGroups = await ethers.getContractAt("ZKGroups", await zkGroupsSemaphore.zkGroups()) as ZKGroups;

        await zkGroups.updateGroups([{
            id: groupId,
            fingerprint: group.root.toString()
        }])

        expect(group.root.toString()).eq((await zkGroups.groups(groupId)).toString())
    })

    describe("# sendFeedback", () => {
        const wasmFilePath = `${config.paths.build["snark-artifacts"]}/semaphore.wasm`
        const zkeyFilePath = `${config.paths.build["snark-artifacts"]}/semaphore.zkey`

        it("Should allow users to send feedback anonymously", async () => {
            const feedback = "Hello World"
            const feedbackHash = solidityKeccak256(["string"], [feedback])
            const feedbackNumber = 1

            const fullProof = await generateProof(users[1].identity, group, BigInt(feedbackNumber), feedbackHash, {
                wasmFilePath,
                zkeyFilePath
            })
            const solidityProof = packToSolidityProof(fullProof.proof)

            const transaction = sugestoContract.sendFeedback(
                groupId,
                merkleTreeDepth,
                feedback,
                feedbackNumber,
                fullProof.publicSignals.nullifierHash,
                solidityProof
            )

            await expect(transaction).to.emit(sugestoContract, "NewFeedback").withArgs(feedback)
        })
    })
})
