import { task, types } from "hardhat/config"
import { getContractAddresses } from "@bandada/utils"

task("deploy", "Deploy Sugesto contract")
    .addOptionalParam("bandadaSemaphore", "BandadaSemaphore contract address", undefined, types.string)
    .addOptionalParam("feedbackLimit", "Number of feedbacks allowed per event", 5, types.int)
    .addOptionalParam("logs", "Print the logs", true, types.boolean)
    .setAction(
        async (
            { logs, bandadaSemaphore: bandadaSemaphoreAddress, feedbackLimit },
            { ethers, run, hardhatArguments }
        ) => {
            if (!bandadaSemaphoreAddress) {
                if (
                    !hardhatArguments.network ||
                    hardhatArguments.network === "localhost" ||
                    hardhatArguments.network === "hardhat"
                ) {
                    const { address } = await run("deploy:bandada-semaphore", {
                        logs
                    })

                    bandadaSemaphoreAddress = address
                } else {
                    const { BandadaSemaphore } = getContractAddresses(hardhatArguments.network as any)

                    bandadaSemaphoreAddress = BandadaSemaphore
                }
            }

            const SugestoFactory = await ethers.getContractFactory("Sugesto")

            const sugesto = await SugestoFactory.deploy(bandadaSemaphoreAddress, feedbackLimit)

            await sugesto.deployed()

            if (logs) {
                console.info(`Sugesto contract has been deployed to: ${sugesto.address}`)
            }

            return sugesto
        }
    )
