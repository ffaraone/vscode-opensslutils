import { OpenSSLTextDocumentContentProvider } from './lib/providers';
import * as vscode from 'vscode';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below


// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "opensslutils" is now active!');

    let previewUri = vscode.Uri.parse('openssl-preview://authority/OpenSSL%20Preview');

    let provider = new OpenSSLTextDocumentContentProvider();
	let registration = vscode.Disposable.from(vscode.workspace.registerTextDocumentContentProvider('openssl-preview', provider));

	vscode.workspace.onDidChangeTextDocument((e: vscode.TextDocumentChangeEvent) => {
		if (vscode.window.activeTextEditor && e.document === vscode.window.activeTextEditor.document) {
			provider.update(previewUri);
		}
	});

	// vscode.window.onDidChangeTextEditorSelection((e: vscode.TextEditorSelectionChangeEvent) => {
	// 	if (e.textEditor === vscode.window.activeTextEditor) {
	// 		provider.update(previewUri);
	// 	}
	// });

	let disposable = vscode.commands.registerCommand('extension.showOpenSSLPreview', () => {
        return vscode.workspace.openTextDocument(previewUri).then(doc => {
            vscode.window.showTextDocument(doc, vscode.ViewColumn.Two);
        }, (reason) => {
            vscode.window.showErrorMessage(reason);
        });
		// return vscode.commands.executeCommand('vscode.previewHtml', previewUri, vscode.ViewColumn.Two, 'OpenSSL Preview').then((success) => {
		// }, (reason) => {
		// 	vscode.window.showErrorMessage(reason);
		// });
	});


    context.subscriptions.push(disposable, registration);
}

// this method is called when your extension is deactivated
export function deactivate() {
}
