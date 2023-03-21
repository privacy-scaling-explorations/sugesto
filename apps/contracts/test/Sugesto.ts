import { Group } from "@semaphore-protocol/group"
import { Identity } from "@semaphore-protocol/identity"
import { generateProof } from "@semaphore-protocol/proof"
import { expect } from "chai"
import { solidityKeccak256 } from "ethers/lib/utils"
import { ethers, run } from "hardhat"
// @ts-ignore: typechain folder will be generated after contracts compilation
import { Sugesto } from "../build/typechain"
import { config } from "../package.json"

describe("Sugesto", () => {
    let sugesto: Sugesto

    const groupId = 42
    const merkleTreeDepth = 20

    const group = new Group(groupId, merkleTreeDepth)

    // Helpers
    async function createFeedbackTransaction(params: {
        feedback: string
        feedbackNumber: number
        member: Identity
        group?: Group
    }) {
        const { feedback, feedbackNumber, member, group: _group = group } = params

        const wasmFilePath = `${config.paths.build["snark-artifacts"]}/semaphore.wasm`
        const zkeyFilePath = `${config.paths.build["snark-artifacts"]}/semaphore.zkey`

        const feedbackHash = solidityKeccak256(["string"], [feedback])

        const fullProof = await generateProof(member, _group, feedbackNumber, feedbackHash, {
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

        return { transaction, nullifierHash: fullProof.nullifierHash }
    }

    async function addMemberToGroup(member: Identity) {
        group.addMembers([member.commitment])

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
    }

    before(async () => {
        sugesto = await run("deploy", { logs: false, group: groupId })
    })

    describe("# sendFeedback", () => {
        it("Should allow users to send feedback anonymously", async () => {
            const feedback = "Hello world"
            const member = new Identity()

            addMemberToGroup(member)

            const { transaction, nullifierHash } = await createFeedbackTransaction({
                feedback,
                feedbackNumber: 1,
                member
            })

            await expect(transaction).to.emit(sugesto, "NewFeedback").withArgs(groupId, feedback, nullifierHash)
        })

        it("Should fail if the user submit multiple feedback with same feedbackNumber", async () => {
            const feedback = "Hello world"
            const member = new Identity()

            addMemberToGroup(member)

            const { transaction, nullifierHash } = await createFeedbackTransaction({
                feedback,
                feedbackNumber: 1,
                member
            })

            await expect(transaction).to.emit(sugesto, "NewFeedback").withArgs(groupId, feedback, nullifierHash)

            const { transaction: transaction2 } = await createFeedbackTransaction({
                feedback: "Hi",
                feedbackNumber: 1,
                member
            })

            await expect(transaction2).to.be.revertedWith("ZKGroupsSemaphore__YouAreUsingTheSameNullifierTwice")
        })

        it("Should fail if the feedback number exceed the limit", async () => {
            const feedback = "Hello world"
            const member = new Identity()

            addMemberToGroup(member)

            // Default limit is 5
            const { transaction } = await createFeedbackTransaction({ feedback, feedbackNumber: 6, member })

            await expect(transaction).to.be.revertedWith("Sugesto__FeedbackLimitExceeded")
        })

        it("Should fail if the group is not part of ZK groups", async () => {
            const feedback = "Hello world"
            const member = new Identity()
            const group2 = new Group(10, 20)

            group2.addMembers([member.commitment])

            const { transaction } = await createFeedbackTransaction({
                feedback,
                feedbackNumber: 1,
                group: group2,
                member
            })

            await expect(transaction).to.be.revertedWith("Semaphore__InvalidProof")
        })

        it("Should allow admins to update the feedback limit", async () => {
            const feedback = "Hello world"
            const member = new Identity()

            addMemberToGroup(member)

            const { transaction } = await createFeedbackTransaction({ feedback, feedbackNumber: 6, member })
            await expect(transaction).to.be.revertedWith("Sugesto__FeedbackLimitExceeded")

            await sugesto.updateFeedbackLimit(7)

            const { transaction: transaction2, nullifierHash } = await createFeedbackTransaction({
                feedback,
                feedbackNumber: 6,
                member
            })

            await expect(transaction2).to.emit(sugesto, "NewFeedback").withArgs(groupId, feedback, nullifierHash)
        })
    })

    describe("# blacklistFeedback", () => {
        const feedback = "Fuck the system"
        let member: Identity

        before(async () => {
            member = new Identity()

            addMemberToGroup(member)
        })

        it("Should blacklist hateful feedback messages", async () => {
            const { nullifierHash } = await createFeedbackTransaction({ feedback, feedbackNumber: 1, member })

            const transaction = sugesto.blacklistFeedback([nullifierHash])

            await expect(transaction).to.emit(sugesto, "BlacklistedFeedback").withArgs([nullifierHash])
        })
    })
})
