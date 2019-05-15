import { Request, Response } from "express";
import { Comic, getComic } from "./comic";

/**
 * GET /
 * Home page.
 */
export let index = async (req: Request, res: Response) => {
  res.render("base.njk", { comic: await getComic(), isHome: true });
};

/**
 * GET /comic/
 * Home page.
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
  // tslint:disable-next-line: insecure-random
  const rv = Math.random();
  console.log(rv);
  const randId = Math.floor(rv * theComic.num);
  res.redirect(`/comic/${randId}/`);
};

export let about = (req: Request, res: Response) => {
  res.redirect("https://tylerbutler.com/projects/xkcd2/");
};

// function secureMathRandom(): number {
//   const r = getRandomValues(new Uint8Array(1))[0];
//   const rv = r / 1e+10;
//   console.log(rv);
//   return rv;
// }
