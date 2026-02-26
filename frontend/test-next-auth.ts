import { authOptions } from "./src/app/api/auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
console.log(authOptions.providers[0].id);
