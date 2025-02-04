# Voting System

### Specifications
https://forum.massa.community/t/first-step-towards-decentralized-governance/160/13

### Description

1. **Roll Oracle**: This contract manages the recording and deletion of roll data for stakers.
2. **Token Soulbond**: This contract will manage soulbound tokens, which are non-transferable tokens tied to a specific address. (Not yet developed)
3. **Voting System**: This contract will manage a decentralized voting system. (Not yet developed)

## Build

By default, this will build all files in the `assembly/contracts` directory.

```shell
npm run build
```

## Tests

- `assembly/__tests__`: Contains unit tests for individual smart contract functions.
- `src/test`: Contains end-to-end tests that simulate real-world scenarios and interactions between contracts.

To run the tests, use the following command:

```shell
npm run test
```

## Format Code

To format the code, use the following command:

```shell
npm run fmt
```

## Rolls Oracle

The Rolls Oracle contract is a simple contract that allows users to store and delete roll data.

### File Structure

#### Contract
- `assembly/contracts/rolls-oracle.ts`: Contains the exported functions
- `assembly/contracts/oracle-internals/index.ts`: Contains the unit tests for the exported functions
- `assembly/contracts/oracle-internals/keys.ts`: Contains the keys used to store the roll data
- `assembly/contracts/serializable/roll-entry.ts`: Contains the RollEntry class

#### Tests

- `assembly/__tests__/rolls-oracle.spec.ts`: Contains the unit tests for the exported functions

#### End-to-End Tests

- `src/test/e2e/rolls-oracle.test.ts`: Contains the end-to-end tests for the contract
- `src/test/serializable/RollEntry.ts`: Contains the RollEntry Serializable class 
- `src/test/wrappers/Oracle.ts`: Contains the Oracle Wrapper class

### Commands:

Deploy the contract:

```shell
npm run deploy:oracle
```

Run the tests:

```shell
npm run test
```

Run end-to-end tests:

```shell
npm run test:e2e
``` 

### Limitations

- The number of stakers is limited to `40000` (could be solved when key pagination will be released)
- The number of RollEntries is limited to `5000` for each operations
- THe number of entries that can be removed is limited to `5000` for each operations


### TODO

- [ ] Review what's been done
- [ ] Improve end-to-end-tests
- [ ] Code script to easily feed rolls data using node API to fetch stakers/rolls then feed the oracle