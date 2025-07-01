import { MigrationInterface, QueryRunner } from 'typeorm';

export class LikeforeignkeyFromlikehistory1741772468451
  implements MigrationInterface
{
  name = 'LikeforeignkeyFromlikehistory1741772468451';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "like_history" DROP CONSTRAINT "FK_d206e33980a22f85367d313b8aa"`,
    );
    await queryRunner.query(
      `ALTER TABLE "like_history" DROP CONSTRAINT "FK_dd1729205ca984b10c3f67f1a2c"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "like_history" ADD CONSTRAINT "FK_dd1729205ca984b10c3f67f1a2c" FOREIGN KEY ("toPhoneNumber") REFERENCES "users"("phoneNumber") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "like_history" ADD CONSTRAINT "FK_d206e33980a22f85367d313b8aa" FOREIGN KEY ("fromPhoneNumber") REFERENCES "users"("phoneNumber") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
