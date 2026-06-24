import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsServiceToProductContactsAndUserProductContacts1773320294409 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `product_contacts` ADD `is_service` tinyint(1) NOT NULL DEFAULT 0 AFTER `product_id`',
    );
    await queryRunner.query(
      'ALTER TABLE `user_product_contacts` ADD `is_service` tinyint(1) NOT NULL DEFAULT 0 AFTER `product_id`',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `user_product_contacts` DROP COLUMN `is_service`',
    );
    await queryRunner.query(
      'ALTER TABLE `product_contacts` DROP COLUMN `is_service`',
    );
  }
}
