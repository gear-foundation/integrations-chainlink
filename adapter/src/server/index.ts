import express, { json, Request, Response, Express } from 'express';
import config from '../config';
import { Gear } from '../gear';

export class AdapterServer {
  app: Express;
  gearApi: Gear;

  constructor(gearApi: Gear) {
    this.app = express();
    this.app.use(json());
    this.registerEndpoints();
    this.gearApi = gearApi;
  }

  registerEndpoints() {
    this.app.post('/', async (req: Request, res: Response) => {
      console.log(req.body);
      this.gearApi.submitData(req.body);
    });
  }

  run() {
    this.app.listen(+config.server.port, () => {
      console.log(`Adapter server is running on port ${config.server.port} 🚀`);
    });
  }
}
