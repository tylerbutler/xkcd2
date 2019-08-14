import { Request, Response } from "express";
import { Comic, getComic } from "./comic";
// tslint:disable-next-line: no-var-requires no-require-imports
// const handler = require("serverless-express/handler");

/**
 * GET /
 * Home page; loads the most recent comic
 */
export let index = async (req: Request, res: Response) => {
  res.render("base.njk", { comic: await getComic(), ishome: true });
};

/**
 * GET /comic/
 * Loads a comic by its ID.
 */
export let comic = async (req: Request, res: Response) => {
  // tslint:disable-next-line: no-unsafe-any
  const comicId: number = req.params.comicId;
  let theComic: Comic;
  try {
    theComic = await getComic(comicId);
    res.render("base.njk", { comic: theComic });
  } catch (e) {
    res.redirect("/");
  }
};

export let random = async (req: Request, res: Response) => {
  // Get latest comic to get upper bound
  const theComic = await getComic();
  // I don't think a cryptographically sound RNG is needed for this
  // tslint:disable-next-line: insecure-random
  const rv = Math.random();
  const randId = Math.floor(rv * theComic.num);
  res.redirect(`/comic/${randId}/`);
};

export let about = (req: Request, res: Response) => {
  res.redirect("https://tylerbutler.com/projects/xkcd2/");
};
