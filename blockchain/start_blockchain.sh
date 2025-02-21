#!/bin/sh

echo "LAUNCHING TESTING BLOCKCHAIN..."
ganache-cli -p 8545 &

echo "MIGRATING CONTRACTS TO TESTING BLOCKCHAIN..."
truffle migrate --network development

echo "TESTING CONTRACTS..."
if truffle test --network development;
then
    echo "TEST PASSED!"
    echo "CONTRACTS READY TO BE USED!"
else
    echo "TEST FAILED!"
fi

while true; do sleep 1; done