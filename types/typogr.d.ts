export = typogr;
declare function typogr(obj: string): string;
// tslint:disable-next-line: no-namespace
declare namespace typogr {
  function amp(text: string): string;
  function caps(text: string): string;
  function initQuotes(text: string): string;
  function ord(text: string): string;
  function smartBackticks(text: string): string;
  function smartDashes(text: string): string;
  function smartEllipses(text: string): string;
  function smartEscapes(text: string): string;
  function smartQuotes(text: string): string;
  function smartypants(text: string): string;
  function tokenize(text: string): string;
  function typogrify(src: string): string;
  const version: string;
  function widont(text: string): string;
}
