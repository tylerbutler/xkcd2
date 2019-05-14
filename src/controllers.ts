import { Request, Response } from "express";
import { Comic, getComic } from "./comic";

/**
 * GET /
 * Home page.
 */
export let index = async (req: Request, res: Response) => {
  res.render("base.njk", { comic: await getComic() });
};

/**
 * GET /comic/
 * Home page.
 */
export let comic = async (req: Request, res: Response) => {
  // tslint:disable-next-line: no-unsafe-any
  const comicId: number = req.params.comicId;
  const theComic = await getComic(comicId);
  res.render("base", { comic: theComic });
};

export let random = async (req: Request, res: Response) => {
  // Get latest comic to get upper bound
  const theComic = await getComic() as Comic;
  const randId = Math.floor(secureMathRandom() * theComic.num);
  res.redirect(`/comic/${randId}/`);
};

export let about = (req: Request, res: Response) => {
  res.redirect("https://tylerbutler.com/projects/xkcd2/");
};

function secureMathRandom(): number {
  return window.crypto.getRandomValues(new Uint32Array(1))[0] / 1e+10;
}
