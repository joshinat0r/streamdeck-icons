# Streamdeck Icons

This is a small script that takes some .svgs and generates color variations using the TailwindCSS color palette.

## Usage

Clone the repo
```
git clone https://github.com/joshinat0r/streamdeck-icons && cd streamdeck-icons
```

Install dependencies
```
npm install
```

Build all the icons
```
npm run build
```

### Warning
**This script generates 400.000 (or 1.4GB worth of) icons**  
This script takes a while and will utilitze all CPU cores.

Fontawesome has 2000 free icons and Tailwind has 22 different default color palettes.  
Each palette has 10 color variations
- `light-on-dark`
- `light-on-black`
- `light-on-white`
- `dark-on-light`
- `dark-on-black`
- `dark-on-white`
- `black-on-light`
- `black-on-dark`
- `white-on-light`
- `white-on-dark`

### Options

`main.js` has some variables at the top to adjust the tailwind tins and icon sizes.

| var | default | description |
| --- | --- | --- |
| TAILWIND_TINTS | [300, 800] | Tint for the tailwind palettes |
| BACKGROUND_SIZE | 72 | Size of the background, 72 is the Elgato recommendation |
| ICON_SIZE | 50 | Size of the Fontawesome icon on the background |
| WHITELIST | [] | Whitelist for colors, if empty this script will generate all colors, if filled with e.g. 'red' it'll only generate red |


## Credits
- [Fontawesome](https://fontawesome.com/) for the icons
- [TailwindCSS](tailwindcss.com/) for the colors
- [Sharp](https://github.com/lovell/sharp) for a hassle free [libvips](https://github.com/libvips/libvips) package