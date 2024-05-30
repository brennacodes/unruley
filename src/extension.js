const vscode = require('vscode');

function activate(context) {
    const disposable = vscode.commands.registerCommand('extension.changeBackgroundColor', () => {
        vscode.workspace.onDidChangeTextEditorVisibleRanges(event => {
            const editor = event.textEditor;
            const decorationType = vscode.window.createTextEditorDecorationType({
                after: {
                    contentText: '',
                    backgroundColor: 'rgba(255, 0, 0, 0.3)' // Change this to your desired color
                }
            });

            const ranges = editor.visibleRanges.map(range => new vscode.Range(
                new vscode.Position(range.start.line, editor.document.lineAt(range.start.line).range.end.character),
                new vscode.Position(range.end.line, editor.document.lineAt(range.end.line).range.end.character)
            ));
            editor.setDecorations(decorationType, ranges);
        });
    });

    context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
}
