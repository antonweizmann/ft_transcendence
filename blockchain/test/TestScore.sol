// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;
import "../contracts/Score.sol";

contract TestScore {
    function test() public {
        Score score = new Score();

        assert(score.getScore() == 0);

        score.increment();

        assert(score.getScore() == 1);
    }
}