## Description

The External Initiator provides opprotunity for Gear Oracle contract to run jobs on Chainlink nodes and receive results of execution.

## Work process

1. [Connect](https://github.com/gear-tech/chainlink-integration/blob/master/initiator/src/index.ts#L16-L17) to the gear node and initialize metadata of `oracle` contract.
2. [Read state](https://github.com/gear-tech/chainlink-integration/blob/master/initiator/src/index.ts#L20) of `oracle` contract once in a while.
3. If state contains job requests, then initiator [sends these requests to chainlink node](https://github.com/gear-tech/chainlink-integration/blob/master/initiator/src/index.ts#L23) and wait for response.
4. [Submit](https://github.com/gear-tech/chainlink-integration/blob/master/initiator/src/index.ts#L24) received response to `oracle` contract.
