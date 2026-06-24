import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsNewlyAssignedToUserProductContacts1773320294405 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `user_product_contacts` ADD `is_newly_assigned` tinyint(1) NOT NULL DEFAULT 0 AFTER `attempts`',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('user_product_contacts', 'is_newly_assigned');
  }
}
