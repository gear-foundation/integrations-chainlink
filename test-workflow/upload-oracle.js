import { GearApi, GearKeyring, getWasmMetadata } from '@gear-js/api';
import { readFileSync } from 'fs';
import chalk from 'chalk';

const initStatus = (api, programId) => {
  return new Promise((resolve, reject) => {
    api.gearEvents.subscribeToProgramEvents((event) => {
      if (event.data.info.programId.toHex() === programId) {
        if (event.method === 'InitSuccess') {
          console.log(chalk.green('Program initialized'));
          resolve(programId);
        } else if (event.method === 'InitFailure') {
          console.log(chalk.red('Program initialization failed'));
          reject();
        }
      }
    });
  });
};

const main = async (ws, path) => {
  const metaWasm = readFileSync(`${path}.meta.wasm`);
  const code = readFileSync(`${path}.opt.wasm`);
  const api = await GearApi.create({ providerAddress: ws });
  const alice = await GearKeyring.fromSuri('//Alice');
  const meta = await getWasmMetadata(metaWasm);

  const initPayload = {
    owner: '0xd43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d',
    linkToken: '0xd43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d',
    external_adapter: '0xd43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d',
  };
  const { programId } = api.program.submit({ code, initPayload, gasLimit: 200_000_000 }, meta);
  const status = initStatus(api, programId);
  api.program.signAndSend(alice, ({ events = [], status }) => {
    events.forEach(({ event }) => {
      if (status.isInBlock) {
        if (api.events.gear.InitMessageEnqueued.is(event)) {
          console.log(chalk.green('Program uploaded'));
        } else if (api.events.system.ExtrinsicFailed.is(event)) {
          console.log(chalk.red('Extrinsic Failed'));
        }
      }
    });
  });
  return await status;
};

const args = process.argv.slice(2);

main(...args)
  .then((programId) => {
    console.log({ programId });
    process.exit(0);
  })
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });
