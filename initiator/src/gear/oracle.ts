import { Metadata, GearApi, GearKeyring, Hex, getWasmMetadata } from '@gear-js/api';
import { BTreeMap } from '@polkadot/types-codec';
import { IRequest, AccountAndRequestId, FullfillRequestData, OracleRequest } from '../interfaces';
import { KeyringPair } from '@polkadot/keyring/types';

export class GearOracle {
  api: GearApi;
  oracleAddress: Hex;
  metaWasm: Buffer;
  meta: Metadata;
  account: KeyringPair;
  gas: string;

  constructor(oracleAddress: Hex, metaWasmBuffer: Buffer, gas: string) {
    this.oracleAddress = oracleAddress;
    this.metaWasm = metaWasmBuffer;
    this.gas = gas;
  }

  async init(wsProviderAddress: string, accountSeed: string) {
    this.api = await GearApi.create({
      providerAddress: wsProviderAddress,
      types: { AccountAndRequestId: 'String' },
    });
    this.meta = await getWasmMetadata(this.metaWasm);
    this.account =
      accountSeed === 'Alice' ? await GearKeyring.fromSuri('//Alice') : await GearKeyring.fromSeed(accountSeed);
  }

  async readState(): Promise<BTreeMap<AccountAndRequestId, OracleRequest>> {
    const state = await this.api.programState.read(this.oracleAddress, this.metaWasm);
    return state as BTreeMap<AccountAndRequestId, OracleRequest>;
  }

  getRequests(stateRequests: BTreeMap<AccountAndRequestId, OracleRequest>): IRequest[] | null {
    if (stateRequests.size === 0) {
      return null;
    }
    const result: IRequest[] = [];
    stateRequests.forEach((value, key) => {
      result.push({ jobId: value.jobId.toString(), data: value.data.toString(), request_key: key.toString() });
    });

    return result;
  }

  async submitData(data: FullfillRequestData[]) {
    const fullfill = () => {
      const result: Record<string, { ok?: string; err?: string }> = {};
      data.forEach(({ request_key, error, data }) => {
        result[request_key] = error ? { err: error } : { ok: typeof data === 'string' ? data : JSON.stringify(data) };
      });
      return result;
    };
    const payload = { FullfullRequests: fullfill() };
    try {
      this.api.message.submit({ destination: this.oracleAddress, gasLimit: this.gas, payload }, this.meta);
    } catch (error: any) {
      console.log(`ERROR: ${error}`);
    }

    try {
      await this.api.message.signAndSend(this.account, ({ events, status }) => {
        events.forEach(({ event }) => {
          if (this.api.events.system.ExtrinsicFailed.is(event)) {
            status.isInBlock && console.log(`ERROR: ExtrinsicFailed. ${event.createdAtHash?.toHex()}`);
          }
        });
      });
    } catch (error: any) {
      console.log(`ERROR: ${error}`);
    }
  }
}
