// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;
import "../contracts/MatchScore.sol";

contract TestMatchScore {
    function test() public {
        MatchScore Match1 = new MatchScore(1);
        MatchScore Match2 = new MatchScore(2);

        assert(Match1.getPlayer1Score() == 0);
        assert(Match1.getPlayer2Score() == 0);

        assert(Match2.getPlayer1Score() == 0);
        assert(Match2.getPlayer2Score() == 0);

        Match1.increment_player1();
        Match1.increment_player2();

        Match2.increment_player1();
        Match2.increment_player2();

        assert(Match1.getPlayer1Score() == 1);
        assert(Match1.getPlayer2Score() == 1);

        assert(Match2.getPlayer1Score() == 1);
        assert(Match2.getPlayer2Score() == 1);

        assert(Match1.getMatchId() == 1);
        assert(Match2.getMatchId() == 2);
    }
}