import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config();

export default new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'alben_database',
  entities: [
    path.join(
      __dirname,
      '../../../libs/**/src/domain/entities/*.entity{.ts,.js}',
    ),
    path.join(
      __dirname,
      '../../../libs/**/src/infrastructure/persistence/entities/*.entity{.ts,.js}',
    ),
    path.join(__dirname, '../../../libs/**/entities/*.entity{.ts,.js}'),
    path.join(__dirname, '../../../src/**/entities/*.entity{.ts,.js}'),
  ],
  migrations: [
    'src/infrastructure/persistence/migrations/*.ts',
    'libs/localization/src/infrastructure/persistence/migrations/*.ts',
    'libs/contacts/src/infrastructure/persistence/migrations/*.ts',
    'libs/notes/src/infrastructure/persistence/migrations/*.ts',
    'libs/visits/src/infrastructure/persistence/migrations/*.ts',
    'libs/users/src/infrastructure/persistence/migrations/*.ts',
  ],
  migrationsTableName: 'schema_migrations',
  synchronize: false,
});
