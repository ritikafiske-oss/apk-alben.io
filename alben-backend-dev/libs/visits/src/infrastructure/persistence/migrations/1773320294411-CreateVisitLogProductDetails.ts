import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateVisitLogProductDetails1773320294411 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'visit_log_product_details',
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
            name: 'visit_log_id',
            type: 'bigint',
            unsigned: true,
          },
          {
            name: 'product_id',
            type: 'bigint',
            unsigned: true,
          },
          {
            name: 'visit_type_id',
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
      'visit_log_product_details',
      new TableForeignKey({
        columnNames: ['visit_log_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'visit_logs',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'visit_log_product_details',
      new TableForeignKey({
        columnNames: ['product_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'products',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'visit_log_product_details',
      new TableForeignKey({
        columnNames: ['visit_type_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'visit_types',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('visit_log_product_details');
  }
}
