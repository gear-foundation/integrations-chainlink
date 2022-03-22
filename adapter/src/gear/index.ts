import { GearApi, Metadata } from '@gear-js/api';
import { KeyringPair } from '@polkadot/keyring/types';
import config from '../config';
import { CLData } from '../interfaces';

export class Gear {
  api: GearApi;
  oracle: string;
  gas: string;
  meta: Metadata;
  account: KeyringPair;

  constructor(api: GearApi, meta: Metadata, account: KeyringPair) {
    this.api = api;
    this.meta = meta;
    this.oracle = config.oracle.address;
    this.gas = config.oracle.gas;
    this.account = account;
  }

  submitData(data: CLData) {
    this.api.message.submit({ destination: this.oracle, gasLimit: this.gas, payload: data }, this.meta);
    this.api.message.signAndSend(this.account, (events) => {
      console.log(events.toHuman());
    });
  }
}
