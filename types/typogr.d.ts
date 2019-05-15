export = typogr;
declare function typogr(obj: any): any;
// tslint:disable-next-line: no-namespace
declare namespace typogr {
  function amp(text: any): any;
  function caps(text: any): any;
  function initQuotes(text: any): any;
  function ord(text: any): any;
  function smartBackticks(text: any): any;
  function smartDashes(text: any): any;
  function smartEllipses(text: any): any;
  function smartEscapes(text: any): any;
  function smartQuotes(text: any): any;
  function smartypants(text: any): any;
  function tokenize(text: any): any;
  function typogrify(src: string): string;
  const version: string;
  function widont(text: any): any;
}
