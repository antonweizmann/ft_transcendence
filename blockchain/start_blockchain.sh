#!/bin/sh

echo "STARTING TESTING BLOCKCHAIN..."
ganache-cli -p 8545 &

echo "MIGRATING CONTRACTS TO TESTING BLOCKCHAIN..."
truffle migrate --network development

echo "TESTING CONTRACTS..."
if ! truffle test --network development; then
    echo "TEST FAILED"
    exit 1
fi
echo "TEST PASSED"

echo "STOPPING TESTING BLOCKCHAIN..."
killall node

echo "STARTING LIVE BLOCKCHAIN..."
ganache-cli -p 7545 &

echo "MIGRATING CONTRACTS TO LIVE BLOCKCHAIN..."
truffle migrate --network live

echo "CONTRACTS READY TO BE USED!"

while true; do sleep 1; done