import { Connection, createConnection } from "typeorm";
import request from "supertest";
import { app } from "../../../../app";
import { OperationType } from "../../entities/Statement";

let connection: Connection;
let authToken: string;

describe("Create Statement Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    await request(app).post("/api/v1/users").send({
      name: "test",
      email: "test@example.com",
      password: "123",
    });

    const response = await request(app).post("/api/v1/sessions").send({
      email: "test@example.com",
      password: "123",
    });

    authToken = response.body.token;
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
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

  it("Should be able to create a withdraw statement", async () => {
    const response = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 10,
        description: "Test statement",
      })
      .set({
        authorization: `Bearer ${authToken}`,
      });

    expect(response.status).toBe(201);
  });

  it("Should not be able to withdraw a value higher than the user's balance", async () => {
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
