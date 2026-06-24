import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIdsToNotifications1773320294420 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `notifications` ADD `product_ids` varchar(255) NULL AFTER `product_id`',
    );
    await queryRunner.query(
      'ALTER TABLE `notifications` ADD `note_ids` varchar(255) NULL AFTER `note_id`',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `notifications` DROP COLUMN `product_ids`',
    );
    await queryRunner.query(
      'ALTER TABLE `notifications` DROP COLUMN `note_ids`',
    );
  }
}
