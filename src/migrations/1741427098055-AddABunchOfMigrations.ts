import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddABunchOfMigrations1741427098055 implements MigrationInterface {
  name = 'AddABunchOfMigrations1741427098055';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "phoneNumber" character varying NOT NULL, "name" character varying, "profilePicture" character varying, "linkedinUrl" character varying, "instagramUrl" character varying, "xUrl" character varying, "facebookUrl" character varying, "refreshToken" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_1e3d0240b49c40521aaeb953293" UNIQUE ("phoneNumber"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "like" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "fromPhoneNumber" character varying NOT NULL, "toPhoneNumber" character varying NOT NULL, "isEndorsed" boolean NOT NULL DEFAULT false, "qualities" jsonb, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "isNotified" boolean NOT NULL DEFAULT false, "usedSearch" boolean NOT NULL DEFAULT false, "isMotherQuality" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_eff3e46d24d416b52a7e0ae4159" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ff3d7fcdbb69786e2d0d920196" ON "like" ("fromPhoneNumber") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6404282fa905ba66a0832b07e8" ON "like" ("toPhoneNumber") `,
    );
    await queryRunner.query(
      `CREATE TABLE "like_history" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "fromPhoneNumber" character varying NOT NULL, "toPhoneNumber" character varying NOT NULL, "action" text NOT NULL, "qualities" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_9590b5ddb14737d34976735ed04" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d206e33980a22f85367d313b8a" ON "like_history" ("fromPhoneNumber") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_dd1729205ca984b10c3f67f1a2" ON "like_history" ("toPhoneNumber") `,
    );
    await queryRunner.query(
      `ALTER TABLE "like" ADD CONSTRAINT "FK_ff3d7fcdbb69786e2d0d920196e" FOREIGN KEY ("fromPhoneNumber") REFERENCES "users"("phoneNumber") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "like" ADD CONSTRAINT "FK_6404282fa905ba66a0832b07e83" FOREIGN KEY ("toPhoneNumber") REFERENCES "users"("phoneNumber") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "like_history" ADD CONSTRAINT "FK_d206e33980a22f85367d313b8aa" FOREIGN KEY ("fromPhoneNumber") REFERENCES "users"("phoneNumber") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "like_history" ADD CONSTRAINT "FK_dd1729205ca984b10c3f67f1a2c" FOREIGN KEY ("toPhoneNumber") REFERENCES "users"("phoneNumber") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "like_history" DROP CONSTRAINT "FK_dd1729205ca984b10c3f67f1a2c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "like_history" DROP CONSTRAINT "FK_d206e33980a22f85367d313b8aa"`,
    );
    await queryRunner.query(
      `ALTER TABLE "like" DROP CONSTRAINT "FK_6404282fa905ba66a0832b07e83"`,
    );
    await queryRunner.query(
      `ALTER TABLE "like" DROP CONSTRAINT "FK_ff3d7fcdbb69786e2d0d920196e"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_dd1729205ca984b10c3f67f1a2"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d206e33980a22f85367d313b8a"`,
    );
    await queryRunner.query(`DROP TABLE "like_history"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_6404282fa905ba66a0832b07e8"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ff3d7fcdbb69786e2d0d920196"`,
    );
    await queryRunner.query(`DROP TABLE "like"`);
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
