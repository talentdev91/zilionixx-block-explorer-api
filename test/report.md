# Test result report

## Time comparison for Web3js method call : Mon Sep 20 2021 (JST) - by [Kimiro](https://github.com/kimiro34)

- **Purpose**: determine what to use to get transaction data and transaction receipt from RPC node by using web3js
- **Log Source**: [LogData](sync-server/data/Web3CallTimeComparison.md)
- **Code Source**
  zilionixx-block-explorer-api/test/sync-server/ProcessTransactions/GetTxInfosFromTxHahes.js
  - [ProcessTransactionsWithForStat](https://github.com/zilionixx/zilionixx-block-explorer-api/blob/60d2344d08fa95b601e76805c824c3e8367d7c84/test/sync-server/ProcessTransactions/GetTxInfosFromTxHashes.js#L6)
  - [ProcessTransactionsWithPromiseAll](https://github.com/zilionixx/zilionixx-block-explorer-api/blob/60d2344d08fa95b601e76805c824c3e8367d7c84/test/sync-server/ProcessTransactions/GetTxInfosFromTxHashes.js#L81)

### Performance comparison between For statements and Promise.all to get transaction data and transaction receipts and smart contract calls

| No  | Transaction Type     | Process type | Transaction count | Transaction cycles | Total consume time | Average time per cycle | Average time per transaction |
| --- | -------------------- | ------------ | ----------------- | ------------------ | ------------------ | ---------------------- | ---------------------------- |
| 1   | Raw transaction      | For Statment | 100               | 20                 | 32000 ms           | 1600.17596 ms          | 16.001 ms                    |
| 2   | Raw transaction      | Promise.all  | 100               | 20                 | 21250 ms           | 1062.2374 ms           | 10.625 ms                    |
| 3   | Contract transaction | For Statment | 1000              | 10                 | 165130.8 ms        | 16513.08 ms            | 16.513 ms                    |
| 4   | Contract transaction | Promise.all  | 1000              | 10                 | 122574.517 ms ms   | 12257.4517 ms          | 12.257 ms                    |

### Analysis

- In case of raw transactions asynchronous process using `Promise.all` was 34% faster than synchronous transactions using `For` statement.
- In case of contract trasactions with 2 contract method call processing with `Promise.all` was 26% faster than synchronous transactions using `For` statement.

These results may vary on hardware but it's obvious that async processing uses less computation cost than sync processing.

## Time comparison update multiple transactions into MongoDB collection: Mon Sep 20 2021 (JST) - by [Kimiro](https://github.com/kimiro34)

- **Purpose**: determine what to use to update multiple transaction data into MongoDB collection - `For` or `bulkWrite`
- **Log Source**: [LogData](sync-server/data/DBUpdateTimeComparison.md)
- **Code Source**
  zilionixx-block-explorer-api/test/sync-server/ProcessTransactions/GetTxInfosFromTxHahes.js
  - [SaveTransactionsWithForStat](https://github.com/zilionixx/zilionixx-block-explorer-api/blob/aee8fbc4ff56a18b51ff2af071ac27bb11d2e347/test/sync-server/ProcessTransactions/SaveTransactions.js#L3)
  - [SaveTransactionsWithBulkWrite](https://github.com/zilionixx/zilionixx-block-explorer-api/blob/aee8fbc4ff56a18b51ff2af071ac27bb11d2e347/test/sync-server/ProcessTransactions/SaveTransactions.js#L41)

### Performance comparison between `For` statements and `bulkWrite` to update transaction data into MongoDB collection (without required: true propery)

| No  | Update Methodology | Upsert type | Transaction count | number of trials | Total consume time   | Average time per trial | Average time per transaction |
| --- | ------------------ | ----------- | ----------------- | ---------------- | -------------------- | ---------------------- | ---------------------------- |
| 1   | For statment       | Insert      | 1000              | 10               | 20565.52339994907 ms | 2056.552339994907 ms   | 2 ms                         |
| 2   | bulkWrite          | Insert      | 1000              | 10               | 8301.098999977111 ms | 830.1098999977111 ms   | 0.83 ms                      |
| 3   | For statment       | Update      | 1000              | 10               | 19810.31389999389 ms | 1981.031389999389 ms   | 1.98 ms                      |
| 4   | bulkWrite          | Update      | 1000              | 10               | 7009.88179987669 ms  | 700.988179987669 ms    | 0.70 ms                      |

### Analysis

- In case of inserting, `bulkWrite` is 58.5% faster than `updateOne` in `For` statement.
- In case of updating, `bulkWrite` is 64.7% faster than `updateOne` in `For` statement.

In average, `bulkWrite` is approximately 60% faster than `updateOne` in `For` statement.

### Performance comparison between `For` statements and `bulkWrite` to update transaction data into MongoDB collection (with required: true)

| No  | BlockNo | Upsert strategy | required: true | Transaction count in Block | Web3 method call Time in Block (ms) | Average web3 time per txn(ms) | Total txns upsert time in Block(ms) | Average upsert time per txn(ms) | Total consume time (web3 + upsert) in Block (ms) | Average total time per txn(ms) | % of total time per txn by `For Statment` consume time(%) | % of db write time per txn by `For Statment` consume time(%) |
| --- | ------- | --------------- | -------------- | -------------------------- | ----------------------------------- | ----------------------------- | ----------------------------------- | ------------------------------- | ------------------------------------------------ | ------------------------------ | --------------------------------------------------------- | ------------------------------------------------------------ |
| 1   | 44381   | `bulkWrite`     | yes            | 248                        | 3132.2                              | 12.6                          | 1363.6                              | 5.5                             | 4495                                             | 18                             | 86.5                                                      | 80.8                                                         |
| 2   | 44382   | `bulkWrite`     | yes            | 20                         | 222.7                               | 11.135                        | 107.1                               | 5.35                            | 329.7                                            | 16.5                           | 91.3                                                      | 75.8                                                         |
| 3   | 44383   | `bulkWrite`     | yes            | 153                        | 1788.1                              | 11.135                        | 841.2                               | 5.5                             | 2629                                             | 17.2                           | 92.7                                                      | 80                                                           |
| 4   | 44384   | `bulkWrite`     | yes            | 20                         | 249.2                               | 12.5                          | 118.1                               | 5.9                             | 367                                              | 18.35                          | 105.2                                                     | 90.6                                                         |
| 5   | 44385   | `bulkWrite`     | yes            | 306                        | 3980.3                              | 13                            | 1858.4                              | 6.07                            | 5838.7                                           | 19.07                          | 96.9                                                      | 91.2                                                         |
| 6   | 44386   | `bulkWrite`     | yes            | 274                        | 3457.8                              | 12.61                         | 1650.3                              | 6.02                            | 5107.8                                           | 18.64                          | 96.8                                                      | 87.6                                                         |
| 7   | 44387   | `bulkWrite`     | yes            | 240                        | 2998.4                              | 12.5                          | 1556                                | 6.48                            | 4554                                             | 18.97                          | 96.5                                                      | 91.6                                                         |
| 8   | 44389   | `bulkWrite`     | yes            | 123                        | 1497.9                              | 12.17                         | 761.6                               | 6.19                            | 2259.5                                           | 18.36                          | 98.2                                                      | 85.9                                                         |
| 9   | 44390   | `bulkWrite`     | yes            | 12                         | 130.2                               | 10.83                         | 79.8                                | 6.66                            | 210                                              | 17.5                           | 87.9                                                      | 75                                                           |
| 10  | 44391   | `bulkWrite`     | yes            | 70                         | 775.1                               | 11.07                         | 451.2                               | 5.43                            | 1226                                             | 17.5                           | 92.4                                                      | 70                                                           |
| \*  | **Sum** | `bulkWrite`     | yes            | 1536                       | 18301.9                             | 11.91                         | 8787.3                              | 5.72                            | 27089.2                                          | 17.63                          | 94.7                                                      | 86.5                                                         |

| No  | BlockNo | Upsert strategy  | required: true | Transaction count in Block | Web3 method call Time in Block (ms) | Average web3 time per txn(ms) | Total txns upsert time in Block(ms) | Average upsert time per txn(ms) | Total consume time (web3 + upsert) in Block (ms) | Average total time per txn(ms) | % by `For Statment` consume time(%) |
| --- | ------- | ---------------- | -------------- | -------------------------- | ----------------------------------- | ----------------------------- | ----------------------------------- | ------------------------------- | ------------------------------------------------ | ------------------------------ | ----------------------------------- |
| 1   | 44381   | `For(updateOne)` | yes            | 248                        | 3477.8                              | 14.02                         | 1686.8                              | 6.8                             | 5164.6                                           | 20.8                           | 100                                 |
| 2   | 44382   | `For(updateOne)` | yes            | 20                         | 220.4                               | 11.02                         | 141.0                               | 7.05                            | 329.7                                            | 18.07                          | 100                                 |
| 3   | 44383   | `For(updateOne)` | yes            | 153                        | 1787.5                              | 11.68                         | 1051.9                              | 6.87                            | 2838.5                                           | 18.55                          | 100                                 |
| 4   | 44384   | `For(updateOne)` | yes            | 20                         | 218.67                              | 10.93                         | 130.2                               | 6.51                            | 348.87                                           | 17.44                          | 100                                 |
| 5   | 44385   | `For(updateOne)` | yes            | 306                        | 3979.8                              | 13.00                         | 2036.2                              | 6.65                            | 6016                                             | 19.66                          | 100                                 |
| 6   | 44386   | `For(updateOne)` | yes            | 274                        | 3393.6                              | 12.34                         | 1882.8                              | 6.87                            | 5107.8                                           | 19.25                          | 100                                 |
| 7   | 44387   | `For(updateOne)` | yes            | 240                        | 3016.2                              | 12.56                         | 1697.4                              | 7.07                            | 4554                                             | 19.64                          | 100                                 |
| 8   | 44389   | `For(updateOne)` | yes            | 123                        | 1412.8                              | 11.48                         | 886.7                               | 7.20                            | 2299.5                                           | 18.69                          | 100                                 |
| 9   | 44390   | `For(updateOne)` | yes            | 12                         | 132.2                               | 11.01                         | 106.6                               | 8.88                            | 238.8                                            | 19.9                           | 100                                 |
| 10  | 44391   | `For(updateOne)` | yes            | 70                         | 788.9                               | 11.27                         | 535.6                               | 7.65                            | 1226                                             | 18.92                          | 100                                 |
| \*  | **Sum** | `For(updateOne)` | yes            | 1536                       | 18427.9                             | 11.99                         | 10155.6                             | 6.61                            | 28583.5                                          | 18.60                          | 100                                 |

### Analysis

- In case of upserting with `required: true` property, `bulkWrite` is 13.5% faster than `updateOne` in `For` statement.
- **Important** : Writing data into db asyncronous, 1 operation takes `0.2ms`, so I updated db writing async methodology with `required: true` property.

## Current Status : Tue Sep 20 2021 (JST)

- web3js method call: 30% faster
- db writing: 30 times faster
- total: **45%** faster
