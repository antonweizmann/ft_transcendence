// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MatchScore {
	struct Match {
		uint index;
		uint p1id;
		uint p2id;
		uint p1score;
		uint p2score;
	}

	Match[] public matches;

	function setMatchScore(uint _index, uint _p1id, uint _p2id, uint _p1score, uint _p2score) external {
		matches.push(Match(_index, _p1id, _p2id, _p1score, _p2score));
	}

	function getTotalMatches() external view returns (uint) {
		return matches.length;
	}

	function getMatchIndex(uint _matchesIndex) external view returns (uint) {
		return matches[_matchesIndex].index;
	}

	function getMatchScore(uint _index) external view returns (uint, uint, uint, uint) {
		for (uint i = 0; i < matches.length; i++) {
			if (matches[i].index == _index) {
				return (matches[i].p1id, matches[i].p2id, matches[i].p1score, matches[i].p2score);
			}
			
		}
		revert("Match not found");
	}
}