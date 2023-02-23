# [Zilionixx Block Explorer](https://blockexplorer.zilionixx.com)

![version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![license](https://img.shields.io/badge/license-MIT-blue.svg)
[![Join the chat at https://gitter.im/NIT-dgp/General](https://badges.gitter.im/NIT-dgp/General.svg)](https://gitter.im/ZilionixxCommunity/ZNXscan)
[![Matrix Chat](https://img.shields.io/badge/Matrix%20-chat-brightgreen?style=plastic&logo=matrix)](https://matrix.to/#/#zilionixx:matrix.org)
[![Chat](https://img.shields.io/badge/chat-on%20discord-7289da.svg)](https://discord.gg/W42fMxYK)

![Product Gif](src/assets/images/logo.png)

# Zilionixx Blockchain Explorer

A Javascript web app for users to explore and analyze the Zilionixx blockchain.

Its backend is developed using Node.js.

Please visit https://blockexplorer.zilionixx.com/ to view all data in Zilionixx.

## Block Explorer Design Overview

![Zilionixx Explorer Design Overview](public/assets/images/explorer-diagram.jpg)

### Explorer Backend

Node.js version >= 12

1. Data access REST APIs

Exposes the REST APIs for frontend to get blockchain data.

2. Data Sync server

Loads the blockchain data from Zilionixx RPC Node and transform and store the data in a way the frontend can consume.

Currently, synchronizing block data only involves raw transaction data on network, pending transactions and erc721 transactions.

To add new functionaly for data syncing it is supposed to add new synchronize daemon like [Erc 721 sync daemon](./sync-server/erc721SyncServer.js)

### MongoDB

Data Storage for the loaded and transformed data.

Required version : >= 4.4

### Zilionixx RPC Node

The explorer make RPCs to [Zilionixx nodes remote endpoints](https://github.com/zilionixx/zilionixx-block-explorer-api/blob/master/README.md) to load the blockchain data.

### Explorer Frontend

Checkout [this repository](https://github.com/zilionixx/zilionixx-block-explorer.git) for Zilionixx block explorer's frontend repository.

## Decide what to do

As a beginner, you may want to pick an issue from issues with **help wanted** or **good first issue** tag and make a pull request for your changes.

After being more familiar with the explorer and the code, you can submit improvement ideas and work on those ideas.

Please set the base branch as `staging` when you create a new pull request

## Git workflow

### Step 1: Clone git repo to your local

You can clone https://github.com/zilionixx/zilionixx-block-explorer-api.git and commit to it if you are a key contributor.

```shell
git clone https://github.com/zilionixx/zilionixx-block-explorer-api.git
```

Or you can fork git clone https://github.com/zilionixx/zilionixx-block-explorer.git and clone your forked repo.

### Step 2: Make some changes

1. Create a new branch for your change, use prefix "hotfix/" for bug fix, "feature/" for feature.
2. Make the change and commit with good commit message

### Step 3: Get the change merged

1. Push your local changes to remote repo
2. Create the pull request if you are using forked repo
3. Address review feedback and get the change merged

# Environment Setup

## Step 1: Install Node.js

1. Install lastest node.js so you can execute 'npm' command by either downloading zip or installer from https://nodejs.org/en/download/ or via [package manager](https://nodejs.org/en/download/package-manager/)

### Step 2: Build and Run

```bash
# install dependency
npm i

# run sync server
npm run start-sync

# run rest api and web socket serve
npm run api

# run bot for network test
# initialize bot accounts and send some ether for test
npm run api bot-init
# start test transactions between bot accounts
npm run api bot-start

```
