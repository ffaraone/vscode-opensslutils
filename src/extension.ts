import openssl from './lib/openssl';
import { OpenSSLTextDocumentContentProvider } from './lib/providers';
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
// import { openssl } from './lib/openssl';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below


// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	const converters: any = {
		'pem': {
			srcext: ['.cer', '.der', '.crt'],
			dstext: '.pem',
			handler: openssl.crtToPem
		},
		'der': {
			srcext: ['.pem', '.cer', '.txt', '.crt'],
			dstext: '.der',
			handler: openssl.pemToCrt
		}
	};

	function certConverter(infile: string, to: string) {
		const converter: any = converters[to];
		const parsed = path.parse(infile);
		
		let outfile = converter.srcext.includes(parsed.ext) ? path.join(parsed.dir, parsed.name + converter.dstext) : path.join(parsed.dir, parsed.base + converter.dstext);

		converter.handler(infile, outfile)
			.then(() => {
				vscode.window.showInformationMessage(`The file ${parsed.base} has been successfully converted.`);
			})
			.catch((err: any) => {
				vscode.window.showErrorMessage(err.message);
			});
	}



    const previewUri = vscode.Uri.parse('openssl-preview://authority/OpenSSL%20Preview');

    let provider = new OpenSSLTextDocumentContentProvider();
	context.subscriptions.push(vscode.Disposable.from(vscode.workspace.registerTextDocumentContentProvider('openssl-preview', provider)));

	vscode.workspace.onDidChangeTextDocument((e: vscode.TextDocumentChangeEvent) => {
		if (vscode.window.activeTextEditor && e.document === vscode.window.activeTextEditor.document) {
			provider.update(previewUri);
		}
	});

	context.subscriptions.push(vscode.commands.registerCommand('extension.showOpenSSLPreview', () => {
        return vscode.workspace.openTextDocument(previewUri).then(doc => {
            vscode.window.showTextDocument(doc, {
				preview: false,
				viewColumn: vscode.ViewColumn.Two
			});
        }, (reason) => {
            vscode.window.showErrorMessage(reason);
        });
	}));
	context.subscriptions.push(vscode.commands.registerCommand('extension.convertCrtToPem', (fileObj) => {
		try {
			certConverter(fileObj.path, 'pem');
		} catch (e) {
			console.log(e);
		}
	}));
	context.subscriptions.push(vscode.commands.registerCommand('extension.convertPemToCrt', (fileObj) => {
		try {
			certConverter(fileObj.path, 'der');
		} catch (e) {
			console.log(e);
		}
	}));
	context.subscriptions.push(vscode.commands.registerCommand('extension.generateKeyCsr', () => {
		const editorOptions = {
			preview: false,
			viewColumn: vscode.ViewColumn.Active
		};
		let pureCssUri = vscode.Uri.file(path.join(context.extensionPath, 'assets', 'pure-min.css'));
		pureCssUri = pureCssUri.with({scheme: 'vscode-resource'});

		let extCssUri = vscode.Uri.file(path.join(context.extensionPath, 'assets', 'gencsr.css'));
		extCssUri = extCssUri.with({scheme: 'vscode-resource'});
		
		let panel = vscode.window.createWebviewPanel('openssl gen', 'Generate CSR', vscode.ViewColumn.One, {
			enableScripts: true
		});
		let html = fs.readFileSync(path.join(context.extensionPath, 'assets', 'gencsr.html')).toString();
		html = html.replace('${pure_css_uri}', pureCssUri.toString());
		html = html.replace('${ext_css_uri}', extCssUri.toString());
		panel.webview.html = html;
		panel.webview.onDidReceiveMessage((message) => {
			// validate input
			openssl.genKeyCsr(message)
				.then((data) => {
					vscode.workspace.openTextDocument({
						content: data.key
					}).then(doc => {
						vscode.window.showTextDocument(doc, editorOptions);
					});
					vscode.workspace.openTextDocument({
						content: data.csr
					}).then(doc => {
						vscode.window.showTextDocument(doc, editorOptions);
					});
					panel.dispose();
				})
				.catch((err: any) => {
					vscode.window.showErrorMessage(err.message);
				});
		});
	}));
}

// this method is called when your extension is deactivated
export function deactivate() {
}
