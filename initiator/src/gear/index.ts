import { GearApi } from '@gear-js/api';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { sendRequests } from '../chainlink';
import config from '../config';
import { OracleState } from './interfaces';
import { getRequests } from './oracle-requests';

export const main = async () => {
  const api = await GearApi.create({ providerAddress: config.gear.ws });
  const oracleAddress = config.gear.oracle;
  const meta = readFileSync(resolve(config.gear.pathToMeta));
  while (true) {
    await Promise.all([
      setTimeout(async () => {
        const state = (await api.programState.read(oracleAddress, meta)) as OracleState;
        const requests = getRequests(state.requests);
        if (requests !== null) {
          sendRequests(requests);
        }
      }, 10000),
    ]);
  }
};
