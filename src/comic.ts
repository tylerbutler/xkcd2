import fetch from "node-fetch";
import { Url } from "url";

/**
 * Comic model
 */
export class Comic {
  public alt?: string;
  public day?: number;
  public img?: string;
  public link?: Url;
  public month?: number;
  public news?: string;
  public num: number;
  // tslint:disable-next-line: variable-name
  public safe_title?: string;
  public title?: string;
  public transcript?: string;
  public year?: number;

  constructor(num: number) {
    this.num = num;
  }

  public date(): string {
    return `${this.year}-${this.month}-${this.day}`;
  }
}

/**
 * Retrieves a comic with a specific ID from xkcd.com and returns relevant metadata.
 *
 * @param id - the id of the comic
 */
export async function getComic(id?: number): Promise<Comic> {
  let url: string;

  if (id !== undefined) {
    url = `https://xkcd.com/${id}/info.0.json`;
  } else {
    url = `https://xkcd.com/info.0.json`;
  }
  console.log(`url: ${url}`);

  return fetch(url)
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      return response.json() as Promise<Comic>;
    })
    .then((comic) => {
      return comic;
    });
}
