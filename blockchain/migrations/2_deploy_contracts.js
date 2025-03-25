const MatchScore = artifacts.require("MatchScore");
const fs = require('fs');

module.exports = function(deployer) {
	console.log("START");
	deployer.deploy(MatchScore, 0)
	.then((instance) => {
		console.log("SAVING ADDRESS");
		fs.writeFileSync("/web3_share/address.txt", instance.address, (err) => {
		if (err) {
		console.error("ERROR WRITTING ADDRESS: ", err);
		} else {
		console.log("ADDRESS SAVED");
		}
	});
	})
	.catch((err) => {
	console.error("ERROR DEPLOYING CONTRACT: ", err);
	});
};
