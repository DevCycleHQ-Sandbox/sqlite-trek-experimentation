require("dotenv").config({ path: "../../.env" }); // Specify the relative path to the .env file

const DevCycle = require("@devcycle/nodejs-server-sdk");

let devcycleClient;

async function initializeDevCycle() {
  if (!devcycleClient) {
    devcycleClient = await DevCycle.initializeDevCycle(
      process.env.DEVCYCLE_SERVER_SDK_KEY
    ).onClientInitialized();
  }
  return devcycleClient;
}

module.exports = initializeDevCycle;
