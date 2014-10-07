# coding=utf-8
import httplib2
import html5lib
import re
from flask import Flask, render_template, redirect, url_for
from path import path
from typogrify import filters as jinja2_filters

try:
    import cPickle as pickle
except ImportError:
    import pickle

__author__ = 'tyler@tylerbutler.com'

app = Flask(__name__)
app.debug = True


class InvalidComicException(Exception):
    pass


@app.route('/')
def home():
    """Retrieves the current comic on the xkcd.com homepage and displays it on xkcd2.com."""
    return render_template('base.html', **get_comic())


@app.route('/<int:comic_id>/')
def comic(comic_id):
    """"
    Retrieves the comic specified by comic_id from xkcd.com and displays it on xkcd2.com.

    If the comic is not found, redirects to the home page.
    """
    try:
        return render_template('base.html', **get_comic(comic_id))
    except InvalidComicException:
        return redirect(url_for('home'))


_regex = re.compile(r'^http://(?P<domain>.*)/(?P<comic>.*)/$')


@app.route('/random/')
def random():
    """Loads a random comic from xkcd.com."""
    h = httplib2.Http('_cache')
    resp, content = h.request('http://dynamic.xkcd.com/random/comic/', 'GET')
    url = resp['content-location']
    comic_id = re.match(_regex, url).group('comic')
    return redirect(url_for('comic', comic_id=comic_id))


@app.route('/about/')
def about():
    return redirect('http://tylerbutler.com/projects/xkcd2/')


def get_comic(comic_id=None):
    """Retrieves a comic with a specific ID from xkcd.com and returns relevant metadata."""
    if comic_id is not None:
        url = 'http://xkcd.com/%s/' % comic_id
    else:
        url = 'http://xkcd.com/'

    # get the comic page using httplib2, which handles most of the caching for us <3
    h = httplib2.Http('_cache')
    resp, content = h.request(url, 'GET')

    if resp['status'] in ('404', '500', '401'):
        raise InvalidComicException('Invalid comic id %s' % comic_id)

    content = unicode(content, encoding='utf8')

    cache_file = path(__file__).dirname() / ('_cache/%s.xkcd' % comic_id)

    if resp.fromcache and cache_file.exists():  # check if httplib2 loaded the page from its own cache
        with open(cache_file, mode='rb') as f:
            cache = pickle.load(f)
    else:
        parser = html5lib.HTMLParser(tree=html5lib.treebuilders.getTreeBuilder('dom'))
        doc = parser.parse(content.strip())

        comic_title_div = [div for div in doc.getElementsByTagName('div') if div.getAttribute('id') == 'ctitle'][0]
        comic_title = comic_title_div.firstChild.nodeValue

        comic_div = [div for div in doc.getElementsByTagName('div') if div.getAttribute('id') == 'comic'][0]
        comic_img = comic_div.getElementsByTagName('img')[0]
        comic_src = comic_img.getAttribute('src')
        comic_img_title = comic_img.getAttribute('title')

        # parse out the comic_id if we need to...
        if comic_id is None:
            prev_button_a = [a for a in doc.getElementsByTagName('a') if
                             a.getAttribute('rel') == 'prev'][0]
            prev_id = int(prev_button_a.getAttribute('href')[1:-1])  # trim the slashes
            comic_id = prev_id + 1

        cache = {
            'comic_title': comic_title,
            'comic_src': comic_src,
            'comic_img_title': comic_img_title,
            'comic_id': comic_id,
        }

        with open(cache_file, mode='wb') as f:
            pickle.dump(cache, f)

    return cache


@app.template_filter()
def typogrify(s):
    return jinja2_filters.typogrify(s)


if __name__ == "__main__":
    app.run()
