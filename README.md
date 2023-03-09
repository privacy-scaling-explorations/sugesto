<p align="center">
    <h1 align="center">
        PSE Sugesto
    </h1>
</p>

<p align="center">
    <a href="https://github.com/semaphore-protocol" target="_blank">
        <img src="https://img.shields.io/badge/project-PSE-blue.svg?style=flat-square">
    </a>
    <a href="https://github.com/privacy-scaling-explorations/sugesto/blob/main/LICENSE">
        <img alt="Github license" src="https://img.shields.io/github/license/privacy-scaling-explorations/sugesto.svg?style=flat-square">
    </a>
    <a href="https://github.com/privacy-scaling-explorations/sugesto/actions?query=workflow%3Astyle">
        <img alt="GitHub Workflow style" src="https://img.shields.io/github/workflow/status/privacy-scaling-explorations/sugesto/style?label=style&style=flat-square&logo=github">
    </a>
    <a href="https://eslint.org/">
        <img alt="Linter eslint" src="https://img.shields.io/badge/linter-eslint-8080f2?style=flat-square&logo=eslint">
    </a>
    <a href="https://prettier.io/">
        <img alt="Code style prettier" src="https://img.shields.io/badge/code%20style-prettier-f8bc45?style=flat-square&logo=prettier">
    </a>
</p>

| Sugesto is a simple DApp based on Semaphore that can be used to send anonymous feedback in our internal projects/events (currently on Goerli). |
| ---------------------------------------------------------------------------------------------------------------------------------------------- |

## 🛠 Install

Clone this repository:

```bash
git clone https://github.com/privacy-scaling-explorations/sugesto.git
```

and install the dependencies:

```bash
cd sugesto && yarn
```

## 📜 Usage

Copy the `.env.example` file as `.env`:

```bash
cp .env.example .env
```

and add your environment variables.

> **Note**  
> You should at least set a valid Ethereum URL (e.g. Infura) and a private key with some ethers.

### Deploy the contract

1. Go to the `apps/contracts` directory and deploy your contract:

```bash
yarn deploy --zk-groups-semaphore <zk-groups-semaphore-address>  --network [goerli | local]
```

To deploy to local ETH node started from Zk-Groups project run the below command:

```bash
#CWD = /apps/contracts
yarn deploy --zk-groups-semaphore 0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9 --network local

# Sugesto contract has been deployed to: 0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9
```

2. Update your `.env and apps/web-app/.env` files with the private key and the contract address.

````bash

> **Note**
> Check the Semaphore contract addresses [here](https://semaphore.appliedzkp.org/docs/deployed-contracts#semaphore).


### Deploy the subgraph

1. Go to the `apps/subgraph` directory and update the `subgraph.yaml` file by setting your network name and contract address.
2. Authenticate the account with your access token:

```bash
yarn auth <access-token>
````

3. Deploy your subgraph:

```bash
yarn deploy <subgraph-name>
```

### Start the app

You can start your app locally or you can easily deploy it to Vercel or AWS Amplify.

```bash
yarn start
```

### Code quality and formatting

Run [ESLint](https://eslint.org/) to analyze the code and catch bugs:

```bash
yarn lint
```

Run [Prettier](https://prettier.io/) to check formatting rules:

```bash
yarn prettier
```

or to automatically format the code:

```bash
yarn prettier:write
```
