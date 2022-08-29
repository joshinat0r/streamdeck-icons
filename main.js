import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import async from 'async';
import { globby } from 'globby';
import colors from 'tailwindcss/colors.js'

const TAILWIND_TINTS = [300, 800] // TailwindCSS color tints for light and dark (the bg-red-300 stuff)
const BACKGROUND_SIZE = 72 // size of the background, 72x72 is what Elgato recommends
const ICON_SIZE = 50 // size of the icon, will be centered on the background
const WHITELIST = [] // leave empty to generate all colors, fill to only generate those colors

try {
  await fs.mkdir('./output') 
} catch (error) {

}

await createSet('_black-on-white', '#ffffff', '#000000')
await createSet('_white-on-black', '#000000', '#ffffff')

Object.keys(colors).forEach((colorName) => {
  if (['lightBlue', 'warmGray', 'trueGray', 'coolGray', 'blueGray'].includes(colorName)) {
    // deprecated & renamed
    return;
  }

  if (typeof colors[colorName] == "string") {
    // inherit, transparent and stuff
    return;
  }

  if (WHITELIST.length != 0 && !WHITELIST.includes(colorName)) {
    return;
  }

  const colorSet = [{
    hex: colors[colorName][TAILWIND_TINTS[0]],
    text: 'light'
  }, {
    hex: colors[colorName][TAILWIND_TINTS[1]],
    text: 'dark'
  }, {
    hex: '#ffffff',
    text: 'white'
  }, {
    hex: '#000000',
    text: 'black'
  }]

  async.forEach(colorSet, async (iconColor) => {
    async.forEach(colorSet, async (backgroundColor) => {
      if ((backgroundColor.hex == iconColor.hex) || (backgroundColor.hex == '#ffffff' && iconColor.hex == '#000000') || (backgroundColor.hex == '#000000' && iconColor.hex == '#ffffff')) {
        // no BoW, WoB, BoB or WoW
        return;
      }

      await createSet(`${colorName}_${iconColor.text}-on-${backgroundColor.text}`, backgroundColor.hex, iconColor.hex)
    })
  })
})











async function createSet(folder, bgColor, iconColor) {
  const outputFolder = `./output/${folder}`
  
  try {
    await fs.mkdir(outputFolder) 
  } catch (error) {

  }

  console.info(`${outputFolder} starting`);

  const svgs = await globby(['**/*.svg'])
  async.forEachLimit(svgs, 20, async (svg) => {
    const filename = path.basename(svg, '.svg')
    await generateIcon(`${outputFolder}/${filename}.jpg`, svg, bgColor, iconColor)
  }, () => {
    console.info(`${outputFolder} done`);
  })
}

async function generateIcon(outputPath, iconPath, bgColor, iconColor) {
  // because thats easier than using sharps modulate to create hue-rotate & co from hex-codes
  const iconString = await fs.readFile(iconPath, { encoding: 'utf8' })
  const newIconString = iconString.replaceAll('<path ', `<path stroke="${iconColor}" fill="${iconColor}" `)
  const iconBuffer = Buffer.from(newIconString, 'utf8')

  try {
    const icon = await sharp(iconBuffer)
    .resize({
      height: ICON_SIZE,
      width: ICON_SIZE,
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .toBuffer()

    await sharp({
      create: {
        width: BACKGROUND_SIZE,
        height: BACKGROUND_SIZE,
        channels: 4,
        background: bgColor
      }
    })
      .png()
      .composite([{
        input: icon,
        gravity: 'center'
      }])
      .toFile(outputPath)
  } catch (error) {
    console.info(`couldn't read ${iconPath}`, newIconString);
  }

}