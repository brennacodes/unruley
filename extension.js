const vscode = require('vscode');
const {
    updateSettings,
    updateEditorRulers,
    applyDecorations,
    applyDecorationsToActiveEditor
} = require('./src/index');

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


function deactivate() {}

module.exports = {
    activate,
    deactivate
};
