import { inject, injectable } from "tsyringe";

import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { ICreateStatementDTO } from "./ICreateStatementDTO";

interface IRequest extends Omit<ICreateStatementDTO, "sender_id"> {
  receiver_id?: string;
}

@injectable()
export class CreateStatementUseCase {
  constructor(
    @inject("UsersRepository")
    private usersRepository: IUsersRepository,

    @inject("StatementsRepository")
    private statementsRepository: IStatementsRepository
  ) {}

  async execute({ user_id, type, amount, description, receiver_id }: IRequest) {
    const user = await this.usersRepository.findById(user_id);

    if (!user) {
      throw new CreateStatementError.UserNotFound();
    }

    if (!!receiver_id) {
      const receiver = await this.usersRepository.findById(receiver_id);

      if (!receiver) {
        throw new CreateStatementError.UserNotFound();
      }
    }

    if (type === "withdraw" || type === "transfer") {
      const { balance } = await this.statementsRepository.getUserBalance({
        user_id,
      });

      if (balance < amount) {
        throw new CreateStatementError.InsufficientFunds();
      }
    }

    const statementOperation = await this.statementsRepository.create({
      type,
      amount,
      description,
      ...(!!receiver_id
        ? {
            sender_id: user_id,
            user_id: receiver_id,
          }
        : {
            user_id,
          }),
    });

    return statementOperation;
  }
}
