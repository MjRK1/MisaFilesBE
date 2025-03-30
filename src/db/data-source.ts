import { DataSource } from 'typeorm';
import { ConfigModule, ConfigService } from "@nestjs/config";
ConfigModule.forRoot({
  isGlobal: true,
  envFilePath: '.env',
});

const configService = new ConfigService();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: configService.get("DB_HOST"),
  port: parseInt(configService.get('DB_PORT') as string, 10),
  username: configService.get('DB_USER'),
  password: configService.get('DB_PASSWORD'),
  database: configService.get('DB_NAME'),
  entities: ["dist/entities/*.entities.js"],
  migrations: ["dist/db/migrations/*.js"],
  schema: configService.get('DB_SCHEMA'),
  synchronize: false,
});
