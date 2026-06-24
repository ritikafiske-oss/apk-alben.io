import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddVisitLogIdToNotes1773320294410 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `notes` ADD `visit_log_id` bigint(20) UNSIGNED NOT NULL DEFAULT 0 AFTER `call_log_id`',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `notes` DROP COLUMN `visit_log_id`');
  }
}
