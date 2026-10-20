# My personal website code
It contains a couple of photos of me, Yasser in a couple of lines, and some ways to reach me.

Live at https://yasser-dlewati.github.io/me/

## Running it locally
It's a static site with no build step. Serve the folder with any static server, for example:

```
npx serve .
```

Opening `index.html` straight from disk won't work, because the scripts are ES modules.

## What's inside
- `index.html`: the single page, with stacked sections that scroll one at a time (`js/sectionScroll.js`).
- `privacy.html`: what the site collects and where it goes, in English and Arabic.
- `js/`: one module per feature (clients carousel, services, trait chips, feedback, translations).
- `css/main.css`: all the site styles, with light and dark themes.
- `sw.js`: a service worker that caches the images for faster repeat visits.

## Notes
- The clients carousel is a custom one, built from the ground up.
- English and Arabic (right to left) are supported, with optional settings saved in the browser.
- Feedback is saved to a Google Form after the visitor agrees, with EmailJS as a fallback if sending fails. Screenshots go to Cloudinary.
- Sessions are booked through an embedded Google Calendar appointment schedule (with a Google Meet link).
- The original template can be found at https://www.free-css.com/free-css-templates/page289/ben-resume
