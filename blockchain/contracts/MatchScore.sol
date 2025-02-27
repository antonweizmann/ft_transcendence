// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MatchScore {
	struct Match {
		uint player1Score;
		uint player2Score;
	}

	Match[] public matches;

	function setScore(uint _player1Score, uint _player2Score) external {
		matches.push(Match(_player1Score, _player2Score));
	}

	function getGameScores(uint _index) public view returns (uint, uint) {
		require(_index < matches.length, "Game index out of bounds");
		Match memory score = matches[_index];
		return (score.player1Score, score.player2Score);
	}
}