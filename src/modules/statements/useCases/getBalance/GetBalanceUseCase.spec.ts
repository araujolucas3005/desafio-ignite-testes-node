import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
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
    const user: ICreateUserDTO = {
      name: "test",
      email: "test@example.com",
      password: "123",
    };

    const createdUser = await createUserUseCase.execute(user);

    // const createdStatement = await createStatementUseCase.execute({
    //   amount: 3530,
    //   description: "Test statement",
    //   type: OperationType.DEPOSIT,
    //   user_id: createdUser.id!,
    // });

    let balance = await getBalanceUseCase.execute({
      user_id: createdUser.id!,
    });

    expect(balance.balance).toBe(0);

    await createStatementUseCase.execute({
      amount: 3530,
      description: "Test statement",
      type: OperationType.DEPOSIT,
      user_id: createdUser.id!,
    });

    balance = await getBalanceUseCase.execute({
      user_id: createdUser.id!,
    });

    expect(balance.balance).toBe(3530);

    await createStatementUseCase.execute({
      amount: 2000,
      description: "Test statement",
      type: OperationType.WITHDRAW,
      user_id: createdUser.id!,
    });

    balance = await getBalanceUseCase.execute({
      user_id: createdUser.id!,
    });

    expect(balance.balance).toBe(1530);
  });

  it("Should not be able to return a non-existing user's balance", () => {
    expect(async () => {
      await getBalanceUseCase.execute({
        user_id: "fake-id",
      });
    }).rejects.toBeInstanceOf(GetBalanceError);
  });
});
