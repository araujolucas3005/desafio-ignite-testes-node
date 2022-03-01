import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

let inMemoryStatementsRepository: InMemoryStatementsRepository;
let getBalanceUseCase: GetBalanceUseCase;
let createStatementUseCase: CreateStatementUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe("Create Statement", () => {
  beforeEach(() => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();
    getBalanceUseCase = new GetBalanceUseCase(
      inMemoryStatementsRepository,
      inMemoryUsersRepository
    );
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
  });

  it("Should be able to return user's balance", async () => {
    const user = await createUserUseCase.execute({
      name: "test",
      email: "test@example.com",
      password: "123",
    });

    await createStatementUseCase.execute({
      amount: 3530,
      description: "Test statement",
      type: OperationType.DEPOSIT,
      user_id: user.id!,
    });

    await createStatementUseCase.execute({
      amount: 2000,
      description: "Test statement",
      type: OperationType.WITHDRAW,
      user_id: user.id!,
    });

    const receiver = await createUserUseCase.execute({
      name: "receiver",
      email: "test2@example.com",
      password: "123",
    });

    await createStatementUseCase.execute({
      amount: 700,
      description: "Test statement",
      type: OperationType.TRANSFER,
      user_id: user.id!,
      receiver_id: receiver.id!,
    });

    const senderBalance = await getBalanceUseCase.execute({
      user_id: user.id!,
    });

    const receiverBalance = await getBalanceUseCase.execute({
      user_id: receiver.id!,
    });

    expect(senderBalance.balance).toBe(3530 - 2000 - 700);
    expect(receiverBalance.balance).toBe(700);
  });

  it("Should not be able to return a non-existing user's balance", () => {
    expect(async () => {
      await getBalanceUseCase.execute({
        user_id: "fake-id",
      });
    }).rejects.toBeInstanceOf(GetBalanceError);
  });
});
