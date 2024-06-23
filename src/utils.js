const vscode = require('vscode');

function computeRanges(editor) {
    const maxLineLength = getEffectiveMaxLineLength();
    const ranges = [];
    for (let i = 0; i < editor.document.lineCount; i++) {
        const line = editor.document.lineAt(i);
        if (line.range.end.character < maxLineLength) {
            const startPos = new vscode.Position(i, line.range.end.character);
            const endPos = new vscode.Position(i, maxLineLength);
            ranges.push(new vscode.Range(startPos, endPos));
        } else {
            const startPos = new vscode.Position(i, maxLineLength);
            const endPos = new vscode.Position(i, line.range.end.character + 1); // Extend to ensure decoration applies to the end
            ranges.push(new vscode.Range(startPos, endPos));
        }
    }
    return ranges;
}

function getEffectiveMaxLineLength() {
    const editorConfig = vscode.workspace.getConfiguration('editor');
    const rulers = editorConfig.get('rulers', []);
    return rulers.length > 0 ? Math.min(...rulers) : 80; // Default to 80 if no ruler is set
}

module.exports = {
    computeRanges,
    getEffectiveMaxLineLength
};
