import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const keys = () =>
  createEnv({
    server: {
      AZURE_AD_B2C_CLIENT_ID: z.string().min(1),
      AZURE_AD_B2C_CLIENT_SECRET: z.string().min(1),
      AZURE_AD_B2C_ISSUER: z.string().min(1),
    },
    client: {},
    runtimeEnv: {
      AZURE_AD_B2C_CLIENT_ID: process.env.AZURE_AD_B2C_CLIENT_ID,
      AZURE_AD_B2C_CLIENT_SECRET: process.env.AZURE_AD_B2C_CLIENT_SECRET,
      AZURE_AD_B2C_ISSUER: process.env.AZURE_AD_B2C_ISSUER,
    },
  });
