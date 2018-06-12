import converters from './lib/converters';
import generators from './lib/generators';
import preview from './lib/preview';
import * as vscode from 'vscode';


export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(vscode.commands.registerCommand('opensslutils.convertCrtToPem', converters.convertCrtToPem));
	context.subscriptions.push(vscode.commands.registerCommand('opensslutils.convertPemToCrt', converters.convertPemToCrt));
	context.subscriptions.push(preview.disposable);
	context.subscriptions.push(vscode.commands.registerCommand('opensslutils.showOpenSSLPreview', preview.command));
	context.subscriptions.push(vscode.commands.registerCommand('opensslutils.generatePrivKey', generators.generatePrivKey));
	context.subscriptions.push(vscode.commands.registerCommand('opensslutils.generateKeyCsr', generators.getKeyCsrGenerator(context.extensionPath)));
	context.subscriptions.push(vscode.commands.registerCommand('opensslutils.generateSelfSignedCert', generators.getSelfSignedCertGenerator(context.extensionPath)));
	context.subscriptions.push(vscode.commands.registerCommand('opensslutils.generatePkcs12', generators.getP12Generator(context.extensionPath)));
}

// this method is called when your extension is deactivated
export function deactivate() {
}
