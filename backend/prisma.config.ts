import { defineConfig } from "@prisma/internals";

export default defineConfig({
  migrations: {
    seed: "ts-node ./prisma/seed.ts",
  },
  datasource: {
    url: process.env.DATABASE_URL || "",
  },
});
