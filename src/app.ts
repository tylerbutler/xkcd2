import compression from "compression";
import errorhandler from "errorhandler";
import express from "express";
import lusca from "lusca";
import nunjucks from "nunjucks";
import path from "path";
import { typogrify } from "typogr";
import * as controllers from "./controllers";

const viewPath = path.join(__dirname, "../templates");

// Create Express server
export const app = express();

// Express configuration
// tslint:disable-next-line: strict-boolean-expressions
app.set("port", process.env.PORT || 3000);
app.set("views", viewPath);
app.set("view engine", "nunjucks");
app.use(compression());
app.use(lusca.xframe("DENY"));
app.use(lusca.xssProtection(true));
app.use(lusca.nosniff());

// Configure nunjucks
const nunjucksEnv = nunjucks.configure(viewPath, {
  autoescape: true,
  express: app,
  watch: true,
});

nunjucksEnv.express(app);
nunjucksEnv.addFilter("typogrify", (input: string) => {
  return typogrify(input);
});

if (process.env.NODE_ENV === "development") {
  // only use in development
  app.use(errorhandler());
}

app.use(
  "/css",
  express.static(path.join(__dirname, "css")),
);
app.use(
  express.static(path.join(__dirname, "root")),
);

// Set up routes
app.get("/", controllers.index);
app.get("/comic/:comicId", controllers.comic);
app.get("/random/", controllers.random);
app.get("/about/", controllers.about);
