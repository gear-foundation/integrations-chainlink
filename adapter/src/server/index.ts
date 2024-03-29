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
      await this.gearApi.submitData(req.body, (err, ok) => {
        if (err) {
          res.statusCode = 500;
          res.json({ error: err });
          return;
        } else {
          res.statusCode = 200;
          res.json({ result: ok });
          return;
        }
      });
    });
  }

  run() {
    this.app.listen(config.server.port, () => {
      console.log(`Adapter server is running on port ${config.server.port} 🚀`);
    });
  }
}
