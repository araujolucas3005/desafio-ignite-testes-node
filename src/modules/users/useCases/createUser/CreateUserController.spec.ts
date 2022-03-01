import { Connection, createConnection } from "typeorm";
import request from "supertest";
import { app } from "../../../../app";

let connection: Connection;

describe("Create User Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("Should be able to create a new user", async () => {
    const response = await request(app).post("/api/v1/users").send({
      name: "test",
      email: "test@example.com",
      password: "123",
    });

    expect(response.status).toBe(201);
  });

  it("Should not be able to create an user if email already exists", async () => {
    await request(app).post("/api/v1/users").send({
      name: "test",
      email: "test@example.com",
      password: "123",
    });

    const response = await request(app).post("/api/v1/users").send({
      name: "test2",
      email: "test@example.com",
      password: "123",
    });

    expect(response.status).toBe(400);
  });
});
