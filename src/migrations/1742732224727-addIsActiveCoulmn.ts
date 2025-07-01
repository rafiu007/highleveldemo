import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsActiveCoulmn1742732224727 implements MigrationInterface {
  name = 'AddIsActiveCoulmn1742732224727';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "isActive" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "isActive"`);
  }
}
