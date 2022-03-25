export interface IRequest {
  jobId: string;
  data: string;
  request_key: string;
}

export interface IResponseData {
  outputs: any[];
  errors: [string];
  allErrors: string[];
  fatalErrors: string[];
  inputs: any;
  tasksRuns: { typs: string; createdAt: string; finishedAt: string; output: any; error: string; dotId: string }[];
  createdAt: string;
  finishedAt: string;
  pipelineSpec: {
    id: number;
    jobId: number;
    dotDagSource: string;
  };
}

export interface IMakeRequestResult {
  request_key: string;
  data: IResponseData;
}
