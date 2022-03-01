import { Connection, createConnection } from "typeorm";
import request from "supertest";
import { app } from "../../../../app";

let connection: Connection;
let authToken: string;

describe("Get Balance Controller", () => {
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

  it("Should be able to return user's balance", async () => {
    let response = await request(app)
      .get("/api/v1/statements/balance")
      .set({
        authorization: `Bearer ${authToken}`,
      });

    expect(response.status).toBe(200);
    expect(response.body.balance).toBe(0);

    await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 10,
        description: "Test statement",
      })
      .set({
        authorization: `Bearer ${authToken}`,
      });

    response = await request(app)
      .get("/api/v1/statements/balance")
      .set({
        authorization: `Bearer ${authToken}`,
      });

    expect(response.body.balance).toBe(10);

    await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 10,
        description: "Test statement",
      })
      .set({
        authorization: `Bearer ${authToken}`,
      });

    response = await request(app)
      .get("/api/v1/statements/balance")
      .set({
        authorization: `Bearer ${authToken}`,
      });

    expect(response.body.balance).toBe(0);
  });
});
