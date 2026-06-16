import express, { Application, Request, Response } from "express";
import os from "os";
import cors from "cors";
import morgan from "morgan";
import { accessLogStream } from "./middleware/logger";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import { notFound } from "./middleware/notFound";
import errorHandler from "./middleware/globalErrorHandler";
import { routes } from "./routes";
import { env } from "./config/env";

const app: Application = express();
app.use(express.json());
app.use(
  cors({
    origin: env.appUrl,
    credentials: true,
  }),
);
app.use(morgan("combined"));
app.all("/api/auth/*splat", toNodeHandler(auth));

app.use("/api/v1", routes);

app.get("/", (req: Request, res: Response) => {
  const date = new Date().toISOString();
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
      accessedAt: date,
    },
    serverDetails: {
      hostname: serverHostname,
      platform: serverPlatform,
      uptime: `${Math.floor(serverUptime / 60 / 60)} hours ${Math.floor(
        (serverUptime / 60) % 60,
      )} minutes`,
    },
  });
});

app.use(notFound);
app.use(errorHandler);

export default app;
