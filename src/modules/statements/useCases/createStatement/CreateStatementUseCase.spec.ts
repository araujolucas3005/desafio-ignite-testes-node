import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";

let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe("Create Statement", () => {
  beforeEach(() => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it("Should be able to create a credit statement", async () => {
    const user: ICreateUserDTO = {
      name: "test",
      email: "test@example.com",
      password: "123",
    };

    const createdUser = await createUserUseCase.execute(user);

    const createdStatement = await createStatementUseCase.execute({
      amount: 3530,
      description: "Test statement",
      type: OperationType.DEPOSIT,
      user_id: createdUser.id!,
    });

    expect(createdStatement).toHaveProperty("id");
  });

  it("Should not be able to create a statement for a non-existing user", () => {
    expect(async () => {
      await createStatementUseCase.execute({
        amount: 3530,
        description: "Test statement",
        type: OperationType.DEPOSIT,
        user_id: "fake-id",
      });
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });

  it("Should not be able to withdraw a value higher than the user's balance", async () => {
    const user: ICreateUserDTO = {
      name: "test",
      email: "test@example.com",
      password: "123",
    };

    const createdUser = await createUserUseCase.execute(user);

    expect(async () => {
      await createStatementUseCase.execute({
        amount: 3530,
        description: "Test statement",
        type: OperationType.WITHDRAW,
        user_id: createdUser.id!,
      });
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  });
});
