import { GearApi, GearKeyring, getWasmMetadata } from '@gear-js/api';
import { readFileSync } from 'fs';
import config from './config';
import { Gear } from './gear';
import { AdapterServer } from './server';

const main = async () => {
  const api = await GearApi.create({ providerAddress: config.gear.ws, types: { AccountAndRequestId: 'String' } });
  const meta = await getWasmMetadata(readFileSync(config.oracle.pathToMeta));
  const account =
    config.gear.acoountSeed === 'Alice'
      ? await GearKeyring.fromSuri('//Alice')
      : await GearKeyring.fromSeed(config.gear.acoountSeed);
  const gear = new Gear(api, meta, account);
  const server = new AdapterServer(gear);
  server.run();
};

main();
