const vscode = require('vscode');
const {
  computeRanges,
  getEffectiveMaxLineLength,
  isHexColor,
  hexToRgba,
  isRgbColor,
  rgbToRgba
} = require('./index');

let decorationType;

function applyDecorationsToActiveEditor() {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
        const ranges = computeRanges(editor);

        const config = vscode.workspace.getConfiguration('unruley');
        const backgroundColor = config.get('rulerColor', '#ff0000');
        const opacity = config.get('rulerColorOpacity', 0.1);

        if (!decorationType) {
            decorationType = vscode.window.createTextEditorDecorationType({
                backgroundColor: isHexColor(backgroundColor) ? hexToRgba(backgroundColor, opacity) : rgbToRgba(backgroundColor, opacity),
                rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed
            });
        }

        editor.setDecorations(decorationType, ranges);
    }
}

function applyDecorations(editor) {
    const config = vscode.workspace.getConfiguration('unruley');
    let currentColor = config.get('rulerColor', '#ff0000');
    let opacity = config.get('rulerColorOpacity', 0.1);

    if (isHexColor(currentColor)) {
        currentColor = hexToRgba(currentColor, opacity);
    } else if (isRgbColor(currentColor)) {
        currentColor = rgbToRgba(currentColor, opacity);
    } else {
        throw new Error('Invalid color format');
    }

    const maxLineLength = getEffectiveMaxLineLength();

    if (decorationType) {
        decorationType.dispose();
    }

    decorationType = vscode.window.createTextEditorDecorationType({
        backgroundColor: currentColor,
        rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed
    });

    const ranges = [];
    for (let i = 0; i < editor.document.lineCount; i++) {
        const line = editor.document.lineAt(i);
        if (line.range.end.character < maxLineLength) {
            // If line length is less than the maxLineLength, apply decoration beyond line end
            const startPos = new vscode.Position(i, line.range.end.character);
            const endPos = new vscode.Position(i, maxLineLength);
            ranges.push(new vscode.Range(startPos, endPos));
        } else {
            // If line length is greater than or equal to maxLineLength, apply decoration beyond maxLineLength
            const startPos = new vscode.Position(i, maxLineLength);
            const endPos = new vscode.Position(i, line.range.end.character + 1); // Extend to ensure decoration applies to the end
            ranges.push(new vscode.Range(startPos, endPos));
        }
    }

    editor.setDecorations(decorationType, ranges);
}

module.exports = {
    applyDecorationsToActiveEditor,
    applyDecorations
};
