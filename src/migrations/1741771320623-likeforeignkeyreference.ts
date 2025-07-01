import { MigrationInterface, QueryRunner } from 'typeorm';

export class Likeforeignkeyreference1741771320623
  implements MigrationInterface
{
  name = 'Likeforeignkeyreference1741771320623';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "like" DROP CONSTRAINT "FK_ff3d7fcdbb69786e2d0d920196e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "like" DROP CONSTRAINT "FK_6404282fa905ba66a0832b07e83"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "like" ADD CONSTRAINT "FK_6404282fa905ba66a0832b07e83" FOREIGN KEY ("toPhoneNumber") REFERENCES "users"("phoneNumber") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "like" ADD CONSTRAINT "FK_ff3d7fcdbb69786e2d0d920196e" FOREIGN KEY ("fromPhoneNumber") REFERENCES "users"("phoneNumber") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
