# Photo Gallery

Product photography & retouch portfolio — a static, responsive gallery website with an English / Ukrainian language switch.

## Stack
Plain HTML, CSS and JavaScript — no build step.

```
index.html      page markup
css/style.css   styles (responsive)
js/i18n.js      EN / UA texts
js/main.js      gallery, lightbox, language switch, animations
images/         optimized photos (thumb + full)
```

## Run locally
Open `index.html` in a browser, or serve the folder:

```
npx serve .
```

## Deploy on Vercel
Import this repository in Vercel → Framework preset: **Other** → no build command, output directory: root. Done.
