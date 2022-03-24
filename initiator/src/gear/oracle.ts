import { Metadata, GearApi, Hex, getWasmMetadata } from '@gear-js/api';
import { BTreeMap } from '@polkadot/types-codec';
import { IRequest } from '../chainlink/interfaces';
import { AccountAndRequestId, OracleRequest, OracleState } from './interfaces';

export class GearOracle {
  api: GearApi;
  oracleAddress: Hex;
  metaWasm: Buffer;
  meta: Metadata;

  constructor(oracleAddress: Hex, metaWasmBuffer: Buffer) {
    this.oracleAddress = oracleAddress;
    this.metaWasm = metaWasmBuffer;
  }

  async init(wsProviderAddress: string) {
    this.api = await GearApi.create({
      providerAddress: wsProviderAddress,
      types: { AccountAndRequestId: 'String' },
    });
    this.meta = await getWasmMetadata(this.metaWasm);
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
}
