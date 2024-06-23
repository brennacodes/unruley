function isHexColor(value) {
    // Regular expression to check for hex color format (e.g., #RRGGBB or #RGB)
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    return hexRegex.test(value);
}

function isRgbColor(value) {
    const rgbRegex = /^rgb\(\s*(\d{1,3}\s*,\s*){2}\d{1,3}\s*\)$/;
    return rgbRegex.test(value);
}

function hexToRgba(hex, opacity = 0.1) {
    hex = hex.replace(/^#/, '');

    let bigint = parseInt(hex, 16);
    let r = (bigint >> 16) & 255;
    let g = (bigint >> 8) & 255;
    let b = bigint & 255;

    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

function rgbToRgba(rgb, alpha = 0.1) {
    // Regular expression to check for rgb color format (e.g., rgb(255, 0, 0))
    const rgbRegex = /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/;
    const match = rgb.match(rgbRegex);

    if (!match) {
        throw new Error('Invalid RGB color format');
    }

    const r = match[1];
    const g = match[2];
    const b = match[3];

    // Ensure alpha is a number between 0 and 1
    if (typeof alpha !== 'number' || alpha < 0 || alpha > 1) {
        throw new Error('Alpha value must be a number between 0 and 1');
    }

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

module.exports = {
    hexToRgba,
    rgbToRgba,
    isHexColor,
    isRgbColor
};
