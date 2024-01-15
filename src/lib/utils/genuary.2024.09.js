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
    if (emojis) {
        if (emojis.apple) {
            emojis.apple.remove();
        }
        if (emojis.google) {
            emojis.google.remove();
        }
        if (emojis.fb) {
            emojis.fb.remove();
        }
        emojis = {};
    }
    currentBrandedEmoji = null;
    loaded = false;
}

const emojiPngs = ['heart_eyes', 'dog', 'hamburger', 'hankey', 'japanese_ogre', 'joy', 'usa'];
let currentEmoji = 0;
const RESOLUTION = 32;
const EMOJI_SECONDS = 6;
let bg = null;
let ascii = null;
let emojis = {};
let loaded = false;
let currentBrandedEmoji = null;
let lastCreationTime = 0;

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
        ascii = buildAscii(paper);
        lastCreationTime = event.time;
        const selectedEmoji = emojiPngs[currentEmoji];
        currentEmoji = (currentEmoji + 1) % emojiPngs.length;
        emojis = {
            apple: loadEmoji(paper, selectedEmoji, 'apple'),
            google: loadEmoji(paper, selectedEmoji, 'google'),
            fb: loadEmoji(paper, selectedEmoji, 'fb')
        };
        emojis.apple.onLoad = () => {
            var scalingFactor = (paper.view.bounds.width*0.9)/emojis.apple.bounds.width;
            emojis.apple.scale(scalingFactor);
            emojis.apple.blendMode = 'color';
            currentBrandedEmoji = emojis.apple;
            loaded = true;
        }
        emojis.google.onLoad = () => {
            var scalingFactor = (paper.view.bounds.width*0.9)/emojis.google.bounds.width;
            emojis.google.scale(scalingFactor);
            emojis.google.blendMode = 'color';
        }
        emojis.fb.onLoad = () => {
            var scalingFactor = (paper.view.bounds.width*0.9)/emojis.fb.bounds.width;
            emojis.fb.scale(scalingFactor);
            emojis.fb.blendMode = 'color';
        }
    }

    if (ascii.columns) {
        ascii.columns.forEach((column, index) => {
            let angle = (event.time + index/3) % (Math.PI * 2);
            column.translate([0, Math.sin(angle) / (getPixelRatio() * 2)]);
        });
    }

    if (loaded && currentBrandedEmoji) {

        for (let i = 0; i < 25; i++) {
            const resolution = RESOLUTION / getPixelRatio();
            const charSize = (paper.view.bounds.width*0.9)/resolution;
            handleChar(getRandomInt(0, resolution - 1), getRandomInt(0, resolution - 1), charSize, ascii.chars, currentBrandedEmoji, paper);
        }
        let index = Math.floor((event.time - lastCreationTime) / EMOJI_SECONDS) % 3;
        if (index === 0) {
            currentBrandedEmoji = emojis.apple;
        }
        else if (index === 1) {
            currentBrandedEmoji = emojis.google;
        }
        else {
            currentBrandedEmoji = emojis.fb;
        }
    }

}

// chars for set pulled from https://www.rapidtables.com/code/text/ascii-table.html
const charset = ['.', 'º', '≈', '¿', '∞', '¢','ö', '%', 'æ', '«', '@', '≡', '░', '▒'];
const deadChar = '?';
function getChar(gray) {
    const index = Math.floor(gray * charset.length);
    const selected =  charset[index];
    return selected ? selected : deadChar;
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
function buildAscii(paper) {
    const blendMode = 'lighten';

    const charScaleFactor = 1.55;
    const resolution = RESOLUTION / getPixelRatio();
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
            redChar.content = deadChar;
            redChar.fontSize = charSize*charScaleFactor;
            redChar.fontFamily = 'courier new';
            redChar.blendMode = blendMode;
            chars[i][j][0] = redChar;
            redChar.addTo(column);

            const greenChar = new paper.PointText(new paper.Point(x + offset, y + offset * 1.5));
            greenChar.fillColor = "#00FF00";
            greenChar.content = deadChar;
            greenChar.fontSize = charSize*charScaleFactor;
            greenChar.fontFamily = 'courier new';
            greenChar.blendMode = blendMode;
            chars[i][j][1] = greenChar;
            greenChar.addTo(column);

            const blueChar = new paper.PointText(new paper.Point(x + offset, y + offset * 1.5));
            blueChar.fillColor = "#0000FF";
            blueChar.content = deadChar;
            blueChar.fontSize = charSize*charScaleFactor;
            blueChar.fontFamily = 'courier new';
            blueChar.blendMode = blendMode;
            chars[i][j][2] = blueChar;
            blueChar.addTo(column);
        }
    }

    return {
        chars: chars,
        columns: columns
    }
}

function loadEmoji(paper, name, brand) {

    let path = `/09/${name}/${brand}.png`;
    let emoji = new paper.Raster({
        source: path,
        position: paper.view.center,
        strokeColor: 'red',
        strokeWidth: 1,
        opacity: 0
    });
    return emoji;
}

// function handleOnLoad(paper, emoji, chars) {
//     var scalingFactor = (paper.view.bounds.width*0.9)/emoji.bounds.width;
//     emoji.scale(scalingFactor);
//     const resolution = RESOLUTION / getPixelRatio();
//     const charSize = (paper.view.bounds.width*0.9)/resolution;
//
//     for (let i = 0; i < resolution; i++) {
//         for (let j = 0; j < resolution; j++) {
//             handleChar(i, j, charSize, chars, emoji, paper)
//         }
//     }
//     emoji.bringToFront();
//     emoji.blendMode = 'color';
// }

function handleChar(i, j, charSize, chars, emoji, paper) {
    const x = i * charSize;
    const y = j * charSize;
    let color = emoji.getAverageColor(new paper.Rectangle(x, y, charSize, charSize));
    chars[i][j][0].fillColor = color;
    chars[i][j][1].fillColor = color;
    chars[i][j][2].fillColor = color;
    if (color) {
        chars[i][j][0].content = getChar(color.red);
        chars[i][j][1].content = getChar(color.green);
        chars[i][j][2].content = getChar(color.blue);
    }
    else {
        chars[i][j][0].content = deadChar;
        chars[i][j][1].content = deadChar;
        chars[i][j][2].content = deadChar;
    }
}