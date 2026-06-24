import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCallLogIdToNotes1773320294404 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `notes` ADD `call_log_id` bigint UNSIGNED NOT NULL DEFAULT 0 AFTER `user_id`',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('notes', 'call_log_id');
  }
}
