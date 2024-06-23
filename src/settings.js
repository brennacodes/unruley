const vscode = require('vscode');

async function updateSettings() {
    const config = vscode.workspace.getConfiguration('unruley');
    const defaultBackgroundColor = '#ff0000';
    const defaultMaxLineLength = 80;
    const defaultOpacity = 0.1;

    const backgroundColor = config.get('rulerColor', defaultBackgroundColor);
    const maxLineLength = config.get('ruler', defaultMaxLineLength);
    const opacity = config.get('rulerColorOpacity', defaultOpacity);

    // Check for conflicting settings
    const allConfigKeys = await vscode.workspace.getConfiguration().inspect('');
    const rulerConfigs = Object.keys(allConfigKeys.default)
        .filter(key => key.endsWith('.ruler') || key.endsWith('.rulers'));

    let existingRulers = [];
    rulerConfigs.forEach(key => {
        const rulers = vscode.workspace.getConfiguration().get(key, []);
        if (Array.isArray(rulers)) {
            existingRulers = existingRulers.concat(rulers);
        } else {
            existingRulers.push(rulers);
        }
    });

    if (existingRulers.length > 0) {
        const options = existingRulers.map(ruler => `Existing: ${ruler}`).concat(['Use Unruley default', 'Enter a new value']);
        const selected = await vscode.window.showWarningMessage(
            'Conflicting ruler settings found. Which setting would you like to use?',
            { modal: true },
            ...options
        );

        let finalRuler = defaultMaxLineLength;
        if (selected) {
            if (selected === 'Use Unruley default') {
                finalRuler = defaultMaxLineLength;
            } else if (selected === 'Enter a new value') {
                const input = await vscode.window.showInputBox({ prompt: 'Enter the ruler length you want to use', validateInput: input => isNaN(input) ? 'Please enter a valid number' : null });
                finalRuler = parseInt(input, 10);
            } else {
                finalRuler = parseInt(selected.replace('Existing: ', ''), 10);
            }
        }

        await config.update('ruler', finalRuler, vscode.ConfigurationTarget.Global);
        await editorConfig.update('rulers', [finalRuler], vscode.ConfigurationTarget.Global);
    } else {
        // If no conflicting settings are found, apply default settings if necessary
        if (!backgroundColor || !maxLineLength || !opacity) {
            await config.update('rulerColor', defaultBackgroundColor, vscode.ConfigurationTarget.Global);
            await config.update('ruler', defaultMaxLineLength, vscode.ConfigurationTarget.Global);
            await config.update('rulerColorOpacity', defaultOpacity, vscode.ConfigurationTarget.Global);
        } else {
            console.log('Custom settings already exist');
        }
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

module.exports = {
    updateSettings,
    updateEditorRulers
};
