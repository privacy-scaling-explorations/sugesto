import { task, types } from "hardhat/config"

task("deploy", "Deploy Sugesto contract")
    .addOptionalParam("zkGroupsSemaphore", "ZKGroupsSemaphore contract address", undefined, types.string)
    .addOptionalParam("group", "Group identifier", undefined, types.int)
    .addOptionalParam("feedbackLimit", "Number of feedbacks allowed per event", 5, types.int)
    .addOptionalParam("logs", "Print the logs", true, types.boolean)
    .setAction(async ({ logs, zkGroupsSemaphore: zkGroupsSemaphoreAddress, group: groupId, feedbackLimit }, { ethers, run }) => {
        if (!zkGroupsSemaphoreAddress) {
            const { address } = await run("deploy:zk-groups-semaphore", {
                logs
            })

            zkGroupsSemaphoreAddress = address
        }

        if (!groupId) {
            groupId = process.env.GROUP_ID
        }

        const SugestoFactory = await ethers.getContractFactory("Sugesto")

        const sugesto = await SugestoFactory.deploy(zkGroupsSemaphoreAddress, feedbackLimit)

        await sugesto.deployed()

        if (logs) {
            console.info(`Sugesto contract has been deployed to: ${sugesto.address}`)
        }

        return sugesto
    })
