import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsMyPlanToNotes1773320294408 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `notes` ADD `is_my_plan` tinyint(1) NOT NULL DEFAULT 0 AFTER `is_reminder_sent`',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `notes` DROP COLUMN `is_my_plan`');
  }
}
