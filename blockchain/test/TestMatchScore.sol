// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;
import "../contracts/MatchScore.sol";

contract TestMatchScore {
	function test() public {
		MatchScore score = new MatchScore();

		score.setMatchScore(1, 10, 20, 3, 2);
		score.setMatchScore(2, 30, 40, 4, 1);
		score.setMatchScore(3, 50, 60, 2, 5);

		(uint m1p1id, uint m1p2id, uint m1p1score, uint m1p2score) = score.getMatchScore(1);
		(uint m2p1id, uint m2p2id, uint m2p1score, uint m2p2score) = score.getMatchScore(2);
		(uint m3p1id, uint m3p2id, uint m3p1score, uint m3p2score) = score.getMatchScore(3);
		
		assert(m1p1id == 10);
		assert(m1p2id == 20);
		assert(m1p1score == 3);
		assert(m1p2score == 2);

		assert(m2p1id == 30);
		assert(m2p2id == 40);
		assert(m2p1score == 4);
		assert(m2p2score == 1);

		assert(m3p1id == 50);
		assert(m3p2id == 60);
		assert(m3p1score == 2);
		assert(m3p2score == 5);
	}
}