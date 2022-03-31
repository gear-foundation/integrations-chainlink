import axios from 'axios';
import chalk from 'chalk';
import config from '../config';
import { FullfillRequestData, IMakeRequestResult, IRequest } from '../interfaces';

export async function makeRequest({ jobId, data, request_key }: IRequest): Promise<IMakeRequestResult> {
  const url = `${config.chainlink.url}/v2/jobs/${jobId}/runs`;
  const headers = {
    'Content-Type': 'application/json',
    'X-Chainlink-EA-AccessKey': config.chainlink.inAccessKey,
    'X-Chainlink-EA-Secret': config.chainlink.inSecret,
  };
  console.log(chalk.green('Send request to chainlink node'));
  console.log({ url, data });
  const response = await axios.post(url, JSON.parse(data), { headers });
  console.log(chalk.green('Received response from chainlink node'));
  console.log({ data: response.data.data });
  return { request_key, data: response.data.data };
}

export async function sendRequests(requests: IRequest[]): Promise<FullfillRequestData[]> {
  const responses = await Promise.all(requests.map(makeRequest));
  return responses.map(handleResponse);
}

export function handleResponse({
  data: {
    attributes: { outputs, errors },
  },
  request_key,
}: IMakeRequestResult): FullfillRequestData {
  const result: FullfillRequestData = { request_key };
  if (outputs) {
    result['data'] = JSON.stringify({ data: outputs });
  } else if (errors) {
    result['error'] = errors.join('&&');
  } else {
    result['error'] = 'Unknown error';
  }
  return result;
}
