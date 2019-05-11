import compression from "compression";
import errorhandler from "errorhandler";
import express from "express";
import lusca from "lusca";
import path from "path";

// Load environment variables from .env file, where API keys and passwords are configured
// dotenv.config({ path: ".env.example" });

import * as controllers from "./controllers";

// Create Express server
export const app = express();

// Express configuration
// tslint:disable-next-line: strict-boolean-expressions
app.set("port", process.env.PORT || 3000);
app.set("views", path.join(__dirname, "../templates"));
app.set("view engine", "nunjucks");
app.use(compression());
app.use(lusca.xframe("DENY"));
app.use(lusca.xssProtection(true));
app.use(lusca.nosniff());

if (process.env.NODE_ENV === "development") {
  // only use in development
  app.use(errorhandler());
}

app.use(
  "/css",
  express.static(path.join(__dirname, "css")),
);
app.use(
  express.static(path.join(__dirname, "static")),
);

// Set up routes
app.get("/", controllers.index);
app.get("/comic/:comicId(\d+)/", controllers.comic);
app.get("/random/", controllers.random);
app.get("/about/", controllers.about);
