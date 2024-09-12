import { initializeDevCycle } from "@devcycle/nodejs-server-sdk";

import dotenv from "dotenv";

dotenv.config({ path: "../../.env" });

let devcycleClient;

async function startDevCycle() {
  devcycleClient = await initializeDevCycle(
    process.env.DEVCYCLE_SERVER_SDK_KEY
  ).onClientInitialized();
  return devcycleClient;
}

export default startDevCycle;
