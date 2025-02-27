// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;
import "../contracts/MatchScore.sol";

contract TestMatchScore {
	function test() public {
		MatchScore score = new MatchScore();

		score.setScore(3, 2);
		score.setScore(4, 1);
		score.setScore(2, 5);

		(uint m1p1, uint m1p2) = score.getGameScores(0);
		(uint m2p1, uint m2p2) = score.getGameScores(1);
		(uint m3p1, uint m3p2) = score.getGameScores(2);
		
		assert(m1p1 == 3);
		assert(m1p2 == 2);

		assert(m2p1 == 4);
		assert(m2p2 == 1);

		assert(m3p1 == 2);
		assert(m3p2 == 5);
	}
}