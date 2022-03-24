import assert from 'assert/strict';
import { config } from 'dotenv';

function checkEnv(envName: string): string {
  const env = process.env[envName];
  assert.notStrictEqual(env, undefined);
  return env as string;
}

config();

export default {
  server: {
    port: parseInt(process.env.CL_ADAPTER_PORT || '3000'),
  },
  oracle: {
    address: checkEnv('ORACLE_ADDRESS'),
    gas: checkEnv('ORACLE_GAS_LIMIT'),
    pathToMeta: checkEnv('ORACLE_META_WASM'),
  },
  gear: {
    ws: process.env.GEAR_WS_PROVIDER || undefined,
    acoountSeed: checkEnv('GEAR_ACCOUNT_SEED'),
  },
  chainlink: {
    accountSeed: checkEnv('CL_ACCOUNT_SEED'),
    node: checkEnv('CL_NODE_ADDRESS'),
  },
};
