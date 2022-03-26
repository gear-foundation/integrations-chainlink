## Description

The External Initiator provides opprotunity for Gear Oracle contract to run jobs on Chainlink nodes and receive results of execution.

## Work process

1. [Connect](https://github.com/gear-tech/chainlink-integration/blob/master/initiator/src/index.ts#L16-L17) to the gear node and initialize metadata of `oracle` contract.
2. [Read state](https://github.com/gear-tech/chainlink-integration/blob/master/initiator/src/index.ts#L20) of `oracle` contract once in a while.
3. If state contains job requests, then initiator [sends these requests to chainlink node](https://github.com/gear-tech/chainlink-integration/blob/master/initiator/src/index.ts#L23) and wait for response.
4. [Submit](https://github.com/gear-tech/chainlink-integration/blob/master/initiator/src/index.ts#L24) received response to `oracle` contract.

## Required environments variables

- ORACLE_ADDRESS - address of oracle contract
- ORACLE_GAS_LIMIT - gasLimit value that will be used when result data is sumitting
- PATH_TO_ORACLE_META - path to file with oracle contract metadata
- GEAR_ACCOUNT_SEED - seed of account that will make transaction to gear network
- CL_URL - url address of chainlink node
- CL_IN_ACCESS_KEY and CL_IN_SECRET - access key and secret that were generated by chainlink and will be used to make requests to chainlink node