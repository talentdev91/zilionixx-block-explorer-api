## accounts collection

| Field            | Type   | Required | Description                           |
| ---------------- | ------ | -------- | ------------------------------------- |
| address          | String | true     | address of account                    |
| balance          | Number | true     | balance of account                    |
| type             | String | true     | type of account                       |
| name             | String | false    | name of account                       |
| transactionCount | Object | false    | send/receive/total transaction counts |
| holdingTokens    | Array  | false    | holding tokens of account             |

```
{
    "_id": ObjectId("6163c17dbbb714426c581acc"),
    "address": "0x2e69977f0dc368e8e62791d984f1bc65b3c83329",
    "__v": NumberInt("0"),
    "holdingTokens": [
        {
            "address": "0x827f5388892e4b7ea0e610a2812e8afab0d4cada",
            "symbol": "X2",
            "name": "X2",
            "balance": "9999000000000000000000",
            "receiveCount": NumberInt("1")
        }
    ],
    "transactionCount": {
        "send": NumberInt("0"),
        "receive": NumberInt("25"),
        "total": NumberInt("25")
    },
    "type": "contract",
    "balance": 1.10061172592075e+22
}
```

## blockchainstatuses collection

| Field        | Type   | Required | Description                  |
| ------------ | ------ | -------- | ---------------------------- |
| id           | Number | true     | id of document               |
| syncno       | Number | true     | current syncing block number |
| epoch_syncno | Number | true     | current epoch number         |

```
{
    "_id": ObjectId("613fb9d777193f3e5c4fd330"),
    "id": NumberInt("1"),
    "__v": NumberInt("0"),
    "createdAt": ISODate("2021-09-13T20:51:35.838Z"),
    "syncno": NumberInt("80791"),
    "epoch_syncno": NumberInt("358"),
    "updatedAt": ISODate("2021-10-12T10:42:13.078Z")
}
```

## block collection

| Field            | Type   | Required | Description                                                                                                 |
| ---------------- | ------ | -------- | ----------------------------------------------------------------------------------------------------------- |
| difficulty       | String | true     | QUANTITY - integer of the difficulty for this block.                                                        |
| extraData        | String | true     | optional & free field to store extra data                                                                   |
| gasLimit         | Number | true     | Gas limit set for the block.                                                                                |
| gasUsed          | Number | true     | Sum of all the gas used by all transaction in the block.                                                    |
| hash             | String | true     | block hash                                                                                                  |
| logsBloom        | String | true     | DATA, 256 Bytes - the bloom filter for the logs of the block. null when its pending block.                  |
| miner            | String | true     | block miner                                                                                                 |
| mixHash          | String | true     | 256-bit hash which proves that a sufficient amount of computation has been carried out on this block        |
| nonce            | String | true     | DATA, 8 Bytes - hash of the generated proof-of-work. null when its pending block.                           |
| parentHash       | String | true     | hash of parent block                                                                                        |
| receiptsRoot     | String | true     | DATA, 32 Bytes - the root of the receipts trie of the block.                                                |
| sha3Uncles       | String | true     | DATA, 32 Bytes - SHA3 of the uncles data in the block.                                                      |
| number           | Number | true     | Counting number of the block. The number increments sequentially. 0 is a genesis block.                     |
| size             | Number | true     | integer the size of this block in bytes.                                                                    |
| stateRoot        | Number | true     | DATA, 32 Bytes - the root of the final state trie of the block.                                             |
| timestamp        | Number | true     | QUANTITY - the unix timestamp for when the block was collated.                                              |
| timestampNano    | String | true     | timestamp nano                                                                                              |
| totalDifficulty  | String | true     | QUANTITY - integer of the total difficulty of the chain until this block.                                   |
| transactions     | Array  | true     | Array - Array of transaction objects, or 32 Bytes transaction hashes depending on the last given parameter. |
| transactionsRoot | String | true     | DATA, 32 Bytes - the root of the transaction trie of the block.                                             |
| uncles           | Array  | true     | Array - Array of uncle hashes.                                                                              |
| blockReward      | Number | false    | block reward                                                                                                |

```
{
    "_id": ObjectId("614d3aef9913fb2f3ca35360"),
    "number": NumberInt("2"),
    "__v": NumberInt("0"),
    "difficulty": "0",
    "extraData": "0x",
    "gasLimit": 281474976710655,
    "gasUsed": NumberInt("660668"),
    "hash": "0x000000020000001c5c2d14fbc48243d73dda1b806ed1949edcd9478ebe323c98",
    "logsBloom": "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
    "miner": "0x0000000000000000000000000000000000000000",
    "mixHash": "0x0000000000000000000000000000000000000000000000000000000000000000",
    "nonce": "0x0000000000000000",
    "parentHash": "0x00000001000000016314b727c4b47b54ed63a7a54ac0e80c0bb87b740036d5a6",
    "receiptsRoot": "0x0000000000000000000000000000000000000000000000000000000000000000",
    "sha3Uncles": "0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347",
    "size": NumberInt("1432"),
    "stateRoot": 8.56278779814923e+76,
    "timestamp": NumberInt("1628905263"),
    "timestampNano": "0x169b08b5098ef2ec",
    "totalDifficulty": "0",
    "transactions": [
        "0x021055108a2afced06677d1f39ffc12c8cbec020c4ffbb4732383419d6abdfb3",
        "0x0963a7ef4a1f695b4150a138bd8f628e570e7971da0fe0ea28e64cbd0617cead"
    ],
    "transactionsRoot": "0x574f4f8c13e9e4e29423a4616e315bdd42674ac501f5af12bf812565ce37a54b",
    "uncles": [ ],
    "blockReward": NumberInt("0")
}
```

## contracts collectin

| Field         | Type   | Required | Description                           |
| ------------- | ------ | -------- | ------------------------------------- |
| address       | String | true     | address of smart contract             |
| creationCode  | String | true     | contract creation byte code on deploy |
| sourceCode    | String |          | solidity/vyper source code            |
| compiler      | String |          | solidity compiler version             |
| optimization  | String |          | true/false                            |
| abi           | String |          | json stringfied abi code              |
| library       | Array  |          | imported libraries on code            |
| optimizerRuns | Number |          | optimization runtimes on compile      |
| evmVersion    | String |          | evm version: i.e; istanbul, peterburg |
| licenseType   | String |          | license type in code                  |

```
{
    "_id": ObjectId("615cab9413542846548852c5"),
    "address": "0x827f5388892e4b7ea0e610a2812e8afab0d4cada",
    "__v": NumberInt("0"),
    "creationCode": "0x60806040523480156200001157600080fd5b506000620000246200024060201b60201c565b9050806000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055508073ffffffffffffffffffffffffffffffffffffffff16600073ffffffffffffffffffffffffffffffffffffffff167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e060405160405180910390a3506040518060400160405280600281526020017f5832000000000000000000000000000000000000000000000000000000000000815250600690805190602001906200010f92919062000248565b506040518060400160405280600281526020017f5832000000000000000000000000000000000000000000000000000000000000815250600590805190602001906200015d92919062000248565b506012600460006101000a81548160ff021916908360ff1602179055506a18d0bf423c03d8de000000600381905550600354600160003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055503373ffffffffffffffffffffffffffffffffffffffff16600073ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef6003546040518082815260200191505060405180910390a3620002f7565b600033905090565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f106200028b57805160ff1916838001178555620002bc565b82800160010185558215620002bc579182015b82811115620002bb5782518255916020019190600101906200029e565b5b509050620002cb9190620002cf565b5090565b620002f491905b80821115620002f0576000816000905550600101620002d6565b5090565b90565b611e5380620003076000396000f3fe608060405234801561001057600080fd5b506004361061012c5760003560e01c8063893d20e8116100ad578063a9059cbb11610071578063a9059cbb146105d7578063b09f12661461063d578063d28d8852146106c0578063dd62ed3e14610743578063f2fde38b146107bb5761012c565b8063893d20e8146104145780638da5cb5b1461045e57806395d89b41146104a8578063a0712d681461052b578063a457c2d7146105715761012c565b806332424aa3116100f457806332424aa3146102e2578063395093511461030657806342966c681461036c57806370a08231146103b2578063715018a61461040a5761012c565b806306fdde0314610131578063095ea7b3146101b457806318160ddd1461021a57806323b872dd14610238578063313ce567146102be575b600080fd5b6101396107ff565b6040518080602001828103825283818151815260200191508051906020019080838360005b8381101561017957808201518184015260208101905061015e565b50505050905090810190601f1680156101a65780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b610200600480360360408110156101ca57600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803590602001909291905050506108a1565b604051808215151515815260200191505060405180910390f35b6102226108bf565b6040518082815260200191505060405180910390f35b6102a46004803603606081101561024e57600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803590602001909291905050506108c9565b604051808215151515815260200191505060405180910390f35b6102c66109a2565b604051808260ff1660ff16815260200191505060405180910390f35b6102ea6109b9565b604051808260ff1660ff16815260200191505060405180910390f35b6103526004803603604081101561031c57600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803590602001909291905050506109cc565b604051808215151515815260200191505060405180910390f35b6103986004803603602081101561038257600080fd5b8101908080359060200190929190505050610a7f565b604051808215151515815260200191505060405180910390f35b6103f4600480360360208110156103c857600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190505050610a9b565b6040518082815260200191505060405180910390f35b610412610ae4565b005b61041c610c6c565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b610466610c7b565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b6104b0610ca4565b6040518080602001828103825283818151815260200191508051906020019080838360005b838110156104f05780820151818401526020810190506104d5565b50505050905090810190601f16801561051d5780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b6105576004803603602081101561054157600080fd5b8101908080359060200190929190505050610d46565b604051808215151515815260200191505060405180910390f35b6105bd6004803603604081101561058757600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190505050610e2b565b604051808215151515815260200191505060405180910390f35b610623600480360360408110156105ed57600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190505050610ef8565b604051808215151515815260200191505060405180910390f35b610645610f16565b6040518080602001828103825283818151815260200191508051906020019080838360005b8381101561068557808201518184015260208101905061066a565b50505050905090810190601f1680156106b25780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b6106c8610fb4565b6040518080602001828103825283818151815260200191508051906020019080838360005b838110156107085780820151818401526020810190506106ed565b50505050905090810190601f1680156107355780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b6107a56004803603604081101561075957600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803573ffffffffffffffffffffffffffffffffffffffff169060200190929190505050611052565b6040518082815260200191505060405180910390f35b6107fd600480360360208110156107d157600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff1690602001909291905050506110d9565b005b606060068054600181600116156101000203166002900480601f0160208091040260200160405190810160405280929190818152602001828054600181600116156101000203166002900480156108975780601f1061086c57610100808354040283529160200191610897565b820191906000526020600020905b81548152906001019060200180831161087a57829003601f168201915b5050505050905090565b60006108b56108ae6111ae565b84846111b6565b6001905092915050565b6000600354905090565b60006108d68484846113ad565b610997846108e26111ae565b61099285604051806060016040528060288152602001611d2460289139600260008b73ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060006109486111ae565b73ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020546116679092919063ffffffff16565b6111b6565b600190509392505050565b6000600460009054906101000a900460ff16905090565b600460009054906101000a900460ff1681565b6000610a756109d96111ae565b84610a7085600260006109ea6111ae565b73ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008973ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205461172790919063ffffffff16565b6111b6565b6001905092915050565b6000610a92610a8c6111ae565b836117af565b60019050919050565b6000600160008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020549050919050565b610aec6111ae565b73ffffffffffffffffffffffffffffffffffffffff166000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1614610bad576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260208152602001807f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e657281525060200191505060405180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff166000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e060405160405180910390a360008060006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550565b6000610c76610c7b565b905090565b60008060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905090565b606060058054600181600116156101000203166002900480601f016020809104026020016040519081016040528092919081815260200182805460018160011615610100020316600290048015610d3c5780601f10610d1157610100808354040283529160200191610d3c565b820191906000526020600020905b815481529060010190602001808311610d1f57829003601f168201915b5050505050905090565b6000610d506111ae565b73ffffffffffffffffffffffffffffffffffffffff166000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1614610e11576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260208152602001807f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e657281525060200191505060405180910390fd5b610e22610e1c6111ae565b83611969565b60019050919050565b6000610eee610e386111ae565b84610ee985604051806060016040528060258152602001611d956025913960026000610e626111ae565b73ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008a73ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020546116679092919063ffffffff16565b6111b6565b6001905092915050565b6000610f0c610f056111ae565b84846113ad565b6001905092915050565b60058054600181600116156101000203166002900480601f016020809104026020016040519081016040528092919081815260200182805460018160011615610100020316600290048015610fac5780601f10610f8157610100808354040283529160200191610fac565b820191906000526020600020905b815481529060010190602001808311610f8f57829003601f168201915b505050505081565b60068054600181600116156101000203166002900480601f01602080910402602001604051908101604052809291908181526020018280546001816001161561010002031660029004801561104a5780601f1061101f5761010080835404028352916020019161104a565b820191906000526020600020905b81548152906001019060200180831161102d57829003601f168201915b505050505081565b6000600260008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054905092915050565b6110e16111ae565b73ffffffffffffffffffffffffffffffffffffffff166000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16146111a2576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260208152602001807f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e657281525060200191505060405180910390fd5b6111ab81611b26565b50565b600033905090565b600073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff16141561123c576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526024815260200180611cda6024913960400191505060405180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff1614156112c2576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526022815260200180611dfd6022913960400191505060405180910390fd5b80600260008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055508173ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925836040518082815260200191505060405180910390a3505050565b600073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff161415611433576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526025815260200180611cb56025913960400191505060405180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff1614156114b9576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526023815260200180611d726023913960400191505060405180910390fd5b61152581604051806060016040528060268152602001611d4c60269139600160008773ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020546116679092919063ffffffff16565b600160008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055506115ba81600160008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205461172790919063ffffffff16565b600160008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055508173ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef836040518082815260200191505060405180910390a3505050565b6000838311158290611714576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825283818151815260200191508051906020019080838360005b838110156116d95780820151818401526020810190506116be565b50505050905090810190601f1680156117065780820380516001836020036101000a031916815260200191505b509250505060405180910390fd5b5060008385039050809150509392505050565b6000808284019050838110156117a5576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601b8152602001807f536166654d6174683a206164646974696f6e206f766572666c6f77000000000081525060200191505060405180910390fd5b8091505092915050565b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff161415611835576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526021815260200180611dba6021913960400191505060405180910390fd5b6118a181604051806060016040528060228152602001611ddb60229139600160008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020546116679092919063ffffffff16565b600160008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055506118f981600354611c6a90919063ffffffff16565b600381905550600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef836040518082815260200191505060405180910390a35050565b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff161415611a0c576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601f8152602001807f42455032303a206d696e7420746f20746865207a65726f20616464726573730081525060200191505060405180910390fd5b611a218160035461172790919063ffffffff16565b600381905550611a7981600160008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205461172790919063ffffffff16565b600160008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055508173ffffffffffffffffffffffffffffffffffffffff16600073ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef836040518082815260200191505060405180910390a35050565b600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff161415611bac576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526026815260200180611cfe6026913960400191505060405180910390fd5b8073ffffffffffffffffffffffffffffffffffffffff166000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e060405160405180910390a3806000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555050565b6000611cac83836040518060400160405280601e81526020017f536166654d6174683a207375627472616374696f6e206f766572666c6f770000815250611667565b90509291505056fe42455032303a207472616e736665722066726f6d20746865207a65726f206164647265737342455032303a20617070726f76652066726f6d20746865207a65726f20616464726573734f776e61626c653a206e6577206f776e657220697320746865207a65726f206164647265737342455032303a207472616e7366657220616d6f756e74206578636565647320616c6c6f77616e636542455032303a207472616e7366657220616d6f756e7420657863656564732062616c616e636542455032303a207472616e7366657220746f20746865207a65726f206164647265737342455032303a2064656372656173656420616c6c6f77616e63652062656c6f77207a65726f42455032303a206275726e2066726f6d20746865207a65726f206164647265737342455032303a206275726e20616d6f756e7420657863656564732062616c616e636542455032303a20617070726f766520746f20746865207a65726f2061646472657373a265627a7a72315820c3722ef371a70f289354328b5e15539f181e4a114088cf3c4142de8a0a5b42f364736f6c63430005100032",
    "library": [
        ""
    ],
    "abi": "[{\"inputs\":[],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"constructor\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"address\",\"name\":\"owner\",\"type\":\"address\"},{\"indexed\":true,\"internalType\":\"address\",\"name\":\"spender\",\"type\":\"address\"},{\"indexed\":false,\"internalType\":\"uint256\",\"name\":\"value\",\"type\":\"uint256\"}],\"name\":\"Approval\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"address\",\"name\":\"previousOwner\",\"type\":\"address\"},{\"indexed\":true,\"internalType\":\"address\",\"name\":\"newOwner\",\"type\":\"address\"}],\"name\":\"OwnershipTransferred\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"address\",\"name\":\"from\",\"type\":\"address\"},{\"indexed\":true,\"internalType\":\"address\",\"name\":\"to\",\"type\":\"address\"},{\"indexed\":false,\"internalType\":\"uint256\",\"name\":\"value\",\"type\":\"uint256\"}],\"name\":\"Transfer\",\"type\":\"event\"},{\"constant\":true,\"inputs\":[],\"name\":\"_decimals\",\"outputs\":[{\"internalType\":\"uint8\",\"name\":\"\",\"type\":\"uint8\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"_name\",\"outputs\":[{\"internalType\":\"string\",\"name\":\"\",\"type\":\"string\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"_symbol\",\"outputs\":[{\"internalType\":\"string\",\"name\":\"\",\"type\":\"string\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"internalType\":\"address\",\"name\":\"owner\",\"type\":\"address\"},{\"internalType\":\"address\",\"name\":\"spender\",\"type\":\"address\"}],\"name\":\"allowance\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"internalType\":\"address\",\"name\":\"spender\",\"type\":\"address\"},{\"internalType\":\"uint256\",\"name\":\"amount\",\"type\":\"uint256\"}],\"name\":\"approve\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"internalType\":\"address\",\"name\":\"account\",\"type\":\"address\"}],\"name\":\"balanceOf\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"amount\",\"type\":\"uint256\"}],\"name\":\"burn\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"decimals\",\"outputs\":[{\"internalType\":\"uint8\",\"name\":\"\",\"type\":\"uint8\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"internalType\":\"address\",\"name\":\"spender\",\"type\":\"address\"},{\"internalType\":\"uint256\",\"name\":\"subtractedValue\",\"type\":\"uint256\"}],\"name\":\"decreaseAllowance\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"getOwner\",\"outputs\":[{\"internalType\":\"address\",\"name\":\"\",\"type\":\"address\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"internalType\":\"address\",\"name\":\"spender\",\"type\":\"address\"},{\"internalType\":\"uint256\",\"name\":\"addedValue\",\"type\":\"uint256\"}],\"name\":\"increaseAllowance\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"amount\",\"type\":\"uint256\"}],\"name\":\"mint\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"name\",\"outputs\":[{\"internalType\":\"string\",\"name\":\"\",\"type\":\"string\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"owner\",\"outputs\":[{\"internalType\":\"address\",\"name\":\"\",\"type\":\"address\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[],\"name\":\"renounceOwnership\",\"outputs\":[],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"symbol\",\"outputs\":[{\"internalType\":\"string\",\"name\":\"\",\"type\":\"string\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"totalSupply\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"internalType\":\"address\",\"name\":\"recipient\",\"type\":\"address\"},{\"internalType\":\"uint256\",\"name\":\"amount\",\"type\":\"uint256\"}],\"name\":\"transfer\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"internalType\":\"address\",\"name\":\"sender\",\"type\":\"address\"},{\"internalType\":\"address\",\"name\":\"recipient\",\"type\":\"address\"},{\"internalType\":\"uint256\",\"name\":\"amount\",\"type\":\"uint256\"}],\"name\":\"transferFrom\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"internalType\":\"address\",\"name\":\"newOwner\",\"type\":\"address\"}],\"name\":\"transferOwnership\",\"outputs\":[],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"}]",
    "compiler": "v0.5.16+commit.9c3226ce",
    "evmVersion": "istanbul",
    "licenseType": "No License",
    "optimization": false,
    "optimizerRuns": NumberInt("200"),
    "sourceCode": "/**\n *Submitted for verification at BscScan.com on 2020-09-04\n*/\n\npragma solidity 0.5.16;\n\ninterface IBEP20 {\n  /**\n   * @dev Returns the amount of tokens in existence.\n   */\n  function totalSupply() external view returns (uint256);\n\n  /**\n   * @dev Returns the token decimals.\n   */\n  function decimals() external view returns (uint8);\n\n  /**\n   * @dev Returns the token symbol.\n   */\n  function symbol() external view returns (string memory);\n\n  /**\n  * @dev Returns the token name.\n  */\n  function name() external view returns (string memory);\n\n  /**\n   * @dev Returns the bep token owner.\n   */\n  function getOwner() external view returns (address);\n\n  /**\n   * @dev Returns the amount of tokens owned by `account`.\n   */\n  function balanceOf(address account) external view returns (uint256);\n\n  /**\n   * @dev Moves `amount` tokens from the caller's account to `recipient`.\n   *\n   * Returns a boolean value indicating whether the operation succeeded.\n   *\n   * Emits a {Transfer} event.\n   */\n  function transfer(address recipient, uint256 amount) external returns (bool);\n\n  /**\n   * @dev Returns the remaining number of tokens that `spender` will be\n   * allowed to spend on behalf of `owner` through {transferFrom}. This is\n   * zero by default.\n   *\n   * This value changes when {approve} or {transferFrom} are called.\n   */\n  function allowance(address _owner, address spender) external view returns (uint256);\n\n  /**\n   * @dev Sets `amount` as the allowance of `spender` over the caller's tokens.\n   *\n   * Returns a boolean value indicating whether the operation succeeded.\n   *\n   * IMPORTANT: Beware that changing an allowance with this method brings the risk\n   * that someone may use both the old and the new allowance by unfortunate\n   * transaction ordering. One possible solution to mitigate this race\n   * condition is to first reduce the spender's allowance to 0 and set the\n   * desired value afterwards:\n   * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729\n   *\n   * Emits an {Approval} event.\n   */\n  function approve(address spender, uint256 amount) external returns (bool);\n\n  /**\n   * @dev Moves `amount` tokens from `sender` to `recipient` using the\n   * allowance mechanism. `amount` is then deducted from the caller's\n   * allowance.\n   *\n   * Returns a boolean value indicating whether the operation succeeded.\n   *\n   * Emits a {Transfer} event.\n   */\n  function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);\n\n  /**\n   * @dev Emitted when `value` tokens are moved from one account (`from`) to\n   * another (`to`).\n   *\n   * Note that `value` may be zero.\n   */\n  event Transfer(address indexed from, address indexed to, uint256 value);\n\n  /**\n   * @dev Emitted when the allowance of a `spender` for an `owner` is set by\n   * a call to {approve}. `value` is the new allowance.\n   */\n  event Approval(address indexed owner, address indexed spender, uint256 value);\n}\n\n/*\n * @dev Provides information about the current execution context, including the\n * sender of the transaction and its data. While these are generally available\n * via msg.sender and msg.data, they should not be accessed in such a direct\n * manner, since when dealing with GSN meta-transactions the account sending and\n * paying for execution may not be the actual sender (as far as an application\n * is concerned).\n *\n * This contract is only required for intermediate, library-like contracts.\n */\ncontract Context {\n  // Empty internal constructor, to prevent people from mistakenly deploying\n  // an instance of this contract, which should be used via inheritance.\n  constructor () internal { }\n\n  function _msgSender() internal view returns (address payable) {\n    return msg.sender;\n  }\n\n  function _msgData() internal view returns (bytes memory) {\n    this; // silence state mutability warning without generating bytecode - see https://github.com/ethereum/solidity/issues/2691\n    return msg.data;\n  }\n}\n\n/**\n * @dev Wrappers over Solidity's arithmetic operations with added overflow\n * checks.\n *\n * Arithmetic operations in Solidity wrap on overflow. This can easily result\n * in bugs, because programmers usually assume that an overflow raises an\n * error, which is the standard behavior in high level programming languages.\n * `SafeMath` restores this intuition by reverting the transaction when an\n * operation overflows.\n *\n * Using this library instead of the unchecked operations eliminates an entire\n * class of bugs, so it's recommended to use it always.\n */\nlibrary SafeMath {\n  /**\n   * @dev Returns the addition of two unsigned integers, reverting on\n   * overflow.\n   *\n   * Counterpart to Solidity's `+` operator.\n   *\n   * Requirements:\n   * - Addition cannot overflow.\n   */\n  function add(uint256 a, uint256 b) internal pure returns (uint256) {\n    uint256 c = a + b;\n    require(c >= a, \"SafeMath: addition overflow\");\n\n    return c;\n  }\n\n  /**\n   * @dev Returns the subtraction of two unsigned integers, reverting on\n   * overflow (when the result is negative).\n   *\n   * Counterpart to Solidity's `-` operator.\n   *\n   * Requirements:\n   * - Subtraction cannot overflow.\n   */\n  function sub(uint256 a, uint256 b) internal pure returns (uint256) {\n    return sub(a, b, \"SafeMath: subtraction overflow\");\n  }\n\n  /**\n   * @dev Returns the subtraction of two unsigned integers, reverting with custom message on\n   * overflow (when the result is negative).\n   *\n   * Counterpart to Solidity's `-` operator.\n   *\n   * Requirements:\n   * - Subtraction cannot overflow.\n   */\n  function sub(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {\n    require(b <= a, errorMessage);\n    uint256 c = a - b;\n\n    return c;\n  }\n\n  /**\n   * @dev Returns the multiplication of two unsigned integers, reverting on\n   * overflow.\n   *\n   * Counterpart to Solidity's `*` operator.\n   *\n   * Requirements:\n   * - Multiplication cannot overflow.\n   */\n  function mul(uint256 a, uint256 b) internal pure returns (uint256) {\n    // Gas optimization: this is cheaper than requiring 'a' not being zero, but the\n    // benefit is lost if 'b' is also tested.\n    // See: https://github.com/OpenZeppelin/openzeppelin-contracts/pull/522\n    if (a == 0) {\n      return 0;\n    }\n\n    uint256 c = a * b;\n    require(c / a == b, \"SafeMath: multiplication overflow\");\n\n    return c;\n  }\n\n  /**\n   * @dev Returns the integer division of two unsigned integers. Reverts on\n   * division by zero. The result is rounded towards zero.\n   *\n   * Counterpart to Solidity's `/` operator. Note: this function uses a\n   * `revert` opcode (which leaves remaining gas untouched) while Solidity\n   * uses an invalid opcode to revert (consuming all remaining gas).\n   *\n   * Requirements:\n   * - The divisor cannot be zero.\n   */\n  function div(uint256 a, uint256 b) internal pure returns (uint256) {\n    return div(a, b, \"SafeMath: division by zero\");\n  }\n\n  /**\n   * @dev Returns the integer division of two unsigned integers. Reverts with custom message on\n   * division by zero. The result is rounded towards zero.\n   *\n   * Counterpart to Solidity's `/` operator. Note: this function uses a\n   * `revert` opcode (which leaves remaining gas untouched) while Solidity\n   * uses an invalid opcode to revert (consuming all remaining gas).\n   *\n   * Requirements:\n   * - The divisor cannot be zero.\n   */\n  function div(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {\n    // Solidity only automatically asserts when dividing by 0\n    require(b > 0, errorMessage);\n    uint256 c = a / b;\n    // assert(a == b * c + a % b); // There is no case in which this doesn't hold\n\n    return c;\n  }\n\n  /**\n   * @dev Returns the remainder of dividing two unsigned integers. (unsigned integer modulo),\n   * Reverts when dividing by zero.\n   *\n   * Counterpart to Solidity's `%` operator. This function uses a `revert`\n   * opcode (which leaves remaining gas untouched) while Solidity uses an\n   * invalid opcode to revert (consuming all remaining gas).\n   *\n   * Requirements:\n   * - The divisor cannot be zero.\n   */\n  function mod(uint256 a, uint256 b) internal pure returns (uint256) {\n    return mod(a, b, \"SafeMath: modulo by zero\");\n  }\n\n  /**\n   * @dev Returns the remainder of dividing two unsigned integers. (unsigned integer modulo),\n   * Reverts with custom message when dividing by zero.\n   *\n   * Counterpart to Solidity's `%` operator. This function uses a `revert`\n   * opcode (which leaves remaining gas untouched) while Solidity uses an\n   * invalid opcode to revert (consuming all remaining gas).\n   *\n   * Requirements:\n   * - The divisor cannot be zero.\n   */\n  function mod(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {\n    require(b != 0, errorMessage);\n    return a % b;\n  }\n}\n\n/**\n * @dev Contract module which provides a basic access control mechanism, where\n * there is an account (an owner) that can be granted exclusive access to\n * specific functions.\n *\n * By default, the owner account will be the one that deploys the contract. This\n * can later be changed with {transferOwnership}.\n *\n * This module is used through inheritance. It will make available the modifier\n * `onlyOwner`, which can be applied to your functions to restrict their use to\n * the owner.\n */\ncontract Ownable is Context {\n  address private _owner;\n\n  event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);\n\n  /**\n   * @dev Initializes the contract setting the deployer as the initial owner.\n   */\n  constructor () internal {\n    address msgSender = _msgSender();\n    _owner = msgSender;\n    emit OwnershipTransferred(address(0), msgSender);\n  }\n\n  /**\n   * @dev Returns the address of the current owner.\n   */\n  function owner() public view returns (address) {\n    return _owner;\n  }\n\n  /**\n   * @dev Throws if called by any account other than the owner.\n   */\n  modifier onlyOwner() {\n    require(_owner == _msgSender(), \"Ownable: caller is not the owner\");\n    _;\n  }\n\n  /**\n   * @dev Leaves the contract without owner. It will not be possible to call\n   * `onlyOwner` functions anymore. Can only be called by the current owner.\n   *\n   * NOTE: Renouncing ownership will leave the contract without an owner,\n   * thereby removing any functionality that is only available to the owner.\n   */\n  function renounceOwnership() public onlyOwner {\n    emit OwnershipTransferred(_owner, address(0));\n    _owner = address(0);\n  }\n\n  /**\n   * @dev Transfers ownership of the contract to a new account (`newOwner`).\n   * Can only be called by the current owner.\n   */\n  function transferOwnership(address newOwner) public onlyOwner {\n    _transferOwnership(newOwner);\n  }\n\n  /**\n   * @dev Transfers ownership of the contract to a new account (`newOwner`).\n   */\n  function _transferOwnership(address newOwner) internal {\n    require(newOwner != address(0), \"Ownable: new owner is the zero address\");\n    emit OwnershipTransferred(_owner, newOwner);\n    _owner = newOwner;\n  }\n}\n\ncontract X2 is Context, IBEP20, Ownable {\n  using SafeMath for uint256;\n\n  mapping (address => uint256) private _balances;\n\n  mapping (address => mapping (address => uint256)) private _allowances;\n\n  uint256 private _totalSupply;\n  uint8 public _decimals;\n  string public _symbol;\n  string public _name;\n\n  constructor() public {\n    _name = \"X2\";\n    _symbol = \"X2\";\n    _decimals = 18;\n    _totalSupply = 30000000000000000000000000;\n    _balances[msg.sender] = _totalSupply;\n\n    emit Transfer(address(0), msg.sender, _totalSupply);\n  }\n\n  /**\n   * @dev Returns the bep token owner.\n   */\n  function getOwner() external view returns (address) {\n    return owner();\n  }\n\n  /**\n   * @dev Returns the token decimals.\n   */\n  function decimals() external view returns (uint8) {\n    return _decimals;\n  }\n\n  /**\n   * @dev Returns the token symbol.\n   */\n  function symbol() external view returns (string memory) {\n    return _symbol;\n  }\n\n  /**\n  * @dev Returns the token name.\n  */\n  function name() external view returns (string memory) {\n    return _name;\n  }\n\n  /**\n   * @dev See {BEP20-totalSupply}.\n   */\n  function totalSupply() external view returns (uint256) {\n    return _totalSupply;\n  }\n\n  /**\n   * @dev See {BEP20-balanceOf}.\n   */\n  function balanceOf(address account) external view returns (uint256) {\n    return _balances[account];\n  }\n\n  /**\n   * @dev See {BEP20-transfer}.\n   *\n   * Requirements:\n   *\n   * - `recipient` cannot be the zero address.\n   * - the caller must have a balance of at least `amount`.\n   */\n  function transfer(address recipient, uint256 amount) external returns (bool) {\n    _transfer(_msgSender(), recipient, amount);\n    return true;\n  }\n\n  /**\n   * @dev See {BEP20-allowance}.\n   */\n  function allowance(address owner, address spender) external view returns (uint256) {\n    return _allowances[owner][spender];\n  }\n\n  /**\n   * @dev See {BEP20-approve}.\n   *\n   * Requirements:\n   *\n   * - `spender` cannot be the zero address.\n   */\n  function approve(address spender, uint256 amount) external returns (bool) {\n    _approve(_msgSender(), spender, amount);\n    return true;\n  }\n\n  /**\n   * @dev See {BEP20-transferFrom}.\n   *\n   * Emits an {Approval} event indicating the updated allowance. This is not\n   * required by the EIP. See the note at the beginning of {BEP20};\n   *\n   * Requirements:\n   * - `sender` and `recipient` cannot be the zero address.\n   * - `sender` must have a balance of at least `amount`.\n   * - the caller must have allowance for `sender`'s tokens of at least\n   * `amount`.\n   */\n  function transferFrom(address sender, address recipient, uint256 amount) external returns (bool) {\n    _transfer(sender, recipient, amount);\n    _approve(sender, _msgSender(), _allowances[sender][_msgSender()].sub(amount, \"BEP20: transfer amount exceeds allowance\"));\n    return true;\n  }\n\n  /**\n   * @dev Atomically increases the allowance granted to `spender` by the caller.\n   *\n   * This is an alternative to {approve} that can be used as a mitigation for\n   * problems described in {BEP20-approve}.\n   *\n   * Emits an {Approval} event indicating the updated allowance.\n   *\n   * Requirements:\n   *\n   * - `spender` cannot be the zero address.\n   */\n  function increaseAllowance(address spender, uint256 addedValue) public returns (bool) {\n    _approve(_msgSender(), spender, _allowances[_msgSender()][spender].add(addedValue));\n    return true;\n  }\n\n  /**\n   * @dev Atomically decreases the allowance granted to `spender` by the caller.\n   *\n   * This is an alternative to {approve} that can be used as a mitigation for\n   * problems described in {BEP20-approve}.\n   *\n   * Emits an {Approval} event indicating the updated allowance.\n   *\n   * Requirements:\n   *\n   * - `spender` cannot be the zero address.\n   * - `spender` must have allowance for the caller of at least\n   * `subtractedValue`.\n   */\n  function decreaseAllowance(address spender, uint256 subtractedValue) public returns (bool) {\n    _approve(_msgSender(), spender, _allowances[_msgSender()][spender].sub(subtractedValue, \"BEP20: decreased allowance below zero\"));\n    return true;\n  }\n\n  /**\n   * @dev Creates `amount` tokens and assigns them to `msg.sender`, increasing\n   * the total supply.\n   *\n   * Requirements\n   *\n   * - `msg.sender` must be the token owner\n   */\n  function mint(uint256 amount) public onlyOwner returns (bool) {\n    _mint(_msgSender(), amount);\n    return true;\n  }\n\n  /**\n   * @dev Burn `amount` tokens and decreasing the total supply.\n   */\n  function burn(uint256 amount) public returns (bool) {\n    _burn(_msgSender(), amount);\n    return true;\n  }\n\n  /**\n   * @dev Moves tokens `amount` from `sender` to `recipient`.\n   *\n   * This is internal function is equivalent to {transfer}, and can be used to\n   * e.g. implement automatic token fees, slashing mechanisms, etc.\n   *\n   * Emits a {Transfer} event.\n   *\n   * Requirements:\n   *\n   * - `sender` cannot be the zero address.\n   * - `recipient` cannot be the zero address.\n   * - `sender` must have a balance of at least `amount`.\n   */\n  function _transfer(address sender, address recipient, uint256 amount) internal {\n    require(sender != address(0), \"BEP20: transfer from the zero address\");\n    require(recipient != address(0), \"BEP20: transfer to the zero address\");\n\n    _balances[sender] = _balances[sender].sub(amount, \"BEP20: transfer amount exceeds balance\");\n    _balances[recipient] = _balances[recipient].add(amount);\n    emit Transfer(sender, recipient, amount);\n  }\n\n  /** @dev Creates `amount` tokens and assigns them to `account`, increasing\n   * the total supply.\n   *\n   * Emits a {Transfer} event with `from` set to the zero address.\n   *\n   * Requirements\n   *\n   * - `to` cannot be the zero address.\n   */\n  function _mint(address account, uint256 amount) internal {\n    require(account != address(0), \"BEP20: mint to the zero address\");\n\n    _totalSupply = _totalSupply.add(amount);\n    _balances[account] = _balances[account].add(amount);\n    emit Transfer(address(0), account, amount);\n  }\n\n  /**\n   * @dev Destroys `amount` tokens from `account`, reducing the\n   * total supply.\n   *\n   * Emits a {Transfer} event with `to` set to the zero address.\n   *\n   * Requirements\n   *\n   * - `account` cannot be the zero address.\n   * - `account` must have at least `amount` tokens.\n   */\n  function _burn(address account, uint256 amount) internal {\n    require(account != address(0), \"BEP20: burn from the zero address\");\n\n    _balances[account] = _balances[account].sub(amount, \"BEP20: burn amount exceeds balance\");\n    _totalSupply = _totalSupply.sub(amount);\n    emit Transfer(account, address(0), amount);\n  }\n\n  /**\n   * @dev Sets `amount` as the allowance of `spender` over the `owner`s tokens.\n   *\n   * This is internal function is equivalent to `approve`, and can be used to\n   * e.g. set automatic allowances for certain subsystems, etc.\n   *\n   * Emits an {Approval} event.\n   *\n   * Requirements:\n   *\n   * - `owner` cannot be the zero address.\n   * - `spender` cannot be the zero address.\n   */\n  function _approve(address owner, address spender, uint256 amount) internal {\n    require(owner != address(0), \"BEP20: approve from the zero address\");\n    require(spender != address(0), \"BEP20: approve to the zero address\");\n\n    _allowances[owner][spender] = amount;\n    emit Approval(owner, spender, amount);\n  }\n\n  /**\n   * @dev Destroys `amount` tokens from `account`.`amount` is then deducted\n   * from the caller's allowance.\n   *\n   * See {_burn} and {_approve}.\n   */\n  function _burnFrom(address account, uint256 amount) internal {\n    _burn(account, amount);\n    _approve(account, _msgSender(), _allowances[account][_msgSender()].sub(amount, \"BEP20: burn amount exceeds allowance\"));\n  }\n}"
}
```

## epoches collection

| Field                 | Type   | Required | Description    |
| --------------------- | ------ | -------- | -------------- |
| epoch                 | Number | true     | epoch number   |
| endTime               | Number | true     | epoch end time |
| epochFee              | Number | true     | epoch fee      |
| totalBaseRewardWeight | Number | true     |                |
| totalTxRewardWeight   | Number | true     |                |
| totalRewardPerSecond  | Number | true     |                |
| totalStake            | Number | true     |                |
| totalSupply           | Number | true     |                |

```
{
    "_id": ObjectId("614d3aef9913fb2f3ca35370"),
    "epoch": NumberInt("2"),
    "__v": NumberInt("0"),
    "endTime": NumberInt("1628905263"),
    "epochFee": NumberInt("0"),
    "totalBaseRewardWeight": 1.5e+25,
    "totalStake": 1.5e+25,
    "totalSupply": 4e+27,
    "totalTxRewardWeight": NumberInt("0")
}
```

## events collection

| Field  | Type   | Required | Description                    |
| ------ | ------ | -------- | ------------------------------ |
| keccak | String | true     | sha3 value of event definition |
| name   | String | true     | event name                     |
| inputs | Array  | true     | event abi                      |

```
{
    "_id": ObjectId("614b40fc012800000d006faf"),
    "keccak": "0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925",
    "name": "Approval",
    "inputs": [
        {
            "indexed": true,
            "internalType": "address",
            "name": "owner",
            "type": "address"
        },
        {
            "indexed": true,
            "internalType": "address",
            "name": "spender",
            "type": "address"
        },
        {
            "indexed": false,
            "internalType": "uint256",
            "name": "value",
            "type": "uint256"
        }
    ]
}
```

## pendingtransactions collection

| Field            | Type   | Required | Description                                                                        |
| ---------------- | ------ | -------- | ---------------------------------------------------------------------------------- |
| hash             | String | true     | transaction hash                                                                   |
| nonce            | Number | true     | number of transactions sent by the sender                                          |
| blockHash        | String | true     | hash of block                                                                      |
| blockNumber      | Number | true     | number of block                                                                    |
| transactionIndex | Number | true     | integer of the transactions index position in the block.                           |
| from             | String | true     | 20 Bytes - address of the sender.                                                  |
| to               | String | true     | 20 Bytes - address of the receiver. null when its a contract creation transaction. |
| value            | String | true     | amount of wei to transfer alongside the message to the contract address,           |
| gasPrice         | String | true     | gas price                                                                          |
| gas              | Number | true     | price you are offering to pay                                                      |
| input            | String | true     | input data                                                                         |
| v                | String | true     | v of ECDSA signature output                                                        |
| r                | String | true     | r of ECDSA signature output                                                        |
| s                | String | true     | s of ECDSA signature output                                                        |

## tokeninfos collection

| Field            | Type   | Required | Description                                |
| ---------------- | ------ | -------- | ------------------------------------------ |
| email            | String |          | requestor's email                          |
| name             | String |          | Requester's Name                           |
| contract         | String |          | Token Contract Address                     |
| official         | String |          | Official Site URL                          |
| logo             | String |          | Link to download a 128x128px png icon logo |
| description      | String |          | Project Description                        |
| officialcontract | String |          | Official Contact Email Address             |
| blog             | String |          | Link to Blog (optional)                    |
| reddit           | String |          | Link to Reddit (optional)                  |
| slack            | String |          | Link to Slack/Discord (optional)           |
| facebook         | String |          | Link to Facebook (optional)                |
| twitter          | String |          | Link to Twitter (optional)                 |
| bitcoin          | String |          | Link to Bitcointalk (optional)             |
| github           | String |          | Link to Github (optional)                  |
| telegram         | String |          | Link to Telegram (optional)                |
| whitepaper       | String |          | Link to whitepaper (optional)              |
| ticker           | String |          | Price data - coin ticker (optional)        |
| comment          | String |          | Comments                                   |
| checked          | Number |          | if admin checked this information          |
| selectedImage    | String |          | selected logo                              |

```
{
    "_id": ObjectId("615da979161c66321cf0e48f"),
    "checked": NumberInt("1"),
    "email": "kimiro34@gmail.com",
    "name": "kimiro34@gmail.com",
    "contract": "213321",
    "official": "",
    "logo": "dsaf",
    "description": "dsa",
    "blog": "sdaf",
    "reddit": "adsf",
    "slack": "dsaf",
    "facebook": "sadf",
    "twitter": "adsf",
    "bitcoin": "adsf",
    "github": "qwer",
    "telegram": "ewr",
    "whitepaper": "qwer",
    "ticker": "qewr",
    "comment": "dasf",
    "__v": NumberInt("0")
}
```

## tokens collection

| Field    | Type   | Required | Description                |
| -------- | ------ | -------- | -------------------------- |
| type     | String |          | token types (erc20/erc721) |
| address  | String |          | token address              |
| symbol   | String |          | token symbol               |
| name     | String |          | token name                 |
| logo     | String |          | token logo                 |
| decimals | Number |          | token decimals             |

```
{
    "_id": ObjectId("615ee83cf9888639a89168c6"),
    "address": "0x288a6ca8581e42e5733701d0e3cc0b5291d80adc",
    "__v": NumberInt("0"),
    "decimals": NumberInt("18"),
    "logo": "token logo",
    "name": "Space Pupper",
    "symbol": "SPACEPUPPER",
    "type": "ERC20"
}
```

## transactions collection

| Field             | Type    | Required | Description                                                                          |
| ----------------- | ------- | -------- | ------------------------------------------------------------------------------------ |
| blockHash         | String  |          | hash of block                                                                        |
| blockNumber       | Number  |          | number of block                                                                      |
| contractAddress   | String  |          | smart contract address, only exist on contract creation                              |
| cumulativeGasUsed | Number  |          | total amount of gas used when this transaction was executed in the block.            |
| from              | String  |          | 20 Bytes - address of the sender.                                                    |
| gas               | Number  |          | price you are offering to pay                                                        |
| gasPrice          | String  |          | gas price                                                                            |
| gasUsed           | Number  |          | amount of gas used by this specific transaction alone.                               |
| hash              | String  |          | transaction hash                                                                     |
| input             | String  |          | input data                                                                           |
| logs              | Array   |          | Array of log objects, which this transaction generated.                              |
| logsBloom         | String  |          | 256 Bytes - the bloom filter for the logs of the block. null when its pending block. |
| nonce             | Number  |          | 8 Bytes - hash of the generated proof-of-work. null when its pending block.          |
| r                 | String  |          | r of ECDSA signature output                                                          |
| s                 | String  |          | s of ECDSA signature output                                                          |
| status            | Boolean |          | failed or succeed                                                                    |
| to                | String  |          | 20 Bytes - address of the receiver. null when its a contract creation transaction.   |
| transactionHash   | String  |          | transaction hash                                                                     |
| transactionIndex  | Number  |          | nteger of the transactions index position in the block.                              |
| v                 | String  |          | v of ECDSA signature output                                                          |
| value             | Number  |          | mount of wei to transfer alongside the message to the contract address,              |
| token             | Object  |          | token information(name, symbol, decimals) and transfer information, if               |
| timestamp         | Number  |          | transaction timestamp = block timestamp                                              |

```
{
    "_id": ObjectId("615eea5eee8590932cd46cf9"),
    "hash": "0x549d7a0234adc7977ed4ae1c0537fa6251de1b2bb71a5102f9df7be810ccb10c",
    "blockHash": "0x000000c800000f09397d059c789708e7b946d69c78c7c632717a2cda962bcb43",
    "blockNumber": NumberInt("40863"),
    "contractAddress": null,
    "cumulativeGasUsed": NumberInt("38075"),
    "from": "0x8734cb972d36a740cc983d5515e160c373a4a016",
    "gas": NumberInt("54393"),
    "gasPrice": "1000000000",
    "gasUsed": NumberInt("38075"),
    "input": "0xa9059cbb0000000000000000000000009651819cfa16c8f3ba927d5350ca25417591166b000000000000000000000000000000000000000000000000a688906bd8b00000",
    "logs": [
        {
            "address": "0x827f5388892E4B7eA0e610a2812E8Afab0d4CadA",
            "topics": [
                "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
                "0x0000000000000000000000008734cb972d36a740cc983d5515e160c373a4a016",
                "0x0000000000000000000000009651819cfa16c8f3ba927d5350ca25417591166b"
            ],
            "data": "0x000000000000000000000000000000000000000000000000a688906bd8b00000",
            "blockNumber": NumberInt("40863"),
            "transactionHash": "0x549d7a0234adc7977ed4ae1c0537fa6251de1b2bb71a5102f9df7be810ccb10c",
            "transactionIndex": NumberInt("0"),
            "blockHash": "0x000000c800000f09397d059c789708e7b946d69c78c7c632717a2cda962bcb43",
            "logIndex": NumberInt("0"),
            "removed": false,
            "id": "log_6b632091"
        }
    ],
    "logsBloom": "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000400000000008000800000000000000000000000000000000000000000000002000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000400000000000000000000000004100000000000000000000000000001000000000000800000000002000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
    "nonce": NumberInt("195"),
    "r": "0x4130b5bf8e09c0774dc93054cf12b638b6d11b83f88db6119889d5064704a368",
    "s": "0x2169569cc043ad8bfc35459e03082feff3ec4adf9a62b33f512ec9ed3c06d8b",
    "status": true,
    "timestamp": NumberInt("1631785330"),
    "to": "0x827f5388892e4b7ea0e610a2812e8afab0d4cada",
    "token": {
        "name": "X2",
        "type": "ERC20",
        "decimals": NumberInt("18"),
        "symbol": "X2",
        "decodeMethodData": {
            "method": "transfer",
            "types": [
                "address",
                "uint256"
            ],
            "inputs": [
                "9651819cfa16c8f3ba927d5350ca25417591166b",
                "12000000000000000000"
            ],
            "names": [
                "recipient",
                "amount"
            ]
        },
        "tokenTransfers": [
            {
                "from": "0x8734CB972d36a740Cc983d5515e160C373A4a016",
                "to": "0x9651819cfa16c8F3Ba927d5350Ca25417591166B",
                "value": "12000000000000000000"
            }
        ]
    },
    "transactionHash": "0x549d7a0234adc7977ed4ae1c0537fa6251de1b2bb71a5102f9df7be810ccb10c",
    "transactionIndex": NumberInt("0"),
    "v": "0x217",
    "value": "0"
}
```

## users collection

| Field       | Type   | Required | Description      |
| ----------- | ------ | -------- | ---------------- |
| firstName   | String |          | first name       |
| lastName    | String |          | last name        |
| fullName    | String |          | full name        |
| email       | String | true     | email            |
| password    | String | true     | password         |
| isConfirmed | Number |          | confirmed status |
| confirmOTP  | String |          |                  |
| otpTries    | Number |          |                  |
| status      | String |          |                  |
| timestamps  |        | true     | timestamp        |

```
{
    "_id": ObjectId("615b361300817d6170f2e4b4"),
    "isConfirmed": NumberInt("1"),
    "otpTries": NumberInt("0"),
    "status": true,
    "fullName": "dotfund",
    "email": "americadf0090@gmail.com",
    "password": "$2a$10$PC0yoLFuznsyrE6vhLvk7uK5D4L85glQXMQmL1evUIGqiq3FeGaYe",
    "createdAt": ISODate("2021-10-04T17:12:52.021Z"),
    "updatedAt": ISODate("2021-10-04T17:12:52.021Z"),
    "__v": NumberInt("0")
}
```

## validators collection

| Field            | Type    | Required | Description                              |
| ---------------- | ------- | -------- | ---------------------------------------- |
| id               | Number  | true     | validator index                          |
| status           | Number  | true     | validator status                         |
| deactivatedTime  | Number  | true     | deactived time                           |
| deactivatedEpoch | Number  | true     | deactived epoch                          |
| selfStake        | Number  | true     | self staked amount                       |
| receivedStake    | Number  | true     | received stake amount                    |
| createdEpoch     | Number  | true     | epoch number that this validator created |
| createdTime      | Number  | true     | validator creation time                  |
| auth             | String  | true     |                                          |
| active           | Boolean | true     | current activate status                  |
| delegated        | Number  | true     |                                          |

```
{
    "_id": ObjectId("614d3aef9913fb2f3ca35376"),
    "auth": "0x07fbf9c4ce60f39bfb46ce132acc8393f058bf22",
    "__v": NumberInt("0"),
    "active": true,
    "createdEpoch": NumberInt("0"),
    "createdTime": NumberInt("1608600000"),
    "deactivatedEpoch": NumberInt("0"),
    "deactivatedTime": NumberInt("0"),
    "delegated": NumberInt("0"),
    "id": NumberInt("1"),
    "receivedStake": 5e+24,
    "selfStake": 5e+24,
    "status": NumberInt("0")
}
```
