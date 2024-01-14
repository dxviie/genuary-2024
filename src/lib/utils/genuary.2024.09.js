import {getPixelRatio, getRandomInt} from "$lib/utils/ToolBox.js";

export function clearAscii() {
    if (bg) {
        bg.remove();
        bg = null;
    }
    if (ascii) {
        if (ascii.chars) {
            ascii.chars.forEach((row) => {
                row.forEach((col) => {
                    col.forEach((char) => {
                        char.remove();
                    })
                })
            });
        }
        if (ascii.emoji) {
            ascii.emoji.remove();
        }
        ascii = null;
    }
}

const emojiPngs = ['dog', 'hamburger', 'hankey', 'heart_eyes', 'japanese_ogre', 'joy', 'usa'];
const brands = ['apple', 'google', 'fb'];
let bg = null;
let ascii = null;

// emoji pngs found at https://emoji.aranja.com/
export function drawAscii(paper, event, debug) {
    if (!bg) {
        bg = new paper.Path.Rectangle({
            point: paper.view.bounds.topLeft,
            size: paper.view.bounds.size,
            strokeColor: 'black',
            fillColor: 'black'
        })
    }

    if (!ascii) {
        ascii = buildAscii(paper, emojiPngs[getRandomInt(0, emojiPngs.length - 1)]);
    }

    if (ascii.columns) {
        ascii.columns.forEach((column, index) => {
            // animate up and down like a slow sine wave
            column.translate([0, Math.sin(event.time + index/3) * 2]);
        });
    }

}

// chars for set pulled from https://www.rapidtables.com/code/text/ascii-table.html
const charset = ['.', 'º', '≈', '¿', '∞', '¢','ö', '%', 'æ', '«', '@', '≡', '░', '▒'];
function getChar(gray) {
    const index = Math.round(gray * charset.length);
    return charset[index];
}

/*
PAPERJS BLEND MODES
'normal', 'multiply', 'screen', 'overlay', 'soft-light', 'hard- light',
'color-dodge', 'color-burn', 'darken', 'lighten', 'difference',
'exclusion', 'hue', 'saturation', 'luminosity', 'color', 'add',
'subtract', 'average', 'pin-light', 'negation', 'source-over',
'source-in', 'source-out', 'source-atop', 'destination-over',
'destination-in', 'destination-out', 'destination-atop', 'lighter',
'darker', 'copy', 'xor'
 */
function buildAscii(paper, emojiName) {
    const blendMode = 'luminosity';

    const charScaleFactor = 1.55;
    const resolution = 32 / getPixelRatio();
    const charSize = (paper.view.bounds.width*0.9)/resolution;
    const offset = (paper.view.bounds.width*0.1)/2;
    let chars = [];
    let columns = [];

    for (let i = 0; i < resolution; i++) {
        chars[i] = [];
        let column = new paper.Group();
        columns[i] = column;
        for (let j = 0; j < resolution; j++) {
            chars[i][j] = [];
            const x = i * charSize;
            const y = j * charSize;

            const redChar = new paper.PointText(new paper.Point(x + offset, y + offset * 1.5));
            redChar.fillColor = "#FF0000";
            redChar.content = '·';
            redChar.fontSize = charSize*charScaleFactor;
            redChar.fontFamily = 'courier new';
            redChar.blendMode = blendMode;
            chars[i][j][0] = redChar;
            redChar.addTo(column);

            const greenChar = new paper.PointText(new paper.Point(x + offset, y + offset * 1.5));
            greenChar.fillColor = "#00FF00";
            greenChar.content = '·';
            greenChar.fontSize = charSize*charScaleFactor;
            greenChar.fontFamily = 'courier new';
            greenChar.blendMode = blendMode;
            chars[i][j][1] = greenChar;
            greenChar.addTo(column);

            const blueChar = new paper.PointText(new paper.Point(x + offset, y + offset * 1.5));
            blueChar.fillColor = "#0000FF";
            blueChar.content = '·';
            blueChar.fontSize = charSize*charScaleFactor;
            blueChar.fontFamily = 'courier new';
            blueChar.blendMode = blendMode;
            chars[i][j][2] = blueChar;
            blueChar.addTo(column);
        }
    }

    let path = `/09/${emojiName}/${brands[getRandomInt(0, brands.length - 1)]}.png`;
    console.log(path);
    let emoji = new paper.Raster({
        source: path,
        position: paper.view.center,
        strokeColor: 'red',
        strokeWidth: 1,
        opacity: 0
    });
    emoji.onLoad = function () {
        var scalingFactor = (paper.view.bounds.width*0.9)/emoji.bounds.width;
        emoji.scale(scalingFactor);

        for (let i = 0; i < resolution; i++) {
            for (let j = 0; j < resolution; j++) {
                const x = i * charSize;
                const y = j * charSize;
                let color = emoji.getAverageColor(new paper.Rectangle(x, y, charSize, charSize));
                if (color) {
                    chars[i][j][0].content = getChar(color.red);
                    chars[i][j][1].content = getChar(color.green);
                    chars[i][j][2].content = getChar(color.blue);
                }
                else {
                    chars[i][j][0].content = '·';
                    chars[i][j][1].content = '·';
                    chars[i][j][2].content = '·';
                }
            }
        }
        emoji.opacity=1;
        emoji.scale(1.1);
        emoji.bringToFront();
        emoji.blendMode = 'color';
    }

    return {
        chars: chars,
        emoji: emoji,
        columns: columns
    }
}