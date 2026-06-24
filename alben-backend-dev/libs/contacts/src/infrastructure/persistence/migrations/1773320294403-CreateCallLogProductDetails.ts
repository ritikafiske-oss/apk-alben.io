import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateCallLogProductDetails1773320294403 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'call_log_product_details',
        columns: [
          {
            name: 'id',
            type: 'bigint',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
            unsigned: true,
          },
          {
            name: 'call_log_id',
            type: 'bigint',
            unsigned: true,
          },
          {
            name: 'product_id',
            type: 'bigint',
            unsigned: true,
          },
          {
            name: 'last_contact_status_id',
            type: 'bigint',
            unsigned: true,
            isNullable: true,
          },
          {
            name: 'status_id',
            type: 'bigint',
            unsigned: true,
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'call_log_product_details',
      new TableForeignKey({
        columnNames: ['call_log_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'call_logs',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('call_log_product_details');
  }
}
