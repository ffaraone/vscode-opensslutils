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
		const converter: any = converters['to'];
		const folders:Array<string> = infile.split(path.sep);
		const filename:string|undefined = folders.pop();
		if (!filename) {
			return;
		}
		const basePath = path.join(path.sep, ...folders);
		const lf:string = filename.toLocaleLowerCase();
		let outfile = '';
		let hasExt: boolean = false;
		for (const ext of converter.srcext) {
			hasExt = hasExt || lf.endsWith(ext);
		}
		if (hasExt) {
			const nameParts = filename.split('.');
			nameParts.pop();
			outfile = path.join(basePath, nameParts.join('.') + converter.dstext);
		} else {
			outfile = path.join(basePath, filename + converter.dstext);
		}
		converter.handler(infile, outfile)
			.then(() => {
				vscode.window.showInformationMessage(`The file ${filename} has been successfully converted.`);
			})
			.catch((err: any) => {
				vscode.window.showErrorMessage(err.message);
			});
	}


    let previewUri = vscode.Uri.parse('openssl-preview://authority/OpenSSL%20Preview');

    let provider = new OpenSSLTextDocumentContentProvider();
	context.subscriptions.push(vscode.Disposable.from(vscode.workspace.registerTextDocumentContentProvider('openssl-preview', provider)));

	vscode.workspace.onDidChangeTextDocument((e: vscode.TextDocumentChangeEvent) => {
		if (vscode.window.activeTextEditor && e.document === vscode.window.activeTextEditor.document) {
			provider.update(previewUri);
		}
	});

	context.subscriptions.push(vscode.commands.registerCommand('extension.showOpenSSLPreview', () => {
        return vscode.workspace.openTextDocument(previewUri).then(doc => {
            vscode.window.showTextDocument(doc, vscode.ViewColumn.Two);
        }, (reason) => {
            vscode.window.showErrorMessage(reason);
        });
	}));
	context.subscriptions.push(vscode.commands.registerCommand('extension.convertCrtToPem', (fileObj) => {
		certConverter(fileObj.path, 'pem');
	}));
	context.subscriptions.push(vscode.commands.registerCommand('extension.convertPemToCrt', (fileObj) => {
		certConverter(fileObj.path, 'der');
	}));
	context.subscriptions.push(vscode.commands.registerCommand('extension.generateKeyCsr', () => {

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
			vscode.window.showWorkspaceFolderPick().then((folder) => {
				//vscode.workspace.findFiles()
				console.log(folder);
				panel.dispose();
			});
		});
	}));
}

// this method is called when your extension is deactivated
export function deactivate() {
}
