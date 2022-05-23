import nock from "nock";
import request from "supertest";

import { myServer } from "../index";

const timeServerUrl = "http://exampleURL";
const server = request(myServer(timeServerUrl));

describe("greetings server", () => {
  beforeEach(() => {
    nock(timeServerUrl)
      .get("/")
      .reply(200, { data: { time: new Date("2017-01-01 17:00:00") } });
  });
  test("Should print your name", async () => {
    const userName = "shay";
    const response = await server.get(`/greeting?name=${userName}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe(`Greetings ${userName}!`);
  });

  test("Should print your name, also for max", async () => {
    const response = await server.get("/greeting?name=max");

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Greetings max!");
  });

  test("Should print zzz when server time is between 2-4pm", async () => {
    nock.cleanAll();
    nock(timeServerUrl)
      .get("/")
      .reply(200, { data: { time: new Date("2017-01-01 15:00:00") } });
    const response = await server.get("/greeting?name=max");

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("zzz");
  });

  test("Should be able to fetch brex json api", async () => {
    const response = await server.get("/brex");

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual(
      expect.arrayContaining([
        {
          company: "Brex",
          createdAtMillis: Date.parse("2017-01-01T01:13:36Z"),
          name: "Pedro Franceschi",
        },
      ])
    );
  });
});
