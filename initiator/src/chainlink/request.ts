import axios from 'axios';
import config from '../config';
import { FullfillRequestData, IMakeRequestResult, IRequest } from '../interfaces';

export async function makeRequest({ jobId, data, request_key }: IRequest): Promise<IMakeRequestResult> {
  const uri = `${config.chainlink.url}/v2/jobs/${jobId}/runs`;
  const headers = {
    'Content-Type': 'application/json',
    'X-Chainlink-EA-AccessKey': config.chainlink.inAccessKey,
    'X-Chainlink-EA-Secret': config.chainlink.inSecret,
  };
  const response = await axios.post(uri, JSON.parse(data), { headers });
  return { request_key, data: response.data.data };
}

export async function sendRequests(requests: IRequest[]): Promise<FullfillRequestData[]> {
  const responses = await Promise.all(requests.map(makeRequest));
  console.log('*** response ***');
  console.log(JSON.stringify(responses, undefined, 4));
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
