#!/bin/sh

echo "LAUNCHING TESTING BLOCKCHAIN..."
ganache-cli -h 0.0.0.0 -p 8545 --account_keys_path /web3_share/keys.json &
job=$!

echo "MIGRATING CONTRACTS TO TESTING BLOCKCHAIN..."
truffle migrate --network development

echo "TESTING CONTRACTS..."
if truffle test --network development;
then
    echo "TEST PASSED!"
    cp /solidity/build/contracts/*.json /web3_share/
    echo "CONTRACTS READY TO BE USED!"
else
    echo "TEST FAILED!"
fi

wait $job