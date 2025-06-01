import * as env from '../constants/env';

const isProd = process.env.NODE_ENV === 'production';

const getConfig = () => {
  if (isProd) {
    return {
      host: env.PROD_DB_HOST,
      port: Number(env.PROD_DB_PORT) || 5432,
      user: env.PROD_DB_USER,
      password: env.PROD_DB_PASSWORD,
      database: env.PROD_DB_NAME,
      ssl: {
        rejectUnauthorized: false
      }
    };
  } else {
    return {
      host: env.DB_HOST || 'localhost',
      port: Number(env.DB_PORT) || 5432,
      user: env.DB_USER || 'postgres',
      password: env.DB_PASSWORD || 'password',
      database: env.DB_NAME || 'mydatabase',
      ssl: false
    };
  }
};

export const dbConfig = getConfig();
