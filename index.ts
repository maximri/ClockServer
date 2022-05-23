import express from "express";

import {
  GreetingsService,
  GreetingsServiceFactory,
  TimeService,
  TimeServiceFactory,
} from "./src/services";
import { DefaultBrexService } from "./src/brexService";

// used in yarn start
const fakeEveningTimeService: TimeService = {
  getTime: () => Promise.resolve(new Date("2017-01-01 19:30:00")),
};

let greetingsService: GreetingsService = GreetingsServiceFactory(
  fakeEveningTimeService
);
const brexService = DefaultBrexService();

const index = express();

index.get("/greeting", async (req: express.Request, res: express.Response) => {
  const message = await greetingsService.greet(req.query.name as string);

  return res.json({ message });
});

index.get("/brex", async (req: express.Request, res: express.Response) => {
  return res.json({ data: await brexService.parseDatesFromSample() });
});

// index.listen(3000, () =>
//     console.log('Clock server listening on port 3000!'),
// )

export const myServer = ({ timeServerUrl }: { timeServerUrl: string }) => {
  greetingsService = GreetingsServiceFactory(TimeServiceFactory(timeServerUrl));

  return index;
};
