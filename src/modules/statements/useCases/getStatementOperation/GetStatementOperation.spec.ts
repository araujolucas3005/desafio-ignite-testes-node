import { Connection, createConnection } from "typeorm";
import request from "supertest";
import { app } from "../../../../app";
import { v4 as uuid } from "uuid";

let connection: Connection;
let authToken: string;

describe("Get Statement Operation Controller", () => {
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

  it("Should be able to return a user's statement operation", async () => {
    const {
      body: { id: statementOperationId },
    } = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 10,
        description: "Test statement",
      })
      .set({
        authorization: `Bearer ${authToken}`,
      });

    const response = await request(app)
      .get(`/api/v1/statements/${statementOperationId}`)
      .set({
        authorization: `Bearer ${authToken}`,
      });

    expect(response.status).toBe(200);
  });

  it("Should not be able to return an user's non-existing statement operation", async () => {
    const response = await request(app)
      .get(`/api/v1/statements/${uuid()}`)
      .set({
        authorization: `Bearer ${authToken}`,
      });

    expect(response.status).toBe(404);
  });
});
