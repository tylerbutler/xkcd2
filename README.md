[xkcd 2][] is a slightly different presentation of [xkcd][] comics. You can read more about why I made it
at <http://www.tylerbutler.com/2012/05/17/xkcd-2/>. The site is live at <http://xkcd2.com>.

Licensed under the MIT license.

The latest-comic JSON is revalidated on each home-page request. Numbered comics keep
their normal cache behavior. If the latest JSON returns an error, the home page shows
the last successfully loaded comic. Without a saved comic, it returns HTTP 503.
“Next” on the home page refreshes the latest comic instead of requesting an unpublished
comic number. Images load directly from the URL in the xkcd JSON.

With the application dependencies installed, run the regression tests with
`python -m unittest -v test_xkcd2`. Tests use controlled upstream responses and a
temporary cache; they do not need access to xkcd.com.

[xkcd]: http://xkcd.com/
[xkcd 2]: http://xkcd2.com/
