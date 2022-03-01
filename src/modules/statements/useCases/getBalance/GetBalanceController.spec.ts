import { Connection, createConnection } from "typeorm";
import request from "supertest";
import { app } from "../../../../app";
import jwt from "jsonwebtoken";
import authConfig from "../../../../config/auth";

let connection: Connection;
let authToken: string;
let receiverAuthToken: string;
let receiver_id: string;

describe("Get Balance Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    await request(app).post("/api/v1/users").send({
      name: "test",
      email: "test@example.com",
      password: "123",
    });

    await request(app).post("/api/v1/users").send({
      name: "receiver",
      email: "receiver@example.com",
      password: "123",
    });

    const response = await request(app).post("/api/v1/sessions").send({
      email: "test@example.com",
      password: "123",
    });

    const receiverResponse = await request(app).post("/api/v1/sessions").send({
      email: "receiver@example.com",
      password: "123",
    });

    authToken = response.body.token;
    receiverAuthToken = receiverResponse.body.token;

    receiver_id = (
      jwt.verify(receiverAuthToken, authConfig.jwt.secret) as { sub: string }
    ).sub;
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  afterEach(async () => {
    await connection.query("DELETE FROM statements");
  });

  it("Should be able to return user's balance", async () => {
    await request(app)
      .get("/api/v1/statements/balance")
      .set({
        authorization: `Bearer ${authToken}`,
      });

    await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 10,
        description: "Test statement",
      })
      .set({
        authorization: `Bearer ${authToken}`,
      });

    await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 5,
        description: "Test statement",
      })
      .set({
        authorization: `Bearer ${authToken}`,
      });

    await request(app)
      .post(`/api/v1/statements/transfer/${receiver_id}`)
      .send({
        amount: 5,
        description: "test transfer",
      })
      .set({
        authorization: `Bearer ${authToken}`,
      });

    const response = await request(app)
      .get("/api/v1/statements/balance")
      .set({
        authorization: `Bearer ${authToken}`,
      });

    const receiverResponse = await request(app)
      .get("/api/v1/statements/balance")
      .set({
        authorization: `Bearer ${receiverAuthToken}`,
      });

    expect(response.status).toBe(200);
    expect(receiverResponse.status).toBe(200);
    expect(response.body.balance).toBe(10 - 5 - 5);
    expect(receiverResponse.body.balance).toBe(5);
  });
});
