var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/app.ts
import express from "express";
import os from "os";
import morgan from "morgan";
import { toNodeHandler } from "better-auth/node";

// src/lib/auth.ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

// src/lib/prisma.ts
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";

// generated/prisma/client.ts
import * as path from "path";
import { fileURLToPath } from "url";

// generated/prisma/internal/class.ts
import * as runtime from "@prisma/client/runtime/client";
var config = {
  "previewFeatures": [],
  "clientVersion": "7.3.0",
  "engineVersion": "9d6ad21cbbceab97458517b147a6a09ff43aa735",
  "activeProvider": "postgresql",
  "inlineSchema": '// This is your Prisma schema file,\n// learn more about it in the docs: https://pris.ly/d/prisma-schema\n\n// Looking for ways to speed up your queries, or scale easily with your serverless or edge functions?\n// Try Prisma Accelerate: https://pris.ly/cli/accelerate-init\n\ngenerator client {\n  provider = "prisma-client"\n  output   = "../generated/prisma"\n}\n\ndatasource db {\n  provider = "postgresql"\n}\n\nmodel User {\n  id            String     @id\n  name          String\n  email         String\n  emailVerified Boolean    @default(false)\n  image         String?\n  createdAt     DateTime   @default(now())\n  updatedAt     DateTime   @updatedAt\n  role          Role       @default(USER)\n  status        UserStatus @default(ACTIVE)\n\n  phone           String?\n  sessions        Session[]\n  accounts        Account[]\n  providerProfile ProviderProfile?\n  orders          Order[]\n  reviews         Review[]\n\n  @@unique([email])\n  @@map("User")\n}\n\nenum UserStatus {\n  ACTIVE\n  INACTIVE\n}\n\nenum Role {\n  ADMIN\n  USER\n  PROVIDER\n}\n\nmodel Session {\n  id        String   @id\n  expiresAt DateTime\n  token     String\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n  ipAddress String?\n  userAgent String?\n  userId    String\n  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@unique([token])\n  @@index([userId])\n  @@map("Session")\n}\n\nmodel Account {\n  id                    String    @id\n  accountId             String\n  providerId            String\n  userId                String\n  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)\n  accessToken           String?\n  refreshToken          String?\n  idToken               String?\n  accessTokenExpiresAt  DateTime?\n  refreshTokenExpiresAt DateTime?\n  scope                 String?\n  password              String?\n  createdAt             DateTime  @default(now())\n  updatedAt             DateTime  @updatedAt\n\n  @@index([userId])\n  @@map("Account")\n}\n\nmodel Verification {\n  id         String   @id\n  identifier String\n  value      String\n  expiresAt  DateTime\n  createdAt  DateTime @default(now())\n  updatedAt  DateTime @updatedAt\n\n  @@index([identifier])\n  @@map("Verification")\n}\n\nmodel ProviderProfile {\n  id          String   @id @default(uuid())\n  name        String\n  location    String\n  longitude   Float?\n  latitude    Float?\n  description String?\n  userId      String   @unique\n  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)\n  createdAt   DateTime @default(now())\n  updatedAt   DateTime @updatedAt\n  meals       Meal[]\n  reviews     Review[]\n  orders      Order[]\n\n  @@map("ProviderProfile")\n}\n\nmodel Category {\n  id    String @id @default(uuid())\n  name  String @unique\n  meals Meal[]\n\n  @@map("Category")\n}\n\nmodel Meal {\n  id          String          @id @default(uuid())\n  name        String\n  description String?\n  price       Float\n  image       String?\n  providerId  String\n  provider    ProviderProfile @relation(fields: [providerId], references: [id], onDelete: Cascade)\n  catagoryId  String?\n  category    Category?       @relation(fields: [catagoryId], references: [id])\n  createdAt   DateTime        @default(now())\n  updatedAt   DateTime        @updatedAt\n  orderItems  OrderItem[]\n  reviews     Review[]\n\n  @@map("Meal")\n}\n\nmodel Order {\n  id              String          @id @default(uuid())\n  status          OrderStatus     @default(PLACED)\n  delivaryAddress String\n  longitude       Float?\n  latitude        Float?\n  totalPrice      Float\n  providerId      String\n  provider        ProviderProfile @relation(fields: [providerId], references: [id], onDelete: Cascade)\n\n  customerId String\n\n  customer   User        @relation(fields: [customerId], references: [id], onDelete: Cascade)\n  createdAt  DateTime    @default(now())\n  updatedAt  DateTime    @updatedAt\n  orderItems OrderItem[]\n\n  @@map("Order")\n}\n\nenum OrderStatus {\n  PLACED\n  PREPARING\n  READY\n  DELIVERED\n  CANCELLED\n}\n\nmodel OrderItem {\n  id       String @id @default(uuid())\n  quantity Int\n  price    Float\n  orderId  String\n  order    Order  @relation(fields: [orderId], references: [id], onDelete: Cascade)\n  mealId   String\n  meal     Meal   @relation(fields: [mealId], references: [id], onDelete: Cascade)\n\n  @@map("OrderItem")\n}\n\nmodel Review {\n  id         String          @id @default(uuid())\n  rating     Float\n  comment    String?\n  userId     String\n  user       User            @relation(fields: [userId], references: [id], onDelete: Cascade)\n  mealId     String\n  meal       Meal            @relation(fields: [mealId], references: [id], onDelete: Cascade)\n  providerId String\n  provider   ProviderProfile @relation(fields: [providerId], references: [id], onDelete: Cascade)\n  createdAt  DateTime        @default(now())\n  updatedAt  DateTime        @updatedAt\n\n  @@map("Review")\n}\n',
  "runtimeDataModel": {
    "models": {},
    "enums": {},
    "types": {}
  }
};
config.runtimeDataModel = JSON.parse('{"models":{"User":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"emailVerified","kind":"scalar","type":"Boolean"},{"name":"image","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"role","kind":"enum","type":"Role"},{"name":"status","kind":"enum","type":"UserStatus"},{"name":"phone","kind":"scalar","type":"String"},{"name":"sessions","kind":"object","type":"Session","relationName":"SessionToUser"},{"name":"accounts","kind":"object","type":"Account","relationName":"AccountToUser"},{"name":"providerProfile","kind":"object","type":"ProviderProfile","relationName":"ProviderProfileToUser"},{"name":"orders","kind":"object","type":"Order","relationName":"OrderToUser"},{"name":"reviews","kind":"object","type":"Review","relationName":"ReviewToUser"}],"dbName":"User"},"Session":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"token","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"ipAddress","kind":"scalar","type":"String"},{"name":"userAgent","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"SessionToUser"}],"dbName":"Session"},"Account":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"accountId","kind":"scalar","type":"String"},{"name":"providerId","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"AccountToUser"},{"name":"accessToken","kind":"scalar","type":"String"},{"name":"refreshToken","kind":"scalar","type":"String"},{"name":"idToken","kind":"scalar","type":"String"},{"name":"accessTokenExpiresAt","kind":"scalar","type":"DateTime"},{"name":"refreshTokenExpiresAt","kind":"scalar","type":"DateTime"},{"name":"scope","kind":"scalar","type":"String"},{"name":"password","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"Account"},"Verification":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"identifier","kind":"scalar","type":"String"},{"name":"value","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"Verification"},"ProviderProfile":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"location","kind":"scalar","type":"String"},{"name":"longitude","kind":"scalar","type":"Float"},{"name":"latitude","kind":"scalar","type":"Float"},{"name":"description","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"ProviderProfileToUser"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"meals","kind":"object","type":"Meal","relationName":"MealToProviderProfile"},{"name":"reviews","kind":"object","type":"Review","relationName":"ProviderProfileToReview"},{"name":"orders","kind":"object","type":"Order","relationName":"OrderToProviderProfile"}],"dbName":"ProviderProfile"},"Category":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"meals","kind":"object","type":"Meal","relationName":"CategoryToMeal"}],"dbName":"Category"},"Meal":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"description","kind":"scalar","type":"String"},{"name":"price","kind":"scalar","type":"Float"},{"name":"image","kind":"scalar","type":"String"},{"name":"providerId","kind":"scalar","type":"String"},{"name":"provider","kind":"object","type":"ProviderProfile","relationName":"MealToProviderProfile"},{"name":"catagoryId","kind":"scalar","type":"String"},{"name":"category","kind":"object","type":"Category","relationName":"CategoryToMeal"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"orderItems","kind":"object","type":"OrderItem","relationName":"MealToOrderItem"},{"name":"reviews","kind":"object","type":"Review","relationName":"MealToReview"}],"dbName":"Meal"},"Order":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"status","kind":"enum","type":"OrderStatus"},{"name":"delivaryAddress","kind":"scalar","type":"String"},{"name":"longitude","kind":"scalar","type":"Float"},{"name":"latitude","kind":"scalar","type":"Float"},{"name":"totalPrice","kind":"scalar","type":"Float"},{"name":"providerId","kind":"scalar","type":"String"},{"name":"provider","kind":"object","type":"ProviderProfile","relationName":"OrderToProviderProfile"},{"name":"customerId","kind":"scalar","type":"String"},{"name":"customer","kind":"object","type":"User","relationName":"OrderToUser"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"orderItems","kind":"object","type":"OrderItem","relationName":"OrderToOrderItem"}],"dbName":"Order"},"OrderItem":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"quantity","kind":"scalar","type":"Int"},{"name":"price","kind":"scalar","type":"Float"},{"name":"orderId","kind":"scalar","type":"String"},{"name":"order","kind":"object","type":"Order","relationName":"OrderToOrderItem"},{"name":"mealId","kind":"scalar","type":"String"},{"name":"meal","kind":"object","type":"Meal","relationName":"MealToOrderItem"}],"dbName":"OrderItem"},"Review":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"rating","kind":"scalar","type":"Float"},{"name":"comment","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"ReviewToUser"},{"name":"mealId","kind":"scalar","type":"String"},{"name":"meal","kind":"object","type":"Meal","relationName":"MealToReview"},{"name":"providerId","kind":"scalar","type":"String"},{"name":"provider","kind":"object","type":"ProviderProfile","relationName":"ProviderProfileToReview"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"Review"}},"enums":{},"types":{}}');
async function decodeBase64AsWasm(wasmBase64) {
  const { Buffer: Buffer2 } = await import("buffer");
  const wasmArray = Buffer2.from(wasmBase64, "base64");
  return new WebAssembly.Module(wasmArray);
}
config.compilerWasm = {
  getRuntime: async () => await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.mjs"),
  getQueryCompilerWasmModule: async () => {
    const { wasm } = await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.wasm-base64.mjs");
    return await decodeBase64AsWasm(wasm);
  },
  importName: "./query_compiler_fast_bg.js"
};
function getPrismaClientClass() {
  return runtime.getPrismaClient(config);
}

// generated/prisma/internal/prismaNamespace.ts
var prismaNamespace_exports = {};
__export(prismaNamespace_exports, {
  AccountScalarFieldEnum: () => AccountScalarFieldEnum,
  AnyNull: () => AnyNull2,
  CategoryScalarFieldEnum: () => CategoryScalarFieldEnum,
  DbNull: () => DbNull2,
  Decimal: () => Decimal2,
  JsonNull: () => JsonNull2,
  MealScalarFieldEnum: () => MealScalarFieldEnum,
  ModelName: () => ModelName,
  NullTypes: () => NullTypes2,
  NullsOrder: () => NullsOrder,
  OrderItemScalarFieldEnum: () => OrderItemScalarFieldEnum,
  OrderScalarFieldEnum: () => OrderScalarFieldEnum,
  PrismaClientInitializationError: () => PrismaClientInitializationError2,
  PrismaClientKnownRequestError: () => PrismaClientKnownRequestError2,
  PrismaClientRustPanicError: () => PrismaClientRustPanicError2,
  PrismaClientUnknownRequestError: () => PrismaClientUnknownRequestError2,
  PrismaClientValidationError: () => PrismaClientValidationError2,
  ProviderProfileScalarFieldEnum: () => ProviderProfileScalarFieldEnum,
  QueryMode: () => QueryMode,
  ReviewScalarFieldEnum: () => ReviewScalarFieldEnum,
  SessionScalarFieldEnum: () => SessionScalarFieldEnum,
  SortOrder: () => SortOrder,
  Sql: () => Sql2,
  TransactionIsolationLevel: () => TransactionIsolationLevel,
  UserScalarFieldEnum: () => UserScalarFieldEnum,
  VerificationScalarFieldEnum: () => VerificationScalarFieldEnum,
  defineExtension: () => defineExtension,
  empty: () => empty2,
  getExtensionContext: () => getExtensionContext,
  join: () => join2,
  prismaVersion: () => prismaVersion,
  raw: () => raw2,
  sql: () => sql
});
import * as runtime2 from "@prisma/client/runtime/client";
var PrismaClientKnownRequestError2 = runtime2.PrismaClientKnownRequestError;
var PrismaClientUnknownRequestError2 = runtime2.PrismaClientUnknownRequestError;
var PrismaClientRustPanicError2 = runtime2.PrismaClientRustPanicError;
var PrismaClientInitializationError2 = runtime2.PrismaClientInitializationError;
var PrismaClientValidationError2 = runtime2.PrismaClientValidationError;
var sql = runtime2.sqltag;
var empty2 = runtime2.empty;
var join2 = runtime2.join;
var raw2 = runtime2.raw;
var Sql2 = runtime2.Sql;
var Decimal2 = runtime2.Decimal;
var getExtensionContext = runtime2.Extensions.getExtensionContext;
var prismaVersion = {
  client: "7.3.0",
  engine: "9d6ad21cbbceab97458517b147a6a09ff43aa735"
};
var NullTypes2 = {
  DbNull: runtime2.NullTypes.DbNull,
  JsonNull: runtime2.NullTypes.JsonNull,
  AnyNull: runtime2.NullTypes.AnyNull
};
var DbNull2 = runtime2.DbNull;
var JsonNull2 = runtime2.JsonNull;
var AnyNull2 = runtime2.AnyNull;
var ModelName = {
  User: "User",
  Session: "Session",
  Account: "Account",
  Verification: "Verification",
  ProviderProfile: "ProviderProfile",
  Category: "Category",
  Meal: "Meal",
  Order: "Order",
  OrderItem: "OrderItem",
  Review: "Review"
};
var TransactionIsolationLevel = runtime2.makeStrictEnum({
  ReadUncommitted: "ReadUncommitted",
  ReadCommitted: "ReadCommitted",
  RepeatableRead: "RepeatableRead",
  Serializable: "Serializable"
});
var UserScalarFieldEnum = {
  id: "id",
  name: "name",
  email: "email",
  emailVerified: "emailVerified",
  image: "image",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  role: "role",
  status: "status",
  phone: "phone"
};
var SessionScalarFieldEnum = {
  id: "id",
  expiresAt: "expiresAt",
  token: "token",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  ipAddress: "ipAddress",
  userAgent: "userAgent",
  userId: "userId"
};
var AccountScalarFieldEnum = {
  id: "id",
  accountId: "accountId",
  providerId: "providerId",
  userId: "userId",
  accessToken: "accessToken",
  refreshToken: "refreshToken",
  idToken: "idToken",
  accessTokenExpiresAt: "accessTokenExpiresAt",
  refreshTokenExpiresAt: "refreshTokenExpiresAt",
  scope: "scope",
  password: "password",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var VerificationScalarFieldEnum = {
  id: "id",
  identifier: "identifier",
  value: "value",
  expiresAt: "expiresAt",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var ProviderProfileScalarFieldEnum = {
  id: "id",
  name: "name",
  location: "location",
  longitude: "longitude",
  latitude: "latitude",
  description: "description",
  userId: "userId",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var CategoryScalarFieldEnum = {
  id: "id",
  name: "name"
};
var MealScalarFieldEnum = {
  id: "id",
  name: "name",
  description: "description",
  price: "price",
  image: "image",
  providerId: "providerId",
  catagoryId: "catagoryId",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var OrderScalarFieldEnum = {
  id: "id",
  status: "status",
  delivaryAddress: "delivaryAddress",
  longitude: "longitude",
  latitude: "latitude",
  totalPrice: "totalPrice",
  providerId: "providerId",
  customerId: "customerId",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var OrderItemScalarFieldEnum = {
  id: "id",
  quantity: "quantity",
  price: "price",
  orderId: "orderId",
  mealId: "mealId"
};
var ReviewScalarFieldEnum = {
  id: "id",
  rating: "rating",
  comment: "comment",
  userId: "userId",
  mealId: "mealId",
  providerId: "providerId",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var SortOrder = {
  asc: "asc",
  desc: "desc"
};
var QueryMode = {
  default: "default",
  insensitive: "insensitive"
};
var NullsOrder = {
  first: "first",
  last: "last"
};
var defineExtension = runtime2.Extensions.defineExtension;

// generated/prisma/enums.ts
var Role = {
  ADMIN: "ADMIN",
  USER: "USER",
  PROVIDER: "PROVIDER"
};

// generated/prisma/client.ts
globalThis["__dirname"] = path.dirname(fileURLToPath(import.meta.url));
var PrismaClient = getPrismaClientClass();

// src/config/env.ts
import dotenv from "dotenv";
dotenv.config();
var env = {
  port: process.env.PORT,
  dbUrl: process.env.DATABASE_URL,
  appUrl: process.env.APP_URL,
  smtpHost: process.env.SMTP_HOST,
  smtpUser: process.env.SMTP_USER,
  smtpPassword: process.env.SMTP_PASS,
  googleClientID: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  adminEmail: process.env.ADMIN_EMAIL,
  adminPass: process.env.ADMIN_PASS,
  serverUrl: process.env.SERVER_URL
};

// src/lib/prisma.ts
var connectionString = `${env.dbUrl}`;
var adapter = new PrismaPg({ connectionString });
var prisma = new PrismaClient({ adapter });

// src/services/mail/mail.service.ts
import path2 from "path";

// src/services/mail/transporter.ts
import nodemailer from "nodemailer";
var transporter = nodemailer.createTransport({
  host: `${env.smtpHost}`,
  port: 587,
  secure: false,
  auth: {
    user: `${env.smtpUser}`,
    pass: `${env.smtpPassword}`
  }
});

// src/services/mail/mail.service.ts
var sendEmail = async (name, email, token) => {
  const verifyUrl = `${env.appUrl}/verify-email?token=${token}`;
  const info = await transporter.sendMail({
    from: `"Food Express Auth" <auth@foodexpress.io>`,
    to: email,
    subject: "Verify your email for Food Express",
    text: `Hello ${name}, verify your email for Food Express.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">


        <h2 style="color: #111;">Welcome to Food Express</h2>
                <div style="text-align: center; margin-bottom: 20px;">
          <img
  src="cid:foodexpress-logo"
  alt="Food Express Logo"
  width="220"
  style="max-width: 220px; width: 100%; height: auto;"
/>

        </div>

        <p>Hello ${name},</p>

        <p>
          Thanks for joining <strong>Food Express</strong> \u2014 Fast, Reliable, and Delicious Food Delivered to Your Doorstep.
        </p>


        <p>Please verify your email address by clicking the button below:</p>

        <a
          href="${verifyUrl}"
          style="
            display: inline-block;
            padding: 12px 20px;
            background-color: #111;
            color: #fff;
            text-decoration: none;
            border-radius: 6px;
            margin: 16px 0;
          "
        >
          Verify Email
        </a>

        <p>If the button is not working: ${verifyUrl}</p>

        <p style="font-size: 14px; color: #555;">
          If you didn\u2019t create an account, you can safely ignore this email.
        </p>

        <hr style="margin: 30px 0;" />

        <p style="font-size: 12px; color: #999;">
          This link will expire in 15 minutes for security reasons.
        </p>
      </div>
    `,
    attachments: [
      {
        filename: "foodExpress.png",
        path: path2.join(process.cwd(), "/resources/foodExpress.png"),
        cid: "foodexpress-logo"
      }
    ]
  });
  console.log(`Email sent to: ${email}`);
  return info;
};

// src/lib/auth.ts
var auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql"
    // or "mysql", "postgresql", ...etc
  }),
  // trustedOrigins: [env.appUrl as string],
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "USER",
        required: false
      }
    }
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    requireEmailVerification: true
  },
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url, token }, request) => {
      try {
        await sendEmail(user.name, user.email, token);
      } catch (error) {
        console.error(error);
        throw error;
      }
    }
  },
  socialProviders: {
    google: {
      prompt: "select_account consent",
      accessType: "offline",
      clientId: env.googleClientID,
      clientSecret: env.googleClientSecret
    }
  },
  session: {
    //1day
    expiresIn: 60 * 60 * 60 * 24,
    updateAge: 60 * 60 * 60 * 24
  },
  advanced: {
    // disableCSRFCheck: true,
    useSecureCookies: false,
    cookies: {
      state: {
        attributes: {
          sameSite: "none",
          secure: true,
          httpOnly: true,
          path: "/"
        }
      },
      sessionToken: {
        attributes: {
          sameSite: "none",
          secure: true,
          httpOnly: true,
          path: "/"
        }
      }
    }
  }
});

// src/middleware/notFound.ts
function notFound(req, res) {
  res.status(404).json({
    success: false,
    message: "Route not found!",
    path: req.originalUrl
  });
}

// src/middleware/globalErrorHandler.ts
function errorHandler(err, req, res, next) {
  let statusCode = 500;
  let errorMessage = "Internal Server Error";
  let errorDetails = err;
  if (err instanceof prismaNamespace_exports.PrismaClientValidationError) {
    statusCode = 400;
    errorMessage = "You provide incorrect field type or missing fields!";
  } else if (err instanceof prismaNamespace_exports.PrismaClientKnownRequestError) {
    if (err.code === "P2025") {
      statusCode = 400;
      errorMessage = "An operation failed because it depends on one or more records that were required but not found.";
    } else if (err.code === "P2002") {
      statusCode = 400;
      errorMessage = "Duplicate key error";
    } else if (err.code === "P2003") {
      statusCode = 400;
      errorMessage = "Foreign key constraint failed";
    }
  } else if (err instanceof prismaNamespace_exports.PrismaClientUnknownRequestError) {
    statusCode = 500;
    errorMessage = "Error occurred during query execution";
  } else if (err instanceof prismaNamespace_exports.PrismaClientInitializationError) {
    if (err.errorCode === "P1000") {
      statusCode = 401;
      errorMessage = "Authentication failed. Please check your creditials!";
    } else if (err.errorCode === "P1001") {
      statusCode = 400;
      errorMessage = "Can't reach database server";
    }
  }
  res.status(statusCode).json({
    success: false,
    message: errorMessage,
    error: errorDetails
  });
}
var globalErrorHandler_default = errorHandler;

// src/routes/index.ts
import { Router as Router8 } from "express";

// src/modules/provider/provider.routes.ts
import { Router } from "express";

// src/modules/provider/provider.service.ts
var getProviders = async () => {
  return await prisma.providerProfile.findMany();
};
var getUserIdWithProvider = async (id) => {
  return await prisma.providerProfile.findFirstOrThrow({
    where: {
      id
    },
    select: {
      userId: true
    }
  });
};
var getProviderIdWithUserId = async (id) => {
  return await prisma.providerProfile.findFirstOrThrow({
    where: {
      userId: id
    },
    select: {
      id: true
    }
  });
};
var createProvider = async (data, userId) => {
  return await prisma.$transaction([
    prisma.providerProfile.create({
      data: {
        ...data,
        userId
      }
    }),
    prisma.user.update({
      where: {
        id: userId
      },
      data: {
        role: Role.PROVIDER
      }
    })
  ]);
};
var editProvider = async (data, providerId) => {
  return await prisma.providerProfile.update({
    where: {
      id: providerId
    },
    data
  });
};
var getProviderWithId = async (id) => {
  return await prisma.providerProfile.findUniqueOrThrow({
    where: {
      id
    }
  });
};
var deleteProvider = async (id) => {
  return await prisma.providerProfile.delete({
    where: {
      id
    }
  });
};
var getProviderIdWithOrderId = async (id) => {
  return await prisma.order.findUnique({
    where: {
      id
    },
    select: {
      providerId: true
    }
  });
};
var getProviderIdWithMealId = async (id) => {
  return await prisma.meal.findUnique({
    where: {
      id
    },
    select: {
      providerId: true
    }
  });
};
var ProviderService = {
  getProviders,
  getProviderWithId,
  createProvider,
  editProvider,
  getUserIdWithProvider,
  getProviderIdWithUserId,
  deleteProvider,
  getProviderIdWithOrderId,
  getProviderIdWithMealId
};

// src/utils/response.ts
var sendResponse = (res, status, success, message, data) => {
  return res.status(status).json({
    success,
    message,
    data
  });
};

// src/middleware/authorization.ts
var authorization = (...roles) => {
  return async (req, res, next) => {
    try {
      const session = await auth.api.getSession({
        headers: req.headers
      });
      if (!session) {
        return sendResponse(res, 401, false, "Forbidden, Session not found!");
      }
      if (!session.user.emailVerified) {
        return sendResponse(res, 403, false, "Email varification required");
      }
      req.user = {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role,
        emailVerified: session.user.emailVerified
      };
      console.log(req.user);
      if (roles.length && !roles.includes(req.user.role)) {
        return sendResponse(
          res,
          403,
          false,
          "Forbidden, You are not authorized"
        );
      }
      next();
    } catch (err) {
      next(err);
    }
  };
};
var authorization_default = authorization;

// src/modules/provider/provider.controller.ts
var getProviders2 = async (req, res, next) => {
  try {
    const data = await ProviderService.getProviders();
    return sendResponse(res, 200, true, "Provider Fetched Successfully", data);
  } catch (error) {
    next(error);
  }
};
var createProvider2 = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const data = await ProviderService.createProvider(
      req.body,
      userId
    );
    return sendResponse(res, 201, true, "Provider Created Successfully", data);
  } catch (error) {
    next(error);
  }
};
var getProviderWithId2 = async (req, res, next) => {
  try {
    const id = req.params.id;
    const data = await ProviderService.getProviderWithId(id);
    return sendResponse(res, 200, true, "Provider Fetched Successfully", data);
  } catch (error) {
    next(error);
  }
};
var editProvider2 = async (req, res, next) => {
  try {
    const id = req.params.id;
    const userId = req.user?.id;
    const owner = await ProviderService.getUserIdWithProvider(id);
    if (owner.userId !== userId && req.user?.role !== "ADMIN" /* ADMIN */) {
      return sendResponse(
        res,
        401,
        false,
        "Forbidden, You can only edit your Provider Profile"
      );
    }
    const data = await ProviderService.editProvider(req.body, id);
    return sendResponse(res, 201, true, "Provider Edited Successfully", data);
  } catch (error) {
    next(error);
  }
};
var deleteProvider2 = async (req, res, next) => {
  try {
    const id = req.params.id;
    const userId = req.user?.id;
    const owner = await ProviderService.getUserIdWithProvider(id);
    if (owner.userId !== userId && req.user?.role !== "ADMIN" /* ADMIN */) {
      return sendResponse(
        res,
        401,
        false,
        "Forbidden, You can only delete your Provider Profile"
      );
    }
    const data = await ProviderService.deleteProvider(id);
    return sendResponse(res, 200, true, "Provider Deleted Successfully", data);
  } catch (error) {
    next(error);
  }
};
var ProviderController = {
  getProviders: getProviders2,
  getProviderWithId: getProviderWithId2,
  createProvider: createProvider2,
  editProvider: editProvider2,
  deleteProvider: deleteProvider2
};

// src/modules/provider/provider.routes.ts
var router = Router();
router.get("/", ProviderController.getProviders);
router.post(
  "/",
  authorization_default("USER" /* USER */, "ADMIN" /* ADMIN */),
  ProviderController.createProvider
);
router.get("/:id", ProviderController.getProviderWithId);
router.patch(
  "/:id",
  authorization_default("PROVIDER" /* PROVIDER */, "ADMIN" /* ADMIN */),
  ProviderController.editProvider
);
router.delete(
  "/:id",
  authorization_default("PROVIDER" /* PROVIDER */, "ADMIN" /* ADMIN */),
  ProviderController.deleteProvider
);
var ProviderRouter = router;

// src/modules/user/user.route.ts
import { Router as Router2 } from "express";

// src/modules/user/user.service.ts
var getUsers = async () => {
  return await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      phone: true,
      image: true,
      createdAt: true,
      updatedAt: true,
      providerProfile: true
    }
  });
};
var getUserWithId = async (id) => {
  return await prisma.user.findUniqueOrThrow({
    where: {
      id
    }
  });
};
var updateUser = async (data, id) => {
  return await prisma.user.update({
    where: {
      id
    },
    data: {
      ...data
    }
  });
};
var updateUserStatus = async (id, status) => {
  return await prisma.user.update({
    where: {
      id
    },
    data: {
      status
    }
  });
};
var deleteUser = async (id) => {
  return await prisma.user.delete({
    where: {
      id
    }
  });
};
var UserService = {
  getUsers,
  getUserWithId,
  updateUser,
  updateUserStatus,
  deleteUser
};

// src/modules/user/user.controller.ts
var getUsers2 = async (req, res, next) => {
  try {
    const data = await UserService.getUsers();
    return sendResponse(res, 200, true, "Users Fetched Successfully", data);
  } catch (error) {
    next(error);
  }
};
var getUserWithId2 = async (req, res, next) => {
  try {
    const id = req.params.id;
    const userId = req.user?.id;
    const role = req.user?.role;
    if (role !== "ADMIN" /* ADMIN */ && id !== userId) {
      return sendResponse(
        res,
        403,
        false,
        "Forbidden, You can only view your own profile"
      );
    }
    const data = await UserService.getUserWithId(id);
    return sendResponse(res, 200, true, "User Fetched Successfully", data);
  } catch (error) {
    next(error);
  }
};
var getMe = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const data = await UserService.getUserWithId(userId);
    return sendResponse(res, 200, true, "Profile Fetched Successfully", data);
  } catch (error) {
    next(error);
  }
};
var updateUser2 = async (req, res, next) => {
  try {
    const id = req.params.id;
    const userId = req.user?.id;
    const role = req.user?.role;
    if (role !== "ADMIN" /* ADMIN */ && id !== userId) {
      return sendResponse(
        res,
        403,
        false,
        "Forbidden, You can only update your own profile"
      );
    }
    if (role === "USER" /* USER */) {
      delete req.body.role;
    }
    const data = await UserService.updateUser(req.body, id);
    return sendResponse(res, 200, true, "User Updated Successfully", data);
  } catch (error) {
    next(error);
  }
};
var updateUserStatus2 = async (req, res, next) => {
  try {
    const id = req.params.id;
    const { status } = req.body;
    const data = await UserService.updateUserStatus(id, status);
    return sendResponse(
      res,
      200,
      true,
      "User Status Updated Successfully",
      data
    );
  } catch (error) {
    next(error);
  }
};
var deleteUser2 = async (req, res, next) => {
  try {
    const id = req.params.id;
    const data = await UserService.deleteUser(id);
    return sendResponse(res, 200, true, "User Deleted Successfully", data);
  } catch (error) {
    next(error);
  }
};
var UserController = {
  getUsers: getUsers2,
  getUserWithId: getUserWithId2,
  getMe,
  updateUser: updateUser2,
  updateUserStatus: updateUserStatus2,
  deleteUser: deleteUser2
};

// src/modules/user/user.route.ts
var router2 = Router2();
router2.get("/", authorization_default("ADMIN" /* ADMIN */), UserController.getUsers);
router2.get(
  "/me",
  authorization_default("USER" /* USER */, "ADMIN" /* ADMIN */),
  UserController.getMe
);
router2.get(
  "/:id",
  authorization_default("USER" /* USER */, "ADMIN" /* ADMIN */),
  UserController.getUserWithId
);
router2.patch(
  "/:id",
  authorization_default("USER" /* USER */, "ADMIN" /* ADMIN */),
  UserController.updateUser
);
router2.patch(
  "/:id/status",
  authorization_default("ADMIN" /* ADMIN */),
  UserController.updateUserStatus
);
router2.delete("/:id", authorization_default("ADMIN" /* ADMIN */), UserController.deleteUser);
var UserRouter = router2;

// src/modules/meals/meals.route.ts
import { Router as Router3 } from "express";

// src/modules/meals/meals.service.ts
var getProviderIdWithMealId2 = async (id) => {
  return await prisma.meal.findUniqueOrThrow({
    where: {
      id
    },
    select: {
      providerId: true
    }
  });
};
var getMeals = async () => {
  return await prisma.meal.findMany({
    include: {
      provider: {
        select: {
          name: true,
          location: true,
          longitude: true,
          latitude: true
        }
      }
    }
  });
};
var getMealsById = async (id) => {
  return await prisma.meal.findFirstOrThrow({
    where: {
      id
    },
    include: {
      provider: {
        select: {
          name: true,
          location: true,
          longitude: true,
          latitude: true
        }
      }
    }
  });
};
var getReviews = async (id) => {
  return await prisma.review.findMany({
    where: {
      mealId: id
    },
    include: {
      user: {
        select: {
          name: true,
          email: true
        }
      },
      provider: {
        select: {
          name: true,
          location: true
        }
      }
    }
  });
};
var createReview = async (data, mealId, providerId, userId) => {
  return await prisma.review.create({
    data: {
      ...data,
      mealId,
      providerId,
      userId
    }
  });
};
var createMeal = async (data, providerId) => {
  return await prisma.meal.create({
    data: {
      ...data,
      providerId
    }
  });
};
var editMeal = async (data, id) => {
  return await prisma.meal.update({
    where: {
      id
    },
    data: {
      ...data
    }
  });
};
var deleteMeal = async (id) => {
  return await prisma.meal.delete({
    where: {
      id
    }
  });
};
var MealsService = {
  getMeals,
  createMeal,
  getMealsById,
  getProviderIdWithMealId: getProviderIdWithMealId2,
  editMeal,
  deleteMeal,
  getReviews,
  createReview
};

// src/modules/order/order.service.ts
var hasOrdered = async (userId, mealId) => {
  return await prisma.orderItem.findFirst({
    where: {
      mealId,
      order: {
        customerId: userId
      }
    },
    select: {
      mealId: true
    }
  });
};
var editStatus = async (data, id) => {
  return await prisma.order.update({
    where: {
      id
    },
    data: {
      status: data
    }
  });
};
var getOrders = async () => {
  return await prisma.order.findMany({
    include: {
      orderItems: true
    }
  });
};
var getOrderWithUserId = async (userID) => {
  return await prisma.order.findMany({
    where: {
      customerId: userID
    }
  });
};
var createOrder = async (data, customerId, providerId) => {
  const totalPrice = data.orderItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  return await prisma.order.create({
    data: {
      delivaryAddress: data.delivaryAddress,
      longitude: data.longitude ?? null,
      latitude: data.latitude ?? null,
      totalPrice,
      customerId,
      providerId,
      orderItems: {
        create: data.orderItems.map((item) => ({
          price: item.price,
          quantity: item.quantity,
          mealId: item.mealId
        }))
      }
    }
  });
};
var getUserIdWithOrderId = async (id) => {
  return await prisma.order.findUnique({
    where: {
      id
    },
    select: {
      customerId: true
    }
  });
};
var deleteOrder = async (id) => {
  return await prisma.order.delete({
    where: {
      id
    }
  });
};
var OrderService = {
  hasOrdered,
  getOrders,
  getOrderWithUserId,
  createOrder,
  editStatus,
  getUserIdWithOrderId,
  deleteOrder
};

// src/modules/meals/meals.controller.ts
var getMeals2 = async (req, res, next) => {
  try {
    const data = await MealsService.getMeals();
    return sendResponse(res, 200, true, "Meals fetched successfully", data);
  } catch (error) {
    next(error);
  }
};
var getMealsById2 = async (req, res, next) => {
  try {
    const data = await MealsService.getMealsById(req.params.id);
    return sendResponse(res, 200, true, "Meal fetched successfully", data);
  } catch (error) {
    next(error);
  }
};
var getReviews2 = async (req, res, next) => {
  try {
    const data = await MealsService.getReviews(req.params.id);
    return sendResponse(res, 200, true, "Reviews fetched successfully", data);
  } catch (error) {
    next(error);
  }
};
var createReview2 = async (req, res, next) => {
  try {
    const mealId = req.params.id;
    const { providerId } = await MealsService.getProviderIdWithMealId(
      mealId
    );
    const userId = req.user?.id;
    const ordered = await OrderService.hasOrdered(
      userId,
      mealId
    );
    if (!ordered || ordered.mealId !== mealId) {
      return sendResponse(
        res,
        403,
        false,
        "Forbidden, You need to order the item first",
        null
      );
    }
    const data = await MealsService.createReview(
      req.body,
      mealId,
      providerId,
      userId
    );
    return sendResponse(res, 201, true, "Reviews created successfully", data);
  } catch (error) {
    next(error);
  }
};
var createMeal2 = async (req, res, next) => {
  try {
    const providerId = await ProviderService.getProviderIdWithUserId(
      req.user?.id
    );
    if (!providerId) {
      throw new Error("ProviderId not found");
    }
    const data = await MealsService.createMeal(req.body, providerId.id);
    return sendResponse(res, 201, true, "Meals created successfully", data);
  } catch (error) {
    next(error);
  }
};
var editMeal2 = async (req, res, next) => {
  try {
    const providerId = await ProviderService.getProviderIdWithUserId(
      req.user?.id
    );
    if (!providerId) {
      throw new Error("ProviderId not found");
    }
    const ownerId = await MealsService.getProviderIdWithMealId(
      req.params.id
    );
    if (ownerId.providerId !== providerId.id && req.user?.role !== "ADMIN" /* ADMIN */) {
      return sendResponse(
        res,
        401,
        false,
        "Forbidden, You can only edit your owm meal details"
      );
    }
    const data = await MealsService.editMeal(req.body, req.params.id);
    return sendResponse(res, 201, true, "Meals Edited successfully", data);
  } catch (error) {
    next(error);
  }
};
var deleteMeal2 = async (req, res, next) => {
  try {
    const providerId = await ProviderService.getProviderIdWithUserId(
      req.user?.id
    );
    if (!providerId) {
      throw new Error("ProviderId not found");
    }
    const ownerId = await MealsService.getProviderIdWithMealId(
      req.params.id
    );
    if (ownerId.providerId !== providerId.id && req.user?.role !== "ADMIN" /* ADMIN */) {
      return sendResponse(
        res,
        401,
        false,
        "Forbidden, You can only delete your owm meal details"
      );
    }
    const data = await MealsService.deleteMeal(req.params.id);
    return sendResponse(res, 200, true, "Meals deleted successfully", data);
  } catch (error) {
    next(error);
  }
};
var MealsController = {
  getMeals: getMeals2,
  createMeal: createMeal2,
  getMealsById: getMealsById2,
  editMeal: editMeal2,
  deleteMeal: deleteMeal2,
  getReviews: getReviews2,
  createReview: createReview2
};

// src/modules/meals/meals.route.ts
var router3 = Router3();
router3.get("/", authorization_default("ADMIN" /* ADMIN */), MealsController.getMeals);
router3.post("/", authorization_default("PROVIDER" /* PROVIDER */), MealsController.createMeal);
router3.get("/:id", MealsController.getMealsById);
router3.patch(
  "/:id",
  authorization_default("PROVIDER" /* PROVIDER */, "ADMIN" /* ADMIN */),
  MealsController.editMeal
);
router3.delete(
  "/:id",
  authorization_default("PROVIDER" /* PROVIDER */, "ADMIN" /* ADMIN */),
  MealsController.deleteMeal
);
router3.get("/:id/reviews", MealsController.getReviews);
router3.post(
  "/:id/reviews",
  authorization_default("USER" /* USER */),
  MealsController.createReview
);
var MealsRoute = router3;

// src/modules/order/order.routes.ts
import { Router as Router4 } from "express";

// src/modules/order/order.controller.ts
var getOrder = async (req, res, next) => {
  try {
    if (req.user?.role === "ADMIN" /* ADMIN */) {
      const data = await OrderService.getOrders();
      return sendResponse(res, 200, true, "Order fetched successfully", data);
    } else if (req.user?.role === "USER" /* USER */) {
      const data = await OrderService.getOrderWithUserId(
        req.user?.id
      );
      return sendResponse(res, 200, true, "Order fetched successfully", data);
    } else {
      throw new Error("Role not found.");
    }
  } catch (error) {
    next(error);
  }
};
var createOrder2 = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const mealId = req.body.orderItems[0].mealId;
    const provider = await ProviderService.getProviderIdWithMealId(mealId);
    const data = await OrderService.createOrder(
      req.body,
      userId,
      provider?.providerId
    );
    return sendResponse(res, 201, true, "Order Created successfully", data);
  } catch (error) {
    next(error);
  }
};
var editStatus2 = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const provider = await ProviderService.getProviderIdWithUserId(
      userId
    );
    const owner = await ProviderService.getProviderIdWithOrderId(
      req.params.id
    );
    if (provider.id !== owner?.providerId) {
      return sendResponse(
        res,
        404,
        false,
        "Forbidden, You can only edit your own order status.",
        null
      );
    }
    const data = await OrderService.editStatus(
      req.body.status,
      req.params.id
    );
    return sendResponse(res, 201, true, "Order Created successfully", data);
  } catch (error) {
    next(error);
  }
};
var deleteOrder2 = async (req, res, next) => {
  try {
    const id = req.params.id;
    const userId = req.user?.id;
    const owner = await OrderService.getUserIdWithOrderId(id);
    if (owner?.customerId !== userId && req.user?.role !== "ADMIN" /* ADMIN */) {
      return sendResponse(
        res,
        401,
        false,
        "Forbidden, You can only cancel your own Order"
      );
    }
    const data = await OrderService.deleteOrder(id);
    return sendResponse(res, 200, true, "Order Canceled Successfully", data);
  } catch (error) {
    next(error);
  }
};
var OrderController = {
  getOrder,
  createOrder: createOrder2,
  editStatus: editStatus2,
  deleteOrder: deleteOrder2
};

// src/modules/order/order.routes.ts
var router4 = Router4();
router4.get(
  "/",
  authorization_default("ADMIN" /* ADMIN */, "USER" /* USER */),
  OrderController.getOrder
);
router4.post("/", authorization_default("USER" /* USER */), OrderController.createOrder);
router4.patch(
  "/:id",
  authorization_default("PROVIDER" /* PROVIDER */),
  OrderController.editStatus
);
router4.delete(
  "/:id",
  authorization_default("USER" /* USER */),
  OrderController.deleteOrder
);
var OrdersRoute = router4;

// src/modules/analytics/analytics.routes.ts
import { Router as Router5 } from "express";

// src/modules/analytics/analytics.service.ts
var getAnalytics = async () => {
  const now = Date.now();
  const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1e3);
  const [
    totalUsers,
    totalProviders,
    totalMeals,
    totalOrders,
    revenueAgg,
    ordersByStatus,
    dailyOrders,
    topMealsAgg,
    newUsersLast7Days,
    totalReviews,
    avgRatingAgg
  ] = await Promise.all([
    prisma.user.count(),
    prisma.providerProfile.count(),
    prisma.meal.count(),
    prisma.order.count(),
    prisma.order.aggregate({ _sum: { totalPrice: true } }),
    prisma.order.groupBy({
      by: ["status"],
      _count: { id: true }
    }),
    prisma.order.groupBy({
      by: ["createdAt"],
      _count: { id: true },
      where: {
        createdAt: { gte: sevenDaysAgo }
      }
    }),
    prisma.orderItem.groupBy({
      by: ["mealId"],
      _sum: { quantity: true },
      orderBy: {
        _sum: { quantity: "desc" }
      },
      take: 10
    }),
    prisma.user.count({
      where: {
        createdAt: { gte: sevenDaysAgo }
      }
    }),
    prisma.review.count(),
    prisma.review.aggregate({ _avg: { rating: true } })
  ]);
  const topMealIds = topMealsAgg.map((m) => m.mealId);
  const topMeals = await prisma.meal.findMany({
    where: { id: { in: topMealIds } },
    include: { provider: true }
  });
  return {
    overview: {
      totalUsers,
      totalProviders,
      totalMeals,
      totalOrders,
      totalRevenue: revenueAgg._sum.totalPrice || 0,
      totalReviews,
      avgRating: avgRatingAgg._avg.rating || 0
    },
    orders: {
      byStatus: ordersByStatus,
      dailyLast7Days: dailyOrders
    },
    users: {
      newLast7Days: newUsersLast7Days
    },
    meals: {
      topSelling: topMeals.map((m) => ({
        id: m.id,
        name: m.name,
        provider: m.provider.name
      }))
    }
  };
};
var getProviderAnalytics = async (providerId) => {
  const now = Date.now();
  const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1e3);
  const [
    totalMeals,
    totalOrders,
    revenueAgg,
    ordersByStatus,
    dailyOrders,
    topMealsAgg,
    totalReviews,
    avgRatingAgg,
    newReviews7Days,
    newOrders7Days
  ] = await Promise.all([
    prisma.meal.count({ where: { providerId } }),
    prisma.order.count({
      where: {
        orderItems: {
          some: {
            meal: { providerId }
          }
        }
      }
    }),
    prisma.orderItem.aggregate({
      _sum: { price: true },
      where: {
        meal: { providerId }
      }
    }),
    prisma.order.groupBy({
      by: ["status"],
      _count: { id: true },
      where: {
        orderItems: {
          some: {
            meal: { providerId }
          }
        }
      }
    }),
    prisma.order.groupBy({
      by: ["createdAt"],
      _count: { id: true },
      where: {
        createdAt: { gte: sevenDaysAgo },
        orderItems: {
          some: {
            meal: { providerId }
          }
        }
      }
    }),
    prisma.orderItem.groupBy({
      by: ["mealId"],
      _sum: { quantity: true },
      orderBy: {
        _sum: { quantity: "desc" }
      },
      where: {
        meal: { providerId }
      },
      take: 5
    }),
    prisma.review.count({ where: { providerId } }),
    prisma.review.aggregate({
      _avg: { rating: true },
      where: { providerId }
    }),
    prisma.review.count({
      where: {
        providerId,
        createdAt: { gte: sevenDaysAgo }
      }
    }),
    prisma.order.count({
      where: {
        createdAt: { gte: sevenDaysAgo },
        orderItems: {
          some: {
            meal: { providerId }
          }
        }
      }
    })
  ]);
  const topMealIds = topMealsAgg.map((m) => m.mealId);
  const topMeals = await prisma.meal.findMany({
    where: { id: { in: topMealIds } }
  });
  return {
    overview: {
      totalMeals,
      totalOrders,
      totalRevenue: revenueAgg._sum.price || 0,
      totalReviews,
      avgRating: avgRatingAgg._avg.rating || 0
    },
    orders: {
      byStatus: ordersByStatus,
      dailyLast7Days: dailyOrders,
      newLast7Days: newOrders7Days
    },
    meals: {
      topSelling: topMeals.map((m) => ({
        id: m.id,
        name: m.name
      }))
    },
    reviews: {
      newLast7Days: newReviews7Days
    }
  };
};
var AnalyticsService = {
  getAnalytics,
  getProviderAnalytics
};

// src/modules/analytics/analytics.controller.ts
var getAnalytics2 = async (req, res, next) => {
  try {
    const role = req.user?.role;
    if (role === "ADMIN" /* ADMIN */) {
      const data = await AnalyticsService.getAnalytics();
      return sendResponse(
        res,
        200,
        true,
        "Analytics Fetched Successfully",
        data
      );
    } else if (role === "PROVIDER" /* PROVIDER */) {
      const providerId = await ProviderService.getProviderIdWithUserId(
        req.user?.id
      );
      const data = await AnalyticsService.getProviderAnalytics(providerId.id);
      return sendResponse(
        res,
        200,
        true,
        "Analytics Fetched Successfully",
        data
      );
    }
  } catch (error) {
    next(error);
  }
};
var AnalyticsController = {
  getAnalytics: getAnalytics2
};

// src/modules/analytics/analytics.routes.ts
var router5 = Router5();
router5.get("/", authorization_default("ADMIN" /* ADMIN */, "PROVIDER" /* PROVIDER */), AnalyticsController.getAnalytics);
var AnalyticsRoute = router5;

// src/modules/category/category.routes.ts
import { Router as Router6 } from "express";

// src/modules/category/category.service.ts
var getCategories = async () => {
  return await prisma.category.findMany();
};
var getCategoryById = async (id) => {
  return await prisma.category.findUniqueOrThrow({
    where: {
      id
    }
  });
};
var createCategory = async (name) => {
  return await prisma.category.create({
    data: {
      name
    }
  });
};
var updateCategory = async (id, name) => {
  return await prisma.category.update({
    where: {
      id
    },
    data: {
      name
    }
  });
};
var deleteCategory = async (id) => {
  return await prisma.category.delete({
    where: {
      id
    }
  });
};
var CategoryService = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};

// src/modules/category/category.controller.ts
var getCategories2 = async (req, res, next) => {
  try {
    const data = await CategoryService.getCategories();
    return sendResponse(
      res,
      200,
      true,
      "Categories Fetched Successfully",
      data
    );
  } catch (error) {
    next(error);
  }
};
var getCategoryById2 = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await CategoryService.getCategoryById(id);
    return sendResponse(res, 200, true, "Category Fetched Successfully", data);
  } catch (error) {
    next(error);
  }
};
var createCategory2 = async (req, res, next) => {
  try {
    const name = req.body.name;
    const data = await CategoryService.createCategory(name);
    return sendResponse(res, 201, true, "Category Created Successfully", data);
  } catch (error) {
    next(error);
  }
};
var updateCategory2 = async (req, res, next) => {
  try {
    const data = await CategoryService.updateCategory(
      req.params.id,
      req.body.name
    );
    return sendResponse(res, 200, true, "Category Updated Successfully", data);
  } catch (error) {
    next(error);
  }
};
var deleteCategory2 = async (req, res, next) => {
  try {
    const data = await CategoryService.deleteCategory(req.params.id);
    return sendResponse(res, 200, true, "Category Deleted Successfully", data);
  } catch (error) {
    next(error);
  }
};
var CategoryController = {
  getCategories: getCategories2,
  getCategoryById: getCategoryById2,
  createCategory: createCategory2,
  updateCategory: updateCategory2,
  deleteCategory: deleteCategory2
};

// src/modules/category/category.routes.ts
var router6 = Router6();
router6.get("/", CategoryController.getCategories);
router6.get("/:id", CategoryController.getCategoryById);
router6.post("/", authorization_default("ADMIN" /* ADMIN */), CategoryController.createCategory);
router6.patch("/:id", authorization_default("ADMIN" /* ADMIN */), CategoryController.updateCategory);
router6.delete("/:id", authorization_default("ADMIN" /* ADMIN */), CategoryController.deleteCategory);
var CategoryRoutes = router6;

// src/modules/auth/auth.routes.ts
import { Router as Router7 } from "express";

// src/modules/auth/auth.service.ts
var login = async (payload) => {
  const { email, password } = payload;
  console.log(payload);
  const data = await auth.api.signInEmail({
    asResponse: true,
    body: {
      email,
      password
    }
  });
  console.log(data);
  return data;
};
var register = async (payload) => {
  const { name, email, password } = payload;
  const data = await auth.api.signUpEmail({
    asResponse: true,
    body: {
      name,
      email,
      password
    }
  });
  return data;
};
var AuthService = {
  login,
  register
};

// src/modules/auth/auth.controller.ts
var login2 = async (req, res, next) => {
  try {
    const payload = req.body;
    const data = await AuthService.login(payload);
    const cookie = data.headers.get("set-cookie");
    res.setHeader("Set-Cookie", cookie);
    return sendResponse(res, 200, true, "Login successfully", data);
  } catch (error) {
    console.log(error);
    next(error);
  }
};
var register2 = async (req, res, next) => {
  try {
    const payload = req.body;
    const data = await AuthService.register(payload);
    const cookie = data.headers.get("set-cookie");
    return sendResponse(res, 201, true, "Register successfully", data);
  } catch (error) {
    next(error);
  }
};
var AuthController = {
  login: login2,
  register: register2
};

// src/modules/auth/auth.routes.ts
var router7 = Router7();
router7.post("/register", AuthController.register);
router7.post("/login", AuthController.login);
var AuthRoutes = router7;

// src/routes/index.ts
var router8 = Router8();
router8.use("/providers", ProviderRouter);
router8.use("/user", UserRouter);
router8.use("/meals", MealsRoute);
router8.use("/orders", OrdersRoute);
router8.use("/get-analytics", AnalyticsRoute);
router8.use("/categories", CategoryRoutes);
router8.use("/auth", AuthRoutes);
var routes = router8;

// src/app.ts
var app = express();
app.use(express.json());
app.use(morgan("combined"));
app.all("/api/auth/*splat", toNodeHandler(auth));
app.use("/api/v1", routes);
app.get("/", (req, res) => {
  const date = (/* @__PURE__ */ new Date()).toISOString();
  const serverHostname = os.hostname();
  const serverUptime = os.uptime();
  const serverPlatform = os.platform();
  const clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  return res.status(200).json({
    success: true,
    message: "Welcome to Food Express",
    version: "1.0.0",
    clientDetails: {
      clientIP: clientIp,
      accessedAt: date
    },
    serverDetails: {
      hostname: serverHostname,
      platform: serverPlatform,
      uptime: `${Math.floor(serverUptime / 60 / 60)} hours ${Math.floor(
        serverUptime / 60 % 60
      )} minutes`
    }
  });
});
app.use(notFound);
app.use(globalErrorHandler_default);
var app_default = app;

// src/index.ts
var index_default = app_default;
export {
  index_default as default
};
