import { GearApi, GearKeyring, getWasmMetadata } from '@gear-js/api';
import { readFileSync } from 'fs';
import chalk from 'chalk';

const logs = (api, programId) => {
  return new Promise((resolve, reject) => {
    api.gearEvents.subscribeToLogEvents(({ data: { source, reply } }) => {
      if (source.toHex() === programId) {
        if (reply.isSome && reply.unwrap()[1].toString() === '0') {
          console.log(chalk.green('Message processed successfully'));
          resolve();
        } else if (reply.isSome && reply.unwrap()[1].toString() !== '0') {
          console.log(chalk.red('Message processed with panic'));
          reject();
        }
      }
    });
  });
};

/**
 *
 * @param {string} pathToMeta
 * @param {string} destination
 * @param {string} pathToJsonPayload
 * @returns
 */
const main = async (ws, pathToMeta, destination, pathToJsonPayload) => {
  if (!pathToMeta || !destination || !pathToJsonPayload || !pathToJsonPayload.endsWith('.json')) {
    throw new Error('Arguments not specified');
  }
  console.log(chalk.cyan('Started'));
  const metaWasm = readFileSync(`${pathToMeta}.meta.wasm`);
  const api = await GearApi.create({ providerAddress: ws });
  const alice = await GearKeyring.fromSuri('//Alice');
  const meta = await getWasmMetadata(metaWasm);
  const l = logs(api, destination.toString());
  const payload = JSON.parse(readFileSync(pathToJsonPayload, 'utf-8'));

  api.message.submit(
    {
      destination: destination.toString(),
      payload,
      gasLimit: 500_000_000,
    },
    meta,
  );

  api.message.signAndSend(alice, ({ events = [], status }) => {
    events.forEach(({ event }) => {
      if (status.isInBlock) {
        if (api.events.gear.DispatchMessageEnqueued.is(event)) {
          console.log(chalk.green('Message sent'));
        } else if (api.events.system.ExtrinsicFailed.is(event)) {
          console.log(chalk.red('Extrinsic Failed'));
        }
      }
    });
  });
  await l;
  return;
};

const args = process.argv.slice(2);
main(...args)
  .then(() => {
    process.exit(0);
  })
  .catch(() => process.exit(1));
