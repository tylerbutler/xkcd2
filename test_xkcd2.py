import json
import os
import tempfile
import unittest
from email.utils import formatdate
from unittest.mock import patch

import httplib2

import xkcd2


class ComicTests(unittest.TestCase):
    def setUp(self):
        directory = tempfile.TemporaryDirectory()
        self.addCleanup(directory.cleanup)
        os.mkdir(os.path.join(directory.name, '_cache'))
        cwd = os.getcwd()
        os.chdir(directory.name)
        self.addCleanup(os.chdir, cwd)
        module_file = patch.object(xkcd2, '__file__', os.path.join(directory.name, 'xkcd2.py'))
        module_file.start()
        self.addCleanup(module_file.stop)
        self.client = xkcd2.app.test_client()

    def comic_response(self, number, fromcache=False):
        response = httplib2.Response({
            'status': '200',
            'date': formatdate(usegmt=True),
            'cache-control': 'max-age=86400',
        })
        response.fromcache = fromcache
        content = json.dumps({
            'num': number,
            'safe_title': 'Comic %s' % number,
            'img': 'https://imgs.xkcd.com/comics/test.png',
            'alt': 'Test comic',
        }).encode('utf8')
        return response, content

    def error_response(self, status='404'):
        return httplib2.Response({'status': status}), b'Unavailable'

    def test_latest_revalidates_fresh_http_cache_after_publication(self):
        with patch.object(httplib2.Http, '_conn_request', side_effect=[
            self.comic_response(100), self.comic_response(101),
        ]) as upstream:
            self.assertEqual(xkcd2.get_comic()['comic_id'], 100)
            self.assertEqual(xkcd2.get_comic()['comic_id'], 101)
        self.assertEqual(upstream.call_count, 2)
        self.assertEqual(upstream.call_args.args[1], '/info.0.json')
        self.assertEqual(upstream.call_args.args[4]['cache-control'], 'no-cache')

    def test_latest_parses_http_content_instead_of_old_metadata(self):
        with patch.object(httplib2.Http, 'request', return_value=self.comic_response(100)):
            xkcd2.get_comic()
        with patch.object(httplib2.Http, 'request',
                          return_value=self.comic_response(101, fromcache=True)):
            self.assertEqual(xkcd2.get_comic()['comic_id'], 101)

    def test_latest_404_serves_last_successful_comic_then_recovers(self):
        with patch.object(httplib2.Http, '_conn_request', side_effect=[
            self.comic_response(100), self.error_response(), self.comic_response(101),
        ]):
            self.assertEqual(self.client.get('/').status_code, 200)
            fallback = self.client.get('/')
            self.assertEqual(fallback.status_code, 200)
            self.assertIn(b'Comic 100', fallback.data)
            recovered = self.client.get('/')
            self.assertEqual(recovered.status_code, 200)
            self.assertIn(b'Comic 101', recovered.data)

    def test_latest_failure_without_cached_comic_returns_503(self):
        for status in ('404', '500', '401', '503'):
            with self.subTest(status=status):
                with patch.object(httplib2.Http, '_conn_request',
                                  return_value=self.error_response(status)):
                    response = self.client.get('/')
                self.assertEqual(response.status_code, 503)
                self.assertNotIn('Location', response.headers)

    def test_numbered_404_redirects_home_without_loop(self):
        with patch.object(httplib2.Http, '_conn_request',
                          return_value=self.error_response()):
            response = self.client.get('/101/', follow_redirects=True)
        self.assertEqual(len(response.history), 1)
        self.assertEqual(response.history[0].status_code, 302)
        self.assertEqual(response.history[0].location, '/')
        self.assertEqual(response.status_code, 503)

    def test_unpublished_comic_is_requested_again_after_publication(self):
        with patch.object(httplib2.Http, '_conn_request', side_effect=[
            self.error_response(), self.comic_response(101),
        ]) as upstream:
            self.assertEqual(self.client.get('/101/').status_code, 302)
            response = self.client.get('/101/')
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'Comic 101', response.data)
        self.assertEqual(upstream.call_count, 2)

    def test_numbered_comic_keeps_http_and_metadata_cache(self):
        with patch.object(httplib2.Http, '_conn_request',
                          return_value=self.comic_response(100)) as upstream:
            first = xkcd2.get_comic(100)
            with patch.object(xkcd2.json, 'loads', side_effect=AssertionError('Cache missed')):
                self.assertEqual(xkcd2.get_comic(100), first)
        self.assertEqual(upstream.call_count, 1)
        self.assertNotIn('cache-control', upstream.call_args.args[4])

    def test_home_next_refreshes_latest_instead_of_unpublished_number(self):
        with patch.object(httplib2.Http, '_conn_request',
                          return_value=self.comic_response(100)):
            response = self.client.get('/')
        self.assertEqual(response.status_code, 200)
        self.assertNotIn(b'href="/101/"', response.data)
        self.assertIn(b'href="/" class="medium radius blue button">Next', response.data)

    def test_numbered_navigation_and_image_url_are_unchanged(self):
        with patch.object(httplib2.Http, '_conn_request',
                          return_value=self.comic_response(100)):
            response = self.client.get('/100/')
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'href="/99/"', response.data)
        self.assertIn(b'href="/101/"', response.data)
        self.assertIn(b'src="https://imgs.xkcd.com/comics/test.png"', response.data)

    def test_json_requests_use_https(self):
        for comic_id, url in (
            (None, 'https://xkcd.com/info.0.json'),
            (100, 'https://xkcd.com/100/info.0.json'),
        ):
            with self.subTest(comic_id=comic_id):
                with patch.object(httplib2.Http, 'request',
                                  return_value=self.comic_response(100)) as request:
                    xkcd2.get_comic(comic_id)
                self.assertEqual(request.call_args.args[0], url)


if __name__ == '__main__':
    unittest.main()
