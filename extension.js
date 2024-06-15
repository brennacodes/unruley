const vscode = require('vscode');
let decorationType;

function activate(context) {
    console.log('Righteous! You\'re officially "unruley"!');

    let disposable = vscode.commands.registerCommand('unruley.rulerColor', async () => {
        await updateSettings();
        applyDecorationsToActiveEditor();
    });

    let disposableUnruleyCommand = vscode.commands.registerCommand('extension.unruleyCommand', async () => {
        await vscode.commands.executeCommand('workbench.action.openSettings', 'unruley');
    });

    context.subscriptions.push(disposable);
    context.subscriptions.push(disposableUnruleyCommand);

    vscode.workspace.onDidChangeConfiguration(event => {
        if (event.affectsConfiguration('unruley.rulerColor') || event.affectsConfiguration('unruley.ruler') || event.affectsConfiguration('unruley.rulerColorOpacity')) {
            updateEditorRulers();
            applyDecorationsToActiveEditor();
        }
    });

    vscode.window.onDidChangeVisibleTextEditors(editors => {
        editors.forEach(editor => applyDecorations(editor));
    });

    vscode.workspace.onDidChangeTextDocument(event => {
        const editor = vscode.window.activeTextEditor;
        if (editor && event.document === editor.document) {
            applyDecorations(editor);
        }
    });

    vscode.window.onDidChangeTextEditorVisibleRanges(event => {
        applyDecorations(event.textEditor);
    });

    updateSettings().then(() => {
        updateEditorRulers();
        applyDecorationsToActiveEditor();
    });
}

async function updateSettings() {
    const config = vscode.workspace.getConfiguration('unruley');
    const defaultBackgroundColor = '#ff0000';
    const defaultMaxLineLength = 80;
    const defaultOpacity = 0.1;

    const backgroundColor = config.get('rulerColor', defaultBackgroundColor);
    const maxLineLength = config.get('ruler', defaultMaxLineLength);
    const opacity = config.get('rulerColorOpacity', defaultOpacity);

    // Check if the values are undefined and apply defaults if necessary
    if (!backgroundColor || !maxLineLength || !opacity) {
        await config.update('rulerColor', defaultBackgroundColor, vscode.ConfigurationTarget.Global);
        await config.update('ruler', defaultMaxLineLength, vscode.ConfigurationTarget.Global);
        await config.update('rulerColorOpacity', defaultOpacity, vscode.ConfigurationTarget.Global);
    } else {
        console.log('Custom settings already exist');
    }
}

async function updateEditorRulers() {
    const config = vscode.workspace.getConfiguration('unruley');
    const maxLineLength = config.get('ruler', 80);

    const editorConfig = vscode.workspace.getConfiguration('editor');
    let rulers = editorConfig.get('rulers', []);

    // Replace the existing max line length or add it if not present
    rulers = [maxLineLength];

    await editorConfig.update('rulers', rulers, vscode.ConfigurationTarget.Global);
}

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

function getEffectiveMaxLineLength() {
    const editorConfig = vscode.workspace.getConfiguration('editor');
    const rulers = editorConfig.get('rulers', []);
    return rulers.length > 0 ? Math.min(...rulers) : 80; // Default to 80 if no ruler is set
}

function deactivate() {}

module.exports = {
    activate,
    deactivate,
    applyDecorationsToActiveEditor,
    updateSettings,
    updateEditorRulers,
    hexToRgba,
    rgbToRgba,
    isHexColor,
    isRgbColor,
    getEffectiveMaxLineLength
};
