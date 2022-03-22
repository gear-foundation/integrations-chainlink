import { BTreeMap } from '@polkadot/types-codec';
import { IRequest } from '../chainlink/interfaces';
import { AccountAndRequestId, OracleRequest } from './interfaces';

export function getRequests(stateRequests: BTreeMap<AccountAndRequestId, OracleRequest>): IRequest[] | null {
  if (stateRequests.size === 0) {
    return null;
  }
  const result: any = [];
  stateRequests.forEach((value, key) => {
    result.push({ jobId: value.job_id.toString(), data: value.data.toString(), accountAndRequestId: key.toString() });
  });

  return result;
}
