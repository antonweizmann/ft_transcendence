// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Score {
    uint public score = 0;

    function increment() public {
        score++;
    }

    function getScore() public view returns (uint) {
        return score;
    }
}