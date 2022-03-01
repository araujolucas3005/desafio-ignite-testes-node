import { Connection, createConnection } from "typeorm";
import request from "supertest";
import { app } from "../../../../app";
import jwt from "jsonwebtoken";
import authConfig from "../../../../config/auth";
import { v4 as uuid } from "uuid";

let connection: Connection;
let authToken: string;
let receiverAuthToken: string;
let user_id: string;
let receiver_id: string;

describe("Create Statement Controller", () => {
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

    user_id = (jwt.verify(authToken, authConfig.jwt.secret) as { sub: string })
      .sub;

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

  it("Should be able to create a deposit statement", async () => {
    const response = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 10,
        description: "Test statement",
      })
      .set({
        authorization: `Bearer ${authToken}`,
      });

    expect(response.status).toBe(201);
  });

  it("Should be able to create a transfer statement", async () => {
    await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 10,
        description: "Test statement",
      })
      .set({
        authorization: `Bearer ${authToken}`,
      });

    const transferResponse = await request(app)
      .post(`/api/v1/statements/transfer/${receiver_id}`)
      .send({
        amount: 5,
        description: "test transfer",
      })
      .set({
        authorization: `Bearer ${authToken}`,
      });

    expect(transferResponse.status).toBe(201);
  });

  it("Should be not able to create a transfer statement if amount is higher than user's balance", async () => {
    await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 10,
        description: "Test statement",
      })
      .set({
        authorization: `Bearer ${authToken}`,
      });

    const transferResponse = await request(app)
      .post(`/api/v1/statements/transfer/${receiver_id}`)
      .send({
        amount: 205,
        description: "test transfer",
      })
      .set({
        authorization: `Bearer ${authToken}`,
      });

    expect(transferResponse.status).toBe(400);
  });

  it("Should not be able to create a transfer statement to a non-existing user", async () => {
    await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 10,
        description: "Test statement",
      })
      .set({
        authorization: `Bearer ${authToken}`,
      });

    const transferResponse = await request(app)
      .post(`/api/v1/statements/transfer/${uuid()}`)
      .send({
        amount: 1,
        description: "test transfer",
      })
      .set({
        authorization: `Bearer ${authToken}`,
      });

    expect(transferResponse.status).toBe(404);
  });

  it("Should be able to create a withdraw statement", async () => {
    await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 10,
        description: "Test statement",
      })
      .set({
        authorization: `Bearer ${authToken}`,
      });

    const response = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 1,
        description: "Test statement",
      })
      .set({
        authorization: `Bearer ${authToken}`,
      });

    expect(response.status).toBe(201);
  });

  it("Should not be able to withdraw a value higher than the user's balance", async () => {
    await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 9,
        description: "Test statement",
      })
      .set({
        authorization: `Bearer ${authToken}`,
      });

    const response = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 10,
        description: "Test statement",
      })
      .set({
        authorization: `Bearer ${authToken}`,
      });

    expect(response.status).toBe(400);
  });
});
