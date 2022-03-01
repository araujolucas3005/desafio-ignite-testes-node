import { Connection, createConnection } from "typeorm";
import request from "supertest";
import { app } from "../../../../app";
import { ProfileMap } from "../../mappers/ProfileMap";

let connection: Connection;

describe("Show User Profile Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("Should be able to return an user's profile", async () => {
    await request(app).post("/api/v1/users").send({
      name: "test",
      email: "test@example.com",
      password: "123",
    });

    const {
      body: { token },
    } = await request(app).post("/api/v1/sessions").send({
      email: "test@example.com",
      password: "123",
    });

    const response = await request(app)
      .get("/api/v1/profile")
      .set({
        authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(200);
  });
});
