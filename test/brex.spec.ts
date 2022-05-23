import request from "supertest";

import { myServer } from "../index";

const server = request(myServer({ timeServerUrl: "http://exampleURL" }));

describe("Brex server", () => {
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
