import { CreateType, GearApi, Metadata } from '@gear-js/api';
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

  async submitData(data: CLData, callback: (err?: string, ok?: string) => void) {
    const payload = {
      FullfillRequest: {
        request_key: data.request_key,
        data: JSON.stringify(data.data),
      },
    };
    console.log(CreateType.create(this.meta.handle_input as string, payload, this.meta).toHuman());
    try {
      this.api.message.submit({ destination: this.oracle, gasLimit: this.gas, payload }, this.meta);
    } catch (error: any) {
      console.log(error);
      callback(`Unable to submit message. Reason: ${error.message}`);
    }

    try {
      await this.api.message.signAndSend(this.account, ({ events }) => {
        events.forEach(({ event }) => {
          if (this.api.events.system.ExtrinsicFailed.is(event)) {
            callback('extrinsic failed');
          } else if (this.api.events.system.ExtrinsicSuccess.is(event)) {
            callback(undefined, 'success');
          }
        });
      });
    } catch (error: any) {
      console.log(error);
      callback(`Unable to send message. Reason: ${error.message}`);
    }
  }
}
