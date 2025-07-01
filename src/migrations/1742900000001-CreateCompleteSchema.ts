import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumn,
  TableForeignKey,
} from 'typeorm';

export class CreateCompleteSchema1742900000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Create workspaces table first
    await queryRunner.createTable(
      new Table({
        name: 'workspaces',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'description',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'isActive',
            type: 'boolean',
            default: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    // 2. Add workspaceId column to users table
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'workspaceId',
        type: 'uuid',
        isNullable: false,
      }),
    );

    // 3. Add foreign key constraint from users to workspaces
    await queryRunner.createForeignKey(
      'users',
      new TableForeignKey({
        columnNames: ['workspaceId'],
        referencedTableName: 'workspaces',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );

    // 4. Create contacts table
    await queryRunner.createTable(
      new Table({
        name: 'contacts',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'phone',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'email',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'address',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'lastContactedAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'workspaceId',
            type: 'uuid',
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    // 5. Add foreign key constraint from contacts to workspaces
    await queryRunner.createForeignKey(
      'contacts',
      new TableForeignKey({
        columnNames: ['workspaceId'],
        referencedTableName: 'workspaces',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // 6. Create the enum type for contact events
    await queryRunner.query(`
      CREATE TYPE contact_event_type_enum AS ENUM ('call', 'email', 'meeting', 'note', 'sms', 'other')
    `);

    // 7. Create contact_events table
    await queryRunner.createTable(
      new Table({
        name: 'contact_events',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'eventType',
            type: 'contact_event_type_enum',
            default: "'note'",
          },
          {
            name: 'description',
            type: 'text',
          },
          {
            name: 'eventDate',
            type: 'timestamp',
          },
          {
            name: 'contactId',
            type: 'uuid',
          },
          {
            name: 'workspaceId',
            type: 'uuid',
          },
          {
            name: 'createdBy',
            type: 'uuid',
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    // 8. Add foreign key constraints for contact_events
    await queryRunner.createForeignKey(
      'contact_events',
      new TableForeignKey({
        columnNames: ['contactId'],
        referencedTableName: 'contacts',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'contact_events',
      new TableForeignKey({
        columnNames: ['workspaceId'],
        referencedTableName: 'workspaces',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'contact_events',
      new TableForeignKey({
        columnNames: ['createdBy'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop tables in reverse order
    await queryRunner.dropTable('contact_events');
    await queryRunner.query(`DROP TYPE contact_event_type_enum`);
    await queryRunner.dropTable('contacts');

    // Drop foreign key from users table
    const table = await queryRunner.getTable('users');
    const foreignKey = table.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('workspaceId') !== -1,
    );
    if (foreignKey) {
      await queryRunner.dropForeignKey('users', foreignKey);
    }

    // Drop workspaceId column from users
    await queryRunner.dropColumn('users', 'workspaceId');

    // Drop workspaces table
    await queryRunner.dropTable('workspaces');
  }
}
