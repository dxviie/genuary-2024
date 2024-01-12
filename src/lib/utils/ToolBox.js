export function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function isMobile() {
    return navigator && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

export function generateHarmonicColors(baseHue, numberOfColors, hueShift) {
    let colors = [];
    const lightness = 50 + getRandomInt(0, 50);
    const chroma = 100 + getRandomInt(0, 130);
    for (let i = 0; i < numberOfColors; i++) {
        let hue = (baseHue + i * hueShift) % 360;
        colors.push(`lch(${lightness}% ${chroma} ${hue}deg)`);
    }
    return colors;
}