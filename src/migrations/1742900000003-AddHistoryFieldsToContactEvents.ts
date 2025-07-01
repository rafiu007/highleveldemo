import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddHistoryFieldsToContactEvents1742900000003
  implements MigrationInterface
{
  name = 'AddHistoryFieldsToContactEvents1742900000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add new event types to the enum
    await queryRunner.query(`
      ALTER TYPE "public"."contact_events_eventtype_enum" 
      ADD VALUE IF NOT EXISTS 'created'
    `);

    await queryRunner.query(`
      ALTER TYPE "public"."contact_events_eventtype_enum" 
      ADD VALUE IF NOT EXISTS 'updated'
    `);

    await queryRunner.query(`
      ALTER TYPE "public"."contact_events_eventtype_enum" 
      ADD VALUE IF NOT EXISTS 'deleted'
    `);

    // Add new columns
    await queryRunner.query(`
      ALTER TABLE "contact_events" 
      ADD COLUMN "isSystemGenerated" boolean NOT NULL DEFAULT false
    `);

    await queryRunner.query(`
      ALTER TABLE "contact_events" 
      ADD COLUMN "metadata" jsonb
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove new columns
    await queryRunner.query(`
      ALTER TABLE "contact_events" 
      DROP COLUMN "metadata"
    `);

    await queryRunner.query(`
      ALTER TABLE "contact_events" 
      DROP COLUMN "isSystemGenerated"
    `);

    // Note: PostgreSQL doesn't support removing enum values easily
    // We'll leave the enum values as they won't cause issues
  }
}
