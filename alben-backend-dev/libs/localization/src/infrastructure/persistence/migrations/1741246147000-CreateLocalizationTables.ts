import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateLocalizationTables1741246147000 implements MigrationInterface {
  name = 'CreateLocalizationTables1741246147000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE \`language_keys\` (
        \`id\` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
        \`key_name\` varchar(255) NOT NULL,
        \`created_at\` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`language_keys_key_name_unique\` (\`key_name\`)
      ) ENGINE=InnoDB
    `);

    await queryRunner.query(`
      CREATE TABLE \`language_values\` (
        \`id\` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
        \`language_id\` bigint UNSIGNED NOT NULL,
        \`language_key_id\` bigint UNSIGNED NOT NULL,
        \`value\` text NOT NULL,
        \`created_at\` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`language_values_language_key_unique\` (\`language_id\`, \`language_key_id\`),
        INDEX \`idx_language_values_language_id\` (\`language_id\`),
        INDEX \`idx_language_values_language_key_id\` (\`language_key_id\`)
      ) ENGINE=InnoDB
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`language_values\``);
    await queryRunner.query(`DROP TABLE \`language_keys\``);
  }
}
