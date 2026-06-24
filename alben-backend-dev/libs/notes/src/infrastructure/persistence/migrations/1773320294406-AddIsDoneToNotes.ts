import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsDoneToNotes1773320294406 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "ALTER TABLE `notes` ADD `is_done` tinyint(1) NOT NULL DEFAULT 1 COMMENT 'if reminder completed or not' AFTER `is_reminder_sent`",
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('notes', 'is_done');
  }
}
