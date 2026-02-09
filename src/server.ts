import app from "./app";
import { env } from "./config/env";
import { db } from "./database/db";
import { seedAdmin } from "./scripts/seedAdmin";

const server = async () => {
  try {
    await db.connectDB();
    app.listen(env.port, () => {
      console.log(`Server is Running at: http://localhost:${env.port}`);
    });
    seedAdmin();
  } catch (error) {
    console.log(error);
    await db.disConnectDB();
  }
};

server();
