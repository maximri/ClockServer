import nock from "nock";
import request from "supertest";
import { Chance } from "chance";

import { myServer } from "../index";

const chance = new Chance();

const timeServerUrl = "http://exampleURL";
const server = request(myServer({ timeServerUrl }));

describe("greetings server", () => {
  beforeEach(() => {
    nock.cleanAll();
  });
  test("Should print your name", async () => {
    nock(timeServerUrl)
      .get("/")
      .reply(200, { data: { time: new Date("2017-01-01 17:00:00") } });

    const userName = chance.name({});
    const response = await server.get(`/greeting?name=${userName}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe(`Greetings ${userName}!`);
  });

  test("Should print zzz when server time is between 2-4pm", async () => {
    nock(timeServerUrl)
      .get("/")
      .reply(200, { data: { time: new Date("2017-01-01 15:00:00") } });
    const response = await server.get("/greeting?name=max");

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("zzz");
  });
});
