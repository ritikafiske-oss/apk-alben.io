import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsMyPlanToUserProductContacts1773320294407 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `user_product_contacts` ADD `is_my_plan` tinyint(1) NOT NULL DEFAULT 0 AFTER `is_newly_assigned`',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `user_product_contacts` DROP COLUMN `is_my_plan`',
    );
  }
}
