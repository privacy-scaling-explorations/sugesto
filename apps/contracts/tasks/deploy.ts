import { task, types } from "hardhat/config"

task("deploy", "Deploy Sugesto contract")
    .addOptionalParam("zkGroupsSemaphoreAddress", "Zk-Groups Semaphore contract address", undefined, types.string)
    .addOptionalParam("group", "Group identifier", undefined, types.int)
    .addOptionalParam("logs", "Print the logs", true, types.boolean)
    .setAction(async ({ logs, zkGroups: zkGroupsSemaphoreAddress, group: groupId }, { ethers, run }) => {
        if (!zkGroupsSemaphoreAddress) {
            const { address: zkGroupsAddress } = await run("deploy:zk-groups", {})

            const { address } = await run("deploy:zk-groups-semaphore", {
                logs,
                zkGroupsAddress,
            })

            zkGroupsSemaphoreAddress = address
        }

        if (!groupId) {
            groupId = process.env.GROUP_ID
        }

        const SugestoFactory = await ethers.getContractFactory("Sugesto")

        const sugestoContract = await SugestoFactory.deploy(zkGroupsSemaphoreAddress)

        await sugestoContract.deployed()

        if (logs) {
            console.info(`Feedback contract has been deployed to: ${sugestoContract.address}`)
        }

        return sugestoContract
    })
