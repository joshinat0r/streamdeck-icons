import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import async from 'async';
import { globby } from 'globby';
import colors from 'tailwindcss/colors.js'

try {
  await fs.mkdir('./output') 
} catch (error) {

}

await createSet('boring_black-on-white', '#ffffff', '#000000')
await createSet('boring_white-on-black', '#000000', '#ffffff')

Object.keys(colors).forEach((colorName) => {
  if (['lightBlue', 'warmGray', 'trueGray', 'coolGray', 'blueGray'].includes(colorName)) {
    // deprecated & renamed
    return;
  }

  if (typeof colors[colorName] == "string") {
    // inherit, transparent and stuff
    return;
  }

  const tailwindTones = [800, 300]
  const iconColors = [{
    hex: colors[colorName][tailwindTones[0]],
    text: tailwindTones[0]
  }, {
    hex: colors[colorName][tailwindTones[1]],
    text: tailwindTones[1]
  }, {
    hex: '#ffffff',
    text: 'white'
  }, {
    hex: '#000000',
    text: 'black'
  }]

  async.forEach(iconColors, async (iconColor) => {
    async.forEach(iconColors, async (backgroundColor) => {
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
      height: 50,
      width: 50,
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .toBuffer()

    await sharp({
      create: {
        width: 72,
        height: 72,
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