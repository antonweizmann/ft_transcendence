// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MatchScore {
    uint public immutable matchid;
    uint public player1Score = 0;
    uint public player2Score = 0;

    constructor(uint _matchid) { matchid = _matchid; }

    function setPlayer1Score(uint _score) public { player1Score = _score; }
    function setPlayer2Score(uint _score) public { player2Score = _score; }

    function incrementPlayer1() public { player1Score++; }
    function incrementPlayer2() public { player2Score++; }

    function getMatchId() public view returns (uint) { return matchid; }
    function getPlayer1Score() public view returns (uint) { return player1Score; }
    function getPlayer2Score() public view returns (uint) { return player2Score; }
}