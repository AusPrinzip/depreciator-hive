require("dotenv").config();
const { Client, PrivateKey } = require("@hiveio/dhive");
var es = require("event-stream"); // npm install event-stream
var util = require("util");

const targetOpType = "vote";
const targetVoter = process.env.TARGET;

var client = new Client([
  "https://anyx.io",
  "https://api.hive.blog",
  "https://api.hivekings.com",
  "https://api.openhive.network",
]);

var stream = client.blockchain.getBlockStream();

stream
  .pipe(
    es.map(function (block, callback) {
      callback(null, eventHandler(block));
    })
  )
  .pipe(process.stdout);

function eventHandler(block) {
  const operations = block.transactions.map((tx) => tx.operations).flat();
  const targetOps = operations.filter(
    (op) => op[0] == targetOpType && op[1].voter == targetVoter
  );
  if (targetOps.length > 0) {
    downvote(targetOps);
    return util.inspect(targetOps, { colors: true, depth: null }) + "\n";
  }
}

function downvote(voteOps) {
  voteOps.forEach((voteOp) => {
    voteOp.weight = Math.floor(-0.25 * voteOp.weight);
    voteOp.voter = process.env.ACCOUNT;
  });
  client.broadcast.sendOperations(
    voteOps,
    PrivateKey.fromString(process.env.active)
  ); // async "fire and forget"
}
