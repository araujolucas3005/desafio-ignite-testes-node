import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
} from "typeorm";

export class addSenderIdColumnToStatements1646137083861
  implements MigrationInterface
{
  readonly TABLE_NAME = "statements";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      this.TABLE_NAME,
      new TableColumn({
        name: "sender_id",
        type: "uuid",
        isNullable: true,
      })
    );

    await queryRunner.createForeignKey(
      this.TABLE_NAME,
      new TableForeignKey({
        name: "FKSenderId",
        referencedTableName: "users",
        referencedColumnNames: ["id"],
        columnNames: ["sender_id"],
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey(this.TABLE_NAME, "FKSenderId");
    await queryRunner.dropColumn(this.TABLE_NAME, "sender_id");
  }
}
