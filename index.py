# coding=utf-8
import sys
from path import Path

# Ensure the directory containing xkcd2.py is on the python path
sys.path.insert(0, str(Path(__file__).dirname()))

# import the Flask app so mod_wsgi can run it
from xkcd2 import app as application
