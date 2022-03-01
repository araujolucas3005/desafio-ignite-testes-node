import { Connection, createConnection } from "typeorm";
import request from "supertest";
import { app } from "../../../../app";

let connection: Connection;

describe("Authenticate Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  afterEach(async () => {
    connection.query("DELETE FROM users");
  });

  it("Should be able to authenticate user", async () => {
    await request(app).post("/api/v1/users").send({
      name: "test",
      email: "test@example.com",
      password: "123",
    });

    const response = await request(app).post("/api/v1/sessions").send({
      email: "test@example.com",
      password: "123",
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("token");
    expect(response.body).toHaveProperty("user");
  });

  it("Should not be able to authenticate a non-existing user", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: "test@example.com",
      password: "123",
    });

    expect(response.status).toBe(401);
  });

  it("Should not be able to authenticate an user with wrong password", async () => {
    await request(app).post("/api/v1/users").send({
      name: "test",
      email: "test@example.com",
      password: "123",
    });

    const response = await request(app).post("/api/v1/sessions").send({
      email: "test@example.com",
      password: "1234",
    });

    expect(response.status).toBe(401);
  });
});
