// src/app.ts
import express from "express";
import os from "os";
import cors from "cors";
import morgan from "morgan";
import { toNodeHandler } from "better-auth/node";

// src/lib/auth.ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

// src/lib/prisma.ts
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

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
  serverUrl: process.env.SERVER_URL,
  stripeSecretKey: process.env.STRIPE_SECRET_KEY,
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  geminiApiKey: process.env.GEMINI_API_KEY
};

// src/lib/prisma.ts
var connectionString = `${env.dbUrl}`;
var adapter = new PrismaPg({ connectionString });
var prisma = new PrismaClient({ adapter });

// src/services/mail/mail.service.ts
import path from "path";

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
        path: path.join(process.cwd(), "/resources/foodExpress.png"),
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
  trustedOrigins: [env.appUrl],
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
import { Prisma } from "@prisma/client";
function errorHandler(err, req, res, next) {
  let statusCode = 500;
  let errorMessage = "Internal Server Error";
  let errorDetails = err;
  if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    errorMessage = "You provide incorrect field type or missing fields!";
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
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
  } else if (err instanceof Prisma.PrismaClientUnknownRequestError) {
    statusCode = 500;
    errorMessage = "Error occurred during query execution";
  } else if (err instanceof Prisma.PrismaClientInitializationError) {
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
import { Router as Router10 } from "express";

// src/modules/provider/provider.routes.ts
import { Router } from "express";

// src/modules/provider/provider.service.ts
import { Role } from "@prisma/client";
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
    },
    include: {
      reviews: {
        include: {
          user: {
            select: {
              name: true,
              image: true
            }
          }
        },
        orderBy: {
          createdAt: "desc"
        },
        take: 10
      }
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
var updateProviderRating = async (providerId) => {
  const aggregateResult = await prisma.review.aggregate({
    _avg: {
      rating: true
    },
    where: {
      providerId
    }
  });
  const averageRating = aggregateResult._avg.rating ?? 5;
  await prisma.providerProfile.update({
    where: { id: providerId },
    data: { rating: averageRating }
  });
  return averageRating;
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
  getProviderIdWithMealId,
  updateProviderRating
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

// src/utils/QueryBuilder.ts
var QueryBuilder = class {
  constructor(model, queryParams, config = {}) {
    this.model = model;
    this.queryParams = queryParams;
    this.config = config;
    this.query = {
      where: {},
      include: {},
      orderBy: {},
      skip: 0,
      take: 10
    };
    this.countQuery = {
      where: {}
    };
  }
  model;
  queryParams;
  config;
  query;
  countQuery;
  page = 1;
  limit = 10;
  skip = 0;
  sortBy = "createdAt";
  sortOrder = "desc";
  selectFields;
  search() {
    const { searchTerm } = this.queryParams;
    const { searchableFields } = this.config;
    if (searchTerm && searchableFields && searchableFields.length > 0) {
      const searchConditions = searchableFields.map(
        (field) => {
          if (field.includes(".")) {
            const parts = field.split(".");
            if (parts.length === 2) {
              const [relation, nestedField] = parts;
              const stringFilter2 = {
                contains: searchTerm,
                mode: "insensitive"
              };
              return {
                [relation]: {
                  [nestedField]: stringFilter2
                }
              };
            } else if (parts.length === 3) {
              const [relation, nestedRelation, nestedField] = parts;
              const stringFilter2 = {
                contains: searchTerm,
                mode: "insensitive"
              };
              return {
                [relation]: {
                  some: {
                    [nestedRelation]: {
                      [nestedField]: stringFilter2
                    }
                  }
                }
              };
            }
          }
          const stringFilter = {
            contains: searchTerm,
            mode: "insensitive"
          };
          return {
            [field]: stringFilter
          };
        }
      );
      const whereConditions = this.query.where;
      whereConditions.OR = searchConditions;
      const countWhereConditions = this.countQuery.where;
      countWhereConditions.OR = searchConditions;
    }
    return this;
  }
  filter() {
    const { filterableFields } = this.config;
    const excludedField = [
      "searchTerm",
      "page",
      "limit",
      "sortBy",
      "sortOrder",
      "fields",
      "include"
    ];
    const filterParams = {};
    Object.keys(this.queryParams).forEach((key) => {
      if (!excludedField.includes(key)) {
        filterParams[key] = this.queryParams[key];
      }
    });
    const queryWhere = this.query.where;
    const countQueryWhere = this.countQuery.where;
    Object.keys(filterParams).forEach((key) => {
      const value = filterParams[key];
      if (value === void 0 || value === "") {
        return;
      }
      const isAllowedField = !filterableFields || filterableFields.length === 0 || filterableFields.includes(key);
      if (key.includes(".")) {
        const parts = key.split(".");
        if (filterableFields && !filterableFields.includes(key)) {
          return;
        }
        if (parts.length === 2) {
          const [relation, nestedField] = parts;
          if (!queryWhere[relation]) {
            queryWhere[relation] = {};
            countQueryWhere[relation] = {};
          }
          const queryRelation = queryWhere[relation];
          const countRelation = countQueryWhere[relation];
          queryRelation[nestedField] = this.parseFilterValue(value);
          countRelation[nestedField] = this.parseFilterValue(value);
          return;
        } else if (parts.length === 3) {
          const [relation, nestedRelation, nestedField] = parts;
          if (!queryWhere[relation]) {
            queryWhere[relation] = {
              some: {}
            };
            countQueryWhere[relation] = {
              some: {}
            };
          }
          const queryRelation = queryWhere[relation];
          const countRelation = countQueryWhere[relation];
          if (!queryRelation.some) {
            queryRelation.some = {};
          }
          if (!countRelation.some) {
            countRelation.some = {};
          }
          const querySome = queryRelation.some;
          const countSome = countRelation.some;
          if (!querySome[nestedRelation]) {
            querySome[nestedRelation] = {};
          }
          if (!countSome[nestedRelation]) {
            countSome[nestedRelation] = {};
          }
          const queryNestedRelation = querySome[nestedRelation];
          const countNestedRelation = countSome[nestedRelation];
          queryNestedRelation[nestedField] = this.parseFilterValue(value);
          countNestedRelation[nestedField] = this.parseFilterValue(value);
          return;
        }
      }
      if (!isAllowedField) {
        return;
      }
      if (typeof value === "object" && value !== null && !Array.isArray(value)) {
        queryWhere[key] = this.parseRangeFilter(
          value
        );
        countQueryWhere[key] = this.parseRangeFilter(
          value
        );
        return;
      }
      queryWhere[key] = this.parseFilterValue(value);
      countQueryWhere[key] = this.parseFilterValue(value);
    });
    return this;
  }
  paginate() {
    const page = Number(this.queryParams.page) || 1;
    const limit = Number(this.queryParams.limit) || 10;
    this.page = page;
    this.limit = limit;
    this.skip = (page - 1) * limit;
    this.query.skip = this.skip;
    this.query.take = this.limit;
    return this;
  }
  sort() {
    const sortBy = this.queryParams.sortBy || "createdAt";
    const sortOrder = this.queryParams.sortOrder === "asc" ? "asc" : "desc";
    this.sortBy = sortBy;
    this.sortOrder = sortOrder;
    if (sortBy.includes(".")) {
      const parts = sortBy.split(".");
      if (parts.length === 2) {
        const [relation, nestedField] = parts;
        this.query.orderBy = {
          [relation]: {
            [nestedField]: sortOrder
          }
        };
      } else if (parts.length === 3) {
        const [relation, nestedRelation, nestedField] = parts;
        this.query.orderBy = {
          [relation]: {
            [nestedRelation]: {
              [nestedField]: sortOrder
            }
          }
        };
      } else {
        this.query.orderBy = {
          [sortBy]: sortOrder
        };
      }
    } else {
      this.query.orderBy = {
        [sortBy]: sortOrder
      };
    }
    return this;
  }
  fields() {
    const fieldsParam = this.queryParams.fields;
    if (fieldsParam && typeof fieldsParam === "string") {
      const fieldsArray = fieldsParam?.split(",").map((field) => field.trim());
      this.selectFields = {};
      fieldsArray?.forEach((field) => {
        if (this.selectFields) {
          this.selectFields[field] = true;
        }
      });
      this.query.select = this.selectFields;
      delete this.query.include;
    }
    return this;
  }
  include(relation) {
    if (this.selectFields) {
      return this;
    }
    this.query.include = {
      ...this.query.include,
      ...relation
    };
    return this;
  }
  dynamicInclude(includeConfig, defaultInclude) {
    if (this.selectFields) {
      return this;
    }
    const result = {};
    defaultInclude?.forEach((field) => {
      if (includeConfig[field]) {
        result[field] = includeConfig[field];
      }
    });
    const includeParam = this.queryParams.include;
    if (includeParam && typeof includeParam === "string") {
      const requestedRelations = includeParam.split(",").map((relation) => relation.trim());
      requestedRelations.forEach((relation) => {
        if (includeConfig[relation]) {
          result[relation] = includeConfig[relation];
        }
      });
    }
    this.query.include = {
      ...this.query.include,
      ...result
    };
    return this;
  }
  where(condition) {
    this.query.where = this.deepMerge(
      this.query.where,
      condition
    );
    this.countQuery.where = this.deepMerge(
      this.countQuery.where,
      condition
    );
    return this;
  }
  async execute() {
    const [total, data] = await Promise.all([
      this.model.count(
        this.countQuery
      ),
      this.model.findMany(
        this.query
      )
    ]);
    const totalPages = Math.ceil(total / this.limit);
    return {
      data,
      meta: {
        page: this.page,
        limit: this.limit,
        total,
        totalPages
      }
    };
  }
  async count() {
    return await this.model.count(
      this.countQuery
    );
  }
  getQuery() {
    return this.query;
  }
  deepMerge(target, source) {
    const result = { ...target };
    for (const key in source) {
      if (source[key] && typeof source[key] === "object" && !Array.isArray(source[key])) {
        if (result[key] && typeof result[key] === "object" && !Array.isArray(result[key])) {
          result[key] = this.deepMerge(
            result[key],
            source[key]
          );
        } else {
          result[key] = source[key];
        }
      } else {
        result[key] = source[key];
      }
    }
    return result;
  }
  parseFilterValue(value) {
    if (value === "true") {
      return true;
    }
    if (value === "false") {
      return false;
    }
    if (typeof value === "string" && !isNaN(Number(value)) && value != "") {
      return Number(value);
    }
    if (Array.isArray(value)) {
      return { in: value.map((item) => this.parseFilterValue(item)) };
    }
    return value;
  }
  parseRangeFilter(value) {
    const rangeQuery = {};
    Object.keys(value).forEach((operator) => {
      const operatorValue = value[operator];
      if (operatorValue === void 0) return;
      const parsedValue = typeof operatorValue === "string" && !isNaN(Number(operatorValue)) ? Number(operatorValue) : operatorValue;
      switch (operator) {
        case "lt":
        case "lte":
        case "gt":
        case "gte":
        case "equals":
        case "not":
        case "contains":
        case "startsWith":
        case "endsWith":
          rangeQuery[operator] = parsedValue;
          break;
        case "in":
        case "notIn":
          if (Array.isArray(operatorValue)) {
            rangeQuery[operator] = operatorValue;
          } else {
            rangeQuery[operator] = [parsedValue];
          }
          break;
        default:
          break;
      }
    });
    return Object.keys(rangeQuery).length > 0 ? rangeQuery : value;
  }
};

// src/modules/provider/provider.controller.ts
var getProviders2 = async (req, res, next) => {
  try {
    const queryBuilder = new QueryBuilder(
      prisma.providerProfile,
      req.query,
      {
        searchableFields: ["name", "location", "description"],
        filterableFields: ["location"]
      }
    ).search().filter().sort().paginate();
    const data = await queryBuilder.execute();
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
var getMyProfile = async (req, res, next) => {
  try {
    const data = await ProviderService.getProviderIdWithUserId(req.user?.id);
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
  getMyProfile,
  createProvider: createProvider2,
  editProvider: editProvider2,
  deleteProvider: deleteProvider2
};

// src/modules/provider/provider.routes.ts
var router = Router();
router.get("/", ProviderController.getProviders);
router.post(
  "/",
  authorization_default("USER" /* USER */, "ADMIN" /* ADMIN */, "PROVIDER" /* PROVIDER */),
  ProviderController.createProvider
);
router.get("/me", authorization_default("PROVIDER" /* PROVIDER */), ProviderController.getMyProfile);
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
      },
      reviews: {
        include: {
          user: {
            select: {
              name: true,
              image: true
            }
          }
        },
        orderBy: {
          createdAt: "desc"
        }
      }
    }
  });
};
var getMealsByProviderId = async (providerId) => {
  return await prisma.meal.findMany({
    where: {
      providerId
    },
    include: {
      category: {
        select: {
          name: true
        }
      },
      provider: {
        select: {
          name: true,
          location: true,
          longitude: true,
          latitude: true
        }
      },
      reviews: {
        include: {
          user: {
            select: {
              name: true,
              image: true
            }
          }
        },
        orderBy: {
          createdAt: "desc"
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
      },
      reviews: {
        include: {
          user: {
            select: {
              name: true,
              image: true
            }
          }
        },
        orderBy: {
          createdAt: "desc"
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
  const result = await prisma.review.create({
    data: {
      ...data,
      mealId,
      providerId,
      userId
    }
  });
  await ProviderService.updateProviderRating(providerId);
  return result;
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
  getMealsByProviderId,
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
    },
    include: {
      provider: {
        select: {
          name: true,
          location: true
        }
      },
      orderItems: {
        include: {
          meal: {
            select: {
              name: true,
              image: true
            }
          }
        }
      },
      reviews: true
    },
    orderBy: {
      createdAt: "desc"
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
var getOrdersByProviderId = async (providerId) => {
  return await prisma.order.findMany({
    where: {
      providerId
    },
    include: {
      orderItems: {
        include: {
          meal: {
            select: {
              name: true,
              image: true
            }
          }
        }
      },
      customer: {
        select: {
          name: true,
          email: true
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });
};
var createOrderReview = async (orderId, userId, data) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      orderItems: true,
      reviews: true
    }
  });
  if (!order) {
    throw new Error("Order not found");
  }
  if (order.customerId !== userId) {
    throw new Error("Unauthorized: You do not own this order");
  }
  if (order.reviews.length > 0) {
    throw new Error("Order has already been reviewed");
  }
  const result = await prisma.$transaction(
    order.orderItems.map(
      (item) => prisma.review.create({
        data: {
          rating: data.rating,
          comment: data.comment || null,
          userId,
          mealId: item.mealId,
          providerId: order.providerId,
          orderId: order.id
        }
      })
    )
  );
  await ProviderService.updateProviderRating(order.providerId);
  return result;
};
var OrderService = {
  hasOrdered,
  getOrders,
  getOrderWithUserId,
  getOrdersByProviderId,
  createOrder,
  editStatus,
  getUserIdWithOrderId,
  deleteOrder,
  createOrderReview
};

// src/modules/meals/meals.controller.ts
var getMeals2 = async (req, res, next) => {
  try {
    const queryBuilder = new QueryBuilder(
      prisma.meal,
      req.query,
      {
        searchableFields: ["name", "description"],
        filterableFields: ["catagoryId", "providerId", "price"]
      }
    ).search().filter().sort().paginate().include({
      provider: {
        select: {
          name: true,
          location: true,
          longitude: true,
          latitude: true
        }
      },
      reviews: {
        include: {
          user: {
            select: {
              name: true,
              image: true
            }
          }
        },
        orderBy: {
          createdAt: "desc"
        }
      }
    });
    const data = await queryBuilder.execute();
    return sendResponse(res, 200, true, "Meals fetched successfully", data);
  } catch (error) {
    next(error);
  }
};
var getMealsByProviderId2 = async (req, res, next) => {
  try {
    const data = await MealsService.getMealsByProviderId(req.params.providerId);
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
    console.log(error);
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
  getMealsByProviderId: getMealsByProviderId2,
  createMeal: createMeal2,
  getMealsById: getMealsById2,
  editMeal: editMeal2,
  deleteMeal: deleteMeal2,
  getReviews: getReviews2,
  createReview: createReview2
};

// src/modules/meals/meals.route.ts
var router3 = Router3();
router3.get("/", MealsController.getMeals);
router3.post("/", authorization_default("PROVIDER" /* PROVIDER */), MealsController.createMeal);
router3.get("/provider/:providerId", MealsController.getMealsByProviderId);
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
    } else if (req.user?.role === "PROVIDER" /* PROVIDER */) {
      const provider = await ProviderService.getProviderIdWithUserId(
        req.user?.id
      );
      const data = await OrderService.getOrdersByProviderId(
        provider.id
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
var createOrderReview2 = async (req, res, next) => {
  try {
    const orderId = req.params.id;
    const userId = req.user?.id;
    const { rating, comment } = req.body;
    if (!rating || typeof rating !== "number" || rating < 1 || rating > 5) {
      return sendResponse(res, 400, false, "Rating is required and must be a number between 1 and 5", null);
    }
    const data = await OrderService.createOrderReview(orderId, userId, { rating, comment });
    return sendResponse(res, 201, true, "Reviews submitted successfully", data);
  } catch (error) {
    if (error.message.includes("Unauthorized") || error.message.includes("own this order")) {
      return sendResponse(res, 403, false, error.message, null);
    }
    if (error.message.includes("already been reviewed")) {
      return sendResponse(res, 400, false, error.message, null);
    }
    next(error);
  }
};
var OrderController = {
  getOrder,
  createOrder: createOrder2,
  editStatus: editStatus2,
  deleteOrder: deleteOrder2,
  createOrderReview: createOrderReview2
};

// src/modules/order/order.routes.ts
var router4 = Router4();
router4.get(
  "/",
  authorization_default("ADMIN" /* ADMIN */, "USER" /* USER */, "PROVIDER" /* PROVIDER */),
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
router4.post(
  "/:id/reviews",
  authorization_default("USER" /* USER */),
  OrderController.createOrderReview
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
  const { name, email, password, role } = payload;
  const data = await auth.api.signUpEmail({
    asResponse: true,
    body: {
      name,
      email,
      password,
      role: role || "USER"
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

// src/modules/payments/payments.route.ts
import { Router as Router8 } from "express";

// src/modules/payments/payments.service.ts
import Stripe from "stripe";
var stripe = new Stripe(env.stripeSecretKey || "", {
  apiVersion: "2023-10-16"
});
var PaymentsService = {
  createCheckoutSession: async (orderData, userId) => {
    const mealIds = orderData.orderItems.map((item) => item.mealId);
    const dbMeals = await prisma.meal.findMany({
      where: { id: { in: mealIds } },
      include: { provider: true }
    });
    if (dbMeals.length === 0) {
      throw new Error("No valid meals found");
    }
    const providerId = dbMeals[0].providerId;
    const secureOrderItems = orderData.orderItems.map((item) => {
      const dbMeal = dbMeals.find((m) => m.id === item.mealId);
      if (!dbMeal) throw new Error(`Meal ${item.mealId} not found`);
      return {
        mealId: item.mealId,
        quantity: item.quantity,
        price: dbMeal.price,
        name: dbMeal.name,
        image: dbMeal.image
      };
    });
    const totalPrice = secureOrderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const paymentMethod = orderData.paymentMethod === "COD" ? "COD" : "STRIPE";
    const order = await prisma.order.create({
      data: {
        delivaryAddress: orderData.delivaryAddress,
        longitude: orderData.longitude ?? null,
        latitude: orderData.latitude ?? null,
        totalPrice: totalPrice + 5,
        // Add flat $5.00 delivery fee
        customerId: userId,
        providerId,
        paymentStatus: "PENDING",
        paymentMethod,
        status: "PLACED",
        orderItems: {
          create: secureOrderItems.map((item) => ({
            price: item.price,
            quantity: item.quantity,
            mealId: item.mealId
          }))
        }
      }
    });
    if (paymentMethod === "COD") {
      return { orderId: order.id };
    }
    const lineItems = secureOrderItems.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
          images: item.image ? [item.image] : []
        },
        unit_amount: Math.round(item.price * 100)
      },
      quantity: item.quantity
    }));
    lineItems.push({
      price_data: {
        currency: "usd",
        product_data: {
          name: "Delivery Fee"
        },
        unit_amount: 500
      },
      quantity: 1
    });
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${env.appUrl}/cart/success?orderId=${order.id}`,
      cancel_url: `${env.appUrl}/cart/cancel`,
      metadata: {
        orderId: order.id,
        userId
      }
    });
    return { url: session.url || "" };
  },
  handleWebhook: async (rawBody, signature) => {
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        env.stripeWebhookSecret || ""
      );
    } catch (err) {
      console.error(`Webhook signature verification failed:`, err.message);
      throw new Error(`Webhook Error: ${err.message}`);
    }
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const orderId = session.metadata?.orderId;
      const transactionId = session.payment_intent;
      if (orderId) {
        await prisma.order.update({
          where: { id: orderId },
          data: {
            paymentStatus: "PAID",
            transactionId
          }
        });
        console.log(`Order ${orderId} successfully paid.`);
      }
    }
  }
};

// src/modules/payments/payments.controller.ts
var createCheckoutSession = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new Error("Unauthorized user session");
    }
    const result = await PaymentsService.createCheckoutSession(
      req.body,
      userId
    );
    return sendResponse(res, 201, true, "Order checkout initiated successfully", result);
  } catch (error) {
    next(error);
  }
};
var handleWebhook = async (req, res, next) => {
  try {
    const signature = req.headers["stripe-signature"];
    const rawBody = req.rawBody;
    if (!signature || !rawBody) {
      return res.status(400).send("Missing stripe signature or raw body");
    }
    await PaymentsService.handleWebhook(rawBody, signature);
    return res.status(200).json({ received: true });
  } catch (error) {
    next(error);
  }
};
var PaymentsController = {
  createCheckoutSession,
  handleWebhook
};

// src/modules/payments/payments.route.ts
var router8 = Router8();
router8.post(
  "/create-checkout-session",
  authorization_default("USER" /* USER */),
  PaymentsController.createCheckoutSession
);
router8.post("/webhook", PaymentsController.handleWebhook);
var PaymentsRoute = router8;

// src/modules/ai/ai.routes.ts
import { Router as Router9 } from "express";

// src/modules/ai/ai.service.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
var AiService = {
  rephrase: async (text, tone = "appetizing") => {
    const apiKey = env.geminiApiKey || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY not found in environment, using offline rephrase fallback.");
      return mockRephrase(text, tone);
    }
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `You are a professional copywriter for a premium food delivery service named FoodExpress. 
Your task is to rephrase the following text to sound extremely ${tone}, appealing, and high-quality.
Keep it natural, clean, and engaging.
Limit your response to a single, concise paragraph of max 250 characters. Do not include markdown formatting or quotation marks.

Original text:
${text}`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const enhancedText = response.text();
      return enhancedText.trim().replace(/^["']|["']$/g, "");
    } catch (error) {
      console.error("Gemini AI API call failed, falling back to mock rephrase:", error);
      return mockRephrase(text, tone);
    }
  }
};
function mockRephrase(text, tone) {
  const cleanText = text.trim();
  if (!cleanText) return "";
  const appetizers = [
    "Indulge in our mouth-watering",
    "Savor the exquisite flavors of our freshly prepared",
    "Treat yourself to our signature",
    "Experience pure culinary delight with our premium",
    "Enjoy the rich, authentic taste of our delicious"
  ];
  const descriptives = [
    "expertly crafted using select, farm-fresh ingredients for an unforgettable flavor experience.",
    "cooked to golden perfection and seasoned with a unique blend of aromatic spices.",
    "a chef-inspired masterpiece that is perfect for sharing or enjoying all to yourself.",
    "delivered hot and fresh, showcasing premium quality in every bite."
  ];
  const templateIdx1 = cleanText.length % appetizers.length;
  const templateIdx2 = (cleanText.length + 3) % descriptives.length;
  const prefix = appetizers[templateIdx1];
  const suffix = descriptives[templateIdx2];
  if (cleanText.includes(".") || cleanText.length > 50) {
    return `\u2728 [Enhanced] ${prefix} selection: ${cleanText} - all crafted with premium ingredients for the perfect meal experience.`;
  }
  return `${prefix} ${cleanText}, ${suffix}`;
}

// src/modules/ai/ai.controller.ts
var rephraseText = async (req, res, next) => {
  try {
    const { text, tone } = req.body;
    if (!text || typeof text !== "string") {
      return sendResponse(res, 400, false, "Text is required and must be a string", null);
    }
    const rephrased = await AiService.rephrase(text, tone);
    return sendResponse(res, 200, true, "Text rephrased successfully", { text: rephrased });
  } catch (error) {
    next(error);
  }
};
var AiController = {
  rephraseText
};

// src/modules/ai/ai.routes.ts
var router9 = Router9();
router9.post(
  "/rephrase",
  authorization_default("PROVIDER" /* PROVIDER */, "ADMIN" /* ADMIN */),
  AiController.rephraseText
);
var AiRouter = router9;

// src/routes/index.ts
var router10 = Router10();
router10.use("/providers", ProviderRouter);
router10.use("/user", UserRouter);
router10.use("/meals", MealsRoute);
router10.use("/orders", OrdersRoute);
router10.use("/analytics", AnalyticsRoute);
router10.use("/categories", CategoryRoutes);
router10.use("/payments", PaymentsRoute);
router10.use("/ai", AiRouter);
router10.use("/auth", AuthRoutes);
var routes = router10;

// src/app.ts
var app = express();
app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf;
    }
  })
);
app.use(cors({
  origin: env.appUrl,
  credentials: true
}));
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
