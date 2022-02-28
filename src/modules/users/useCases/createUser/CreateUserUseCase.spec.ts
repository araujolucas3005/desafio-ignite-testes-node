import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "./CreateUserUseCase";
import { ICreateUserDTO } from "./ICreateUserDTO";
import bcrypt from "bcryptjs";
import { CreateUserError } from "./CreateUserError";

let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe("Create User", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it("Should be able to create an user", async () => {
    const user: ICreateUserDTO = {
      name: "test",
      email: "test@example.com",
      password: "123",
    };

    const createdUser = await createUserUseCase.execute(user);

    expect(createdUser).toHaveProperty("id");
  });

  it("Should be able to hash users's password on creation", async () => {
    const user: ICreateUserDTO = {
      name: "test",
      email: "test@example.com",
      password: "123",
    };

    const createdUser = await createUserUseCase.execute(user);

    const passwordEquals = bcrypt.compare(user.password, createdUser.password);

    expect(passwordEquals).toBeTruthy();
  });

  it("Should not be able to create an user if email already exists", async () => {
    const user: ICreateUserDTO = {
      name: "test",
      email: "test@example.com",
      password: "123",
    };

    await createUserUseCase.execute(user);

    const user2: ICreateUserDTO = {
      name: "test2",
      email: "test@example.com",
      password: "123",
    };

    expect(async () => {
      await createUserUseCase.execute(user2);
    }).rejects.toBeInstanceOf(CreateUserError);
  });
});
