const MatchScore = artifacts.require("MatchScore");
const fs = require('fs');

// const Web3 = require('web3');
// const web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:8545'));

module.exports = function(deployer) {
  console.log("START");
  deployer.deploy(MatchScore, 0)
  .then((instance) => {
     console.log("SAVING ADDRESS");
      fs.writeFileSync("/web3_share/address.txt", instance.address, (err) => {
      if (err) {
        console.error("ERROR WRITTING ADDRESS:", err);
      } else {
        console.log("ADDRESS SAVED");
      }
    });
  })
  .catch((error) => {
    console.error("ERROR DEPLOYING CONTRACT:", error);
  });
};
