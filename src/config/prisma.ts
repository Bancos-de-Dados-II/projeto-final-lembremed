import { defineConfig } from '@prisma/config';
import 'dotenv/config';
import process from 'process'; // A importação que resolveu o erro do TS!

export default defineConfig({
  datasource: {
    url: process.env.DIRECT_URL as string,
  }
});