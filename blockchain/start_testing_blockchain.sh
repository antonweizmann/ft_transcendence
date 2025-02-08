#!/bin/bash

echo "Starting testing blockchain..."

if ! command -v ganache-cli &> /dev/null
then
    echo "ganache-cli could not be found. Please install ganache-cli and try again."
    exit 1
fi

ganache-cli &

if ! command -v truffle &> /dev/null
then
    echo "Truffle could not be found. Please install Truffle and try again."
    exit 1
fi

echo "migrating contracts to testing blockchain..."
truffle migrate --network development &
echo "running tests..."
truffle test --network development