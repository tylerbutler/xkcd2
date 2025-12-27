# CLAUDE.md - AI Assistant Guide for xkcd2

## Project Overview

**xkcd2** is a Flask-based web application that provides an alternative presentation for [xkcd](http://xkcd.com/) comics. The project displays xkcd comics with enhanced typography and a cleaner layout. Live site: http://xkcd2.com

## Repository Structure

```
xkcd2/
├── xkcd2.py              # Main Flask application - routes and comic fetching logic
├── runserver.py          # Development server entry point
├── index.py              # WSGI entry point for mod_wsgi deployment
├── ptvs_virtualenv_proxy.py  # Azure/IIS virtualenv proxy handler
├── requirements.txt      # Python dependencies
├── templates/
│   └── base.html         # Main Jinja2 template for comic display
├── static/
│   ├── xkcd2.less        # Main LESS stylesheet
│   ├── _base_mixins.less # LESS mixins
│   ├── baseline.less     # Baseline styles
│   ├── reset.css.less    # CSS reset
│   ├── less-1.3.0.min.js # Client-side LESS compiler
│   └── foundation/       # Foundation 3.x CSS framework
├── _cache/               # HTTP response cache directory (gitignored contents)
├── web.2.7.config        # Azure deployment config for Python 2.7
├── web.3.4.config        # Azure deployment config for Python 3.4
└── web.debug.config      # Debug configuration
```

## Technology Stack

- **Backend**: Flask (Python web framework)
- **HTTP Client**: httplib2 (with built-in caching)
- **Templating**: Jinja2 (via Flask)
- **CSS Framework**: Foundation 3.x
- **CSS Preprocessor**: LESS (client-side compilation)
- **Typography**: Typogrify (smart quotes, typography enhancement)
- **Fonts**: Typekit (museo-sans, museo-slab)
- **Caching**: httplib2 disk cache + pickle-based comic data cache
- **Deployment**: Azure Web Apps (IIS with FastCGI)

## Key Files

### `xkcd2.py` (Main Application)
The core Flask application with these routes:
- `/` - Displays the current/latest comic
- `/<int:comic_id>/` - Displays a specific comic by ID
- `/random/` - Redirects to a random comic
- `/about/` - Redirects to project page

Key functions:
- `get_comic(comic_id=None)` - Fetches comic data from xkcd.com JSON API
- `typogrify(s)` - Jinja2 filter for typography enhancement

### `templates/base.html`
Single Jinja2 template that renders comics with:
- Comic title (with typogrify filter)
- Comic image (linked to original xkcd page)
- Title text (alt text) displayed below image
- Navigation buttons (Previous, Random, Next)

### Caching System
- **HTTP Cache**: `_cache/` directory for httplib2 response caching
- **Comic Cache**: `_cache/{comic_id}.xkcd` pickle files for parsed comic data

## Development Setup

### Prerequisites
- Python 2.7 or 3.x
- pip

### Installation
```bash
pip install -r requirements.txt
```

### Running Locally
```bash
python runserver.py
```
The server runs on `localhost:5555` by default. Environment variables:
- `SERVER_HOST` - Override host (default: localhost)
- `SERVER_PORT` - Override port (default: 5555)

### Debug Mode
Debug mode is enabled by default in `xkcd2.py`:
```python
app.debug = True
```

## Dependencies

From `requirements.txt`:
- `path.py` - Path manipulation library
- `flask` - Web framework
- `httplib2` - HTTP client with caching
- `typogrify-engineer>=2.0.0` - Typography enhancement for Jinja2

## Code Conventions

### Python
- UTF-8 encoding header: `# coding=utf-8`
- Exception handling for invalid comic IDs with redirect to home
- Pickle for local caching with Python 2/3 compatibility
- Unicode string handling for content

### Templates
- Foundation grid system (row/columns)
- Typogrify filter applied to user-visible text
- Client-side LESS compilation (not pre-compiled)

### Styling
- LESS variables for colors, fonts, and sizes
- Mobile-responsive design with Foundation
- Fixed header and footer on larger screens

## API Integration

The app fetches comics from xkcd's JSON API:
- Current comic: `http://xkcd.com/info.0.json`
- Specific comic: `http://xkcd.com/{id}/info.0.json`
- Random comic: `http://dynamic.xkcd.com/random/comic/` (redirect-based)

JSON response fields used:
- `safe_title` - HTML-safe title
- `img` - Comic image URL
- `alt` - Title text (hover text)
- `num` - Comic number/ID

## Deployment

### Azure Web Apps
Configuration files provided for Azure deployment:
- `web.2.7.config` / `web.3.4.config` - IIS configuration with FastCGI
- `ptvs_virtualenv_proxy.py` - Virtualenv activation for Azure

Expected Azure environment:
- Virtualenv at `D:\home\site\wwwroot\env\`
- Python at `D:\Python27\` or `D:\Python34\`
- WSGI handler: `xkcd2.app`

## Important Notes for AI Assistants

1. **Caching**: The `_cache/` directory contains cached HTTP responses and pickled comic data. Don't commit cache contents.

2. **Python 2/3 Compatibility**: The code supports both Python 2 and 3 (see pickle import and unicode handling).

3. **XSS Considerations**: Comic titles and alt text come from xkcd's API. The `safe_title` field is used, and typogrify output is marked safe in templates. Recent commits show this was an area of concern (see HTML-escaping commits).

4. **External Dependencies**: The app relies on xkcd.com's API being available. Handle API failures gracefully.

5. **Static Assets**: Foundation framework is included locally. LESS is compiled client-side, so no build step is needed.

6. **License**: MIT licensed. xkcd comics are used under CC BY-NC 2.5.

## Common Tasks

### Adding a New Route
1. Add route decorator and function in `xkcd2.py`
2. Create/modify template if needed
3. Test locally with `python runserver.py`

### Modifying Styles
1. Edit `static/xkcd2.less` or related LESS files
2. Changes are compiled client-side automatically on page load

### Debugging Cache Issues
1. Clear `_cache/` directory contents
2. Restart the development server
