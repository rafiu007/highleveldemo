import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config(); // Load .env file

console.log('Initializing DataSource with config:', {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  database: process.env.DB_NAME,
  deploymentEnv: process.env.DEPLOYMENT_ENV,
});

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: false,
  logging: true,
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/migrations/*.ts'],
  subscribers: [],

  // extra:
  //   process.env.DEPLOYMENT_ENV === 'production' ||
  //   process.env.DEPLOYMENT_ENV === 'staging'
  //     ? { ca: process.env.SSL_KEY }
  //     : { ssl: { mode: 'require' } },
});

// Remove the automatic initialization since TypeORM CLI will handle it
