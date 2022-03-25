import { Hex } from '@gear-js/api';
import { readFileSync } from 'fs';
import { sendRequests } from './chainlink';
import config from './config';
import { GearOracle } from './gear';

const sleep = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, config.timeout);
  });
};

const main = async () => {
  const oracle = new GearOracle(config.gear.oracle as Hex, readFileSync(config.gear.pathToMeta), config.gear.gas);
  await oracle.init(config.gear.ws, config.gear.acoountSeed);
  console.log(`🚀 App is running`);
  while (true) {
    const state = await oracle.readState();
    const requests = oracle.getRequests(state);
    if (requests !== null) {
      const responses = await sendRequests(requests);
      await oracle.submitData(responses);
    }
    await sleep();
  }
};

main();
