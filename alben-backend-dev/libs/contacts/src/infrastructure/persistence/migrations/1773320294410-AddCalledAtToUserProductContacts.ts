import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCalledAtToUserProductContacts1773320294410 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `user_product_contacts` ADD `called_at` datetime DEFAULT NULL AFTER `is_newly_assigned`',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('user_product_contacts', 'called_at');
  }
}
