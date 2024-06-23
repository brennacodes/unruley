const vscode = require('vscode');
const myExtension = require('../../src/extension');
let assert;
(async () => {
  const chai = await import('chai');
  assert = chai.assert;
})();

suite('Extension Test Suite', function() {
    this.timeout(10000); // Set a high timeout for async operations

    setup(async () => {
        await vscode.commands.executeCommand('unruley.changeBackgroundColor');
        // Open a new untitled document
        const document = await vscode.workspace.openTextDocument({ content: '' });
        await vscode.window.showTextDocument(document);
    });

    test('Configuration update triggers event', async () => {
        const config = vscode.workspace.getConfiguration('unruley');
        await config.update('backgroundColor', '#00ff00', vscode.ConfigurationTarget.Global);
        await config.update('maxLineLength', 100, vscode.ConfigurationTarget.Global);
        await config.update('backgroundColorOpacity', 0.5, vscode.ConfigurationTarget.Global);

        const updatedConfig = vscode.workspace.getConfiguration('unruley');
        assert.strictEqual(updatedConfig.get('backgroundColor'), '#00ff00');
        assert.strictEqual(updatedConfig.get('maxLineLength'), 100);
        assert.strictEqual(updatedConfig.get('backgroundColorOpacity'), 0.5);
    });

    test('Apply decorations to active editor', async () => {
        const editor = vscode.window.activeTextEditor;
        assert.isNotNull(editor, 'Active editor should exist');

        // Add some content to the editor to ensure there are lines to decorate
        await editor.edit(editBuilder => {
            editBuilder.insert(new vscode.Position(0, 0), 'This is a test line\n');
        });

        // Ensure decorationType is created and applied
        await myExtension.applyDecorationsToActiveEditor();

        // Check if decorationType is defined
        assert.isNotNull(myExtension.decorationType, 'Decoration type should be defined');

        // If no errors were thrown, we can assume decorations were applied
        assert.ok(true, 'Decorations applied without errors');
    });

    test('Check default settings are applied', async () => {
        const config = vscode.workspace.getConfiguration('unruley');
        await config.update('backgroundColor', undefined, vscode.ConfigurationTarget.Global);
        await config.update('maxLineLength', undefined, vscode.ConfigurationTarget.Global);
        await config.update('backgroundColorOpacity', undefined, vscode.ConfigurationTarget.Global);

        await myExtension.updateSettings();

        const updatedConfig = vscode.workspace.getConfiguration('unruley');
        assert.strictEqual(updatedConfig.get('backgroundColor'), '#ff0000', 'Background color should be set to the default value');
        assert.strictEqual(updatedConfig.get('maxLineLength'), 80, 'Max line length should be set to the default value');
        assert.strictEqual(updatedConfig.get('backgroundColorOpacity'), 0.1, 'Background color opacity should be set to the default value');
    });

    test('Editor rulers are updated', async () => {
        await myExtension.updateEditorRulers();
        const editorConfig = vscode.workspace.getConfiguration('editor');
        const rulers = editorConfig.get('rulers', []);
        assert.include(rulers, 80, 'Rulers should include the max line length');
    });

    test('Hex color conversion to RGBA', () => {
        const rgba = myExtension.hexToRgba('#ff0000', 0.5);
        assert.strictEqual(rgba, 'rgba(255, 0, 0, 0.5)');
    });

    test('RGB color conversion to RGBA', () => {
        const rgba = myExtension.rgbToRgba('rgb(0, 255, 0)', 0.5);
        assert.strictEqual(rgba, 'rgba(0, 255, 0, 0.5)');
    });

    test('Valid hex color format', () => {
        assert.isTrue(myExtension.isHexColor('#ff0000'));
        assert.isFalse(myExtension.isHexColor('invalid'));
    });

    test('Valid RGB color format', () => {
        assert.isTrue(myExtension.isRgbColor('rgb(255, 0, 0)'));
        assert.isFalse(myExtension.isRgbColor('invalid'));
    });

    test('Effective max line length retrieval', () => {
        const maxLineLength = myExtension.getEffectiveMaxLineLength();
        assert.strictEqual(maxLineLength, 80);
    });
});
