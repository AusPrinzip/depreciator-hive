require("dotenv").config();
var dhive = require("@hiveio/dhive");
var es = require("event-stream"); // npm install event-stream
var util = require("util");

const targetOp = "vote";

var client = new dhive.Client([
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
  const targetOps = operations.filter((op) => op[0] == targetOp);
  // console.log(operations);
  return util.inspect(targetOps, { colors: true, depth: null }) + "\n";
}
