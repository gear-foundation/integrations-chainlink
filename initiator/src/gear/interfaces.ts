import { Type, u128, u64, BTreeMap } from '@polkadot/types-codec';
import { Codec } from '@polkadot/types-codec/types';

export interface AccountAndRequestId extends Type {}

export interface OracleRequest extends Codec {
  caller: Type;
  jobId: String;
  callback_address: Type;
  data: String;
  payment: u128;
  expiration: u64;
}

export interface OracleState extends Codec {
  owner: Type;
  link_token: Type;
  external_adapter: Type;
  requests: BTreeMap<AccountAndRequestId, OracleRequest>;
}
