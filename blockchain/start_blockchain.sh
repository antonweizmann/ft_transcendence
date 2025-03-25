#!/bin/sh

su node -c '
echo "LAUNCHING TESTING BLOCKCHAIN..."
ganache-cli -h 0.0.0.0 -p 8545 --account_keys_path /web3_share/keys.json &
job=$!

echo "MIGRATING CONTRACTS TO TESTING BLOCKCHAIN..."
truffle migrate --network development
cp /solidity/build/contracts/*.json /web3_share/
echo "Contracts saved to /web3_share/"

# echo "TESTING CONTRACTS..."
# if truffle test --network development;
# then
# 	echo "TEST PASSED!"
# 	echo "CONTRACTS READY TO BE USED!"
# else
# 	echo "TEST FAILED!"
# fi

wait $job'