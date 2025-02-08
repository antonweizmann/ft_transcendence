// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MatchScore {
    uint public immutable matchid;
    uint public player1_score = 0;
    uint public player2_score = 0;

    constructor(uint _matchid) { matchid = _matchid; }

    function increment_player1() public { player1_score++; }
    function increment_player2() public { player2_score++; }

    function getMatchId() public view returns (uint) { return matchid; }
    function getPlayer1Score() public view returns (uint) { return player1_score; }
    function getPlayer2Score() public view returns (uint) { return player2_score; }
}