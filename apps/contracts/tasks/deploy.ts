import { task, types } from "hardhat/config"
import { getContractAddresses } from "@bandada/utils"

task("deploy", "Deploy Sugesto contract")
    .addOptionalParam("zkGroupsSemaphore", "ZKGroupsSemaphore contract address", undefined, types.string)
    .addOptionalParam("feedbackLimit", "Number of feedbacks allowed per event", 5, types.int)
    .addOptionalParam("logs", "Print the logs", true, types.boolean)
    .setAction(
        async (
            { logs, zkGroupsSemaphore: zkGroupsSemaphoreAddress, feedbackLimit },
            { ethers, run, hardhatArguments }
        ) => {
            if (!zkGroupsSemaphoreAddress) {
                if (
                    !hardhatArguments.network ||
                    hardhatArguments.network === "localhost" ||
                    hardhatArguments.network === "hardhat"
                ) {
                    const { address } = await run("deploy:zk-groups-semaphore", {
                        logs
                    })

                    zkGroupsSemaphoreAddress = address
                } else {
                    const { BandadaSemaphore } = getContractAddresses(hardhatArguments.network as any)

                    zkGroupsSemaphoreAddress = BandadaSemaphore
                }
            }

            const SugestoFactory = await ethers.getContractFactory("Sugesto")

            const sugesto = await SugestoFactory.deploy(zkGroupsSemaphoreAddress, feedbackLimit)

            await sugesto.deployed()

            if (logs) {
                console.info(`Sugesto contract has been deployed to: ${sugesto.address}`)
            }

            return sugesto
        }
    )
