import axios from 'axios';
import config from '../config';
import { IRequest } from './interfaces';

export async function makeRequest({ jobId, data, requestKey }: IRequest): Promise<any> {
  const uri = `${config.chainlink.url}/v2/jobs/${jobId}/runs`;
  const headers = {
    'Content-Type': 'application/json',
    'X-Chainlink-EA-AccessKey': config.chainlink.inAccessKey,
    'X-Chainlink-EA-Secret': config.chainlink.inSecret,
  };
  console.log('*** sendRequest ***');
  console.log({ ...JSON.parse(data), requestKey });
  const response = await axios.post(uri, JSON.stringify({ ...JSON.parse(data), requestKey }), { headers });
  return response.data;
}

export async function sendRequests(requests: IRequest[]) {
  for (let request of requests) {
    const responseData = await makeRequest(request);
    console.log('*** response ***');
    console.log(responseData);
  }
}
