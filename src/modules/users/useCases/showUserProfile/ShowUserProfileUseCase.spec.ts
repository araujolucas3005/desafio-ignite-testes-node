import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../createUser/ICreateUserDTO";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let showUserProfileUseCase: ShowUserProfileUseCase;

describe("Show user profile", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    showUserProfileUseCase = new ShowUserProfileUseCase(
      inMemoryUsersRepository
    );
  });

  it("Should be able to return an user's profile", async () => {
    const user: ICreateUserDTO = {
      name: "test",
      email: "test@example.com",
      password: "123",
    };

    const createdUser = await createUserUseCase.execute(user);

    const profile = await showUserProfileUseCase.execute(createdUser.id!);

    expect(createdUser).toEqual(profile);
  });

  it("Should not be able to return a non-existing user's profile", async () => {
    expect(async () => {
      await showUserProfileUseCase.execute("fake-id");
    }).rejects.toBeInstanceOf(ShowUserProfileError);
  });
});
