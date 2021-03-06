require("dotenv").config();
const { Client, PrivateKey } = require("@hiveio/dhive");
var es = require("event-stream"); // npm install event-stream
var util = require("util");

const targetOpType = "vote";
const targets = ["ocdb", "steemmonsters", "appreciator", "alpha", "smooth", "blocktrades", "rocky1", "theycallmedan", "blocktrades.com", "mottler", "leo.voter", "buildawhale", "curangel", "newsflash", "bdvoter", "xeldal", "liketu", "ranchorelaxo", "threespeak", "trafalgar", "ecency", "altleft", "themarkymark", "tipu", "steempty"]

var client = new Client([
  "https://anyx.io",
  "https://api.hive.blog",
  "https://api.hivekings.com",
  "https://api.openhive.network",
]);

var stream = client.blockchain.getBlockStream();

const voteMappingRatio = -1;

console.log(`Starting downvoting trail bot`);

stream
  .pipe(
    es.map(function (block, callback) {
      callback(null, eventHandler(block));
    })
  )
  .pipe(process.stdout);

function eventHandler(block) {
  const operations = block.transactions.map((tx) => tx.operations).flat();
  let targetOps = operations.filter(
    (op) => op[0] == targetOpType && targets.includes(op[1].voter)
  );
  if (targetOps.length > 0) {
    // filter dust votes
    targetOps = targetOps.filter(op => op[1].weight > 49);
    downvote(targetOps);
    return util.inspect(targetOps, { colors: true, depth: null }) + "\n";
  }
}

function downvote(voteOps) {
  voteOps.forEach((voteOp) => {
    voteOp[1].weight = Math.floor(voteMappingRatio * voteOp[1].weight);
    voteOp[1].voter = `x${voteOp[1].voter}`
  });
  // console.log(JSON.stringify(voteOps));
  client.broadcast.sendOperations(
    voteOps,
    PrivateKey.fromString(process.env.POSTING)
  ); // async "fire and forget"
}
