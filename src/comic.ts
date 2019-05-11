import axios from "axios";
import { deserialize } from "class-transformer";
import { Url } from "url";
// import { comic as comicController } from "./controllers";

// tslint:disable-next-line: interface-name
// export interface Comic {
//   alt: string;
//   day: number;
//   img: string;
//   link: Url;
//   month: number;
//   news: string;
//   num: number;
//   safe_title: string;
//   title: string;
//   transcript: string;
//   year: number;
// }

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

  get id(): number {
    return this.num;
  }

  constructor(num: number) {
    this.num = num;
  }
}

/**
 * Retrieves a comic with a specific ID from xkcd.com and returns relevant metadata.
 *
 * @param id - the id of the comic
 */
export async function getComic(id?: number): Promise<Comic> {
  const url = `http://xkcd.com/${id !== undefined ? id : "/"}info.0.json`;
  console.log(`url: ${url}`);

  // tslint:disable-next-line: no-floating-promises
  return axios.get(url)
    .then((response) => {
      console.log(response);
      return deserialize<Comic>(Comic, response.data as string);
    });
  // .catch((error) => {
  //   console.log(error);
  // })
  // .finally(() => {
  //   console.log("exiting");
  // });

  // request(
  //   {
  //     gzip: true,
  //     // json: true,
  //     method: "GET",
  //     uri: url,
  //   },
  //   (error, response, body) => {
  //     if (response.statusCode === 200) {
  //       return deserialize<Comic>(Comic, body as string);
  //       // return JSON.parse(body as string) as Comic;
  //     } else {
  //       console.log(`error: ${response.statusCode}`);
  //       console.log(body);
  //       // const comic: Comic = { num: 0 };
  //       return new Comic(0);
  //     }
  //   },
  // );
}

// export function getUser(id: number): Comic {
//   // tslint:disable-next-line: no-floating-promises
//   axios.get('/user?ID=12345')
//     .then((response) => {
//       // handle success
//       console.log(response);
//     });
// }
