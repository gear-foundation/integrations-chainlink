import axios from 'axios';
import config from '../config';
import { IRequest } from './interfaces';

export async function makeRequest({ jobId, data, accountAndRequestId }: IRequest): Promise<any> {
  const uri = `${config.chainlink.url}/v2/jobs/${jobId}/runs`;
  const headers = {
    'Content-Type': 'application/json',
    'X-Chainlink-EA-AccessKey': config.chainlink.inAccessKey,
    'X-Chainlink-EA-Secret': config.chainlink.inSecret,
  };
  const response = await axios.post(uri, { ...JSON.parse(data), accountAndRequestId }, { headers });
  return response.data;
}

export async function sendRequests(requests: IRequest[]) {
  for (let request of requests) {
    const responseData = makeRequest(request);
    console.log(responseData);
  }
}
