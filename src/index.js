const { updateSettings, updateEditorRulers } = require('./settings.js');
const {
    hexToRgba,
    rgbToRgba,
    isHexColor,
    isRgbColor
} = require('./colorUtils');
const { applyDecorations, applyDecorationsToActiveEditor } = require('./decorators');
const {
    computeRanges,
    getEffectiveMaxLineLength
} = require('./utils');

module.exports = {
    hexToRgba,
    rgbToRgba,
    isHexColor,
    isRgbColor,
    computeRanges,
    updateSettings,
    applyDecorations,
    updateEditorRulers,
    getEffectiveMaxLineLength,
    applyDecorationsToActiveEditor
};
