import openssl from './lib/openssl';
import { OpenSSLTextDocumentContentProvider } from './lib/providers';
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

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

	const editorOptions = {
		preview: false,
		viewColumn: vscode.ViewColumn.Active
	};

	let currentPreviewDocument: vscode.TextDocument | null = null;

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
	vscode.window.onDidChangeActiveTextEditor((e: vscode.TextEditor | undefined) => {
		if (vscode.window.activeTextEditor && e && e.document === vscode.window.activeTextEditor.document) {
			if (e.document === currentPreviewDocument) {
				return;
			}
			provider.update(previewUri);
		}
	});
	vscode.workspace.onDidCloseTextDocument((e: vscode.TextDocument) => {
		if (e === currentPreviewDocument) {
			currentPreviewDocument = null;
		}
	});
	

	context.subscriptions.push(vscode.commands.registerCommand('opensslutils.generatePrivKey', () => {
		const keyLengths = [
			{
				label: 'RSA 1024 bits',
				size: 1024,
				algo: 'rsa'
			},
			{
				label: 'RSA 2048 bits',
				size: 2048,
				algo: 'rsa'
			},
			{
				label: 'RSA 4096 bits',
				size: 4096,
				algo: 'rsa'
			},
			{
				label: 'DSA 1024 bits',
				size: 1024,
				algo: 'dsa'
			},
			{
				label: 'DSA 2048 bits',
				size: 2048,
				algo: 'dsa'
			},
			{
				label: 'DSA 4096 bits',
				size: 4096,
				algo: 'dsa'
			}
		];
		vscode.window.showQuickPick(keyLengths)
			.then((value: any | undefined) => {
				if (value === undefined) {
					return;
				}
				openssl.genPrivKey(value.size, value.algo).then(data => {
					vscode.workspace.openTextDocument({
						content: data
					}).then(doc => {
						vscode.window.showTextDocument(doc, editorOptions);
					});
				})
				.catch((err: any) => {
					vscode.window.showErrorMessage(err.message);
				});
			});
	}));


	context.subscriptions.push(vscode.commands.registerCommand('opensslutils.showOpenSSLPreview', () => {
        return vscode.workspace.openTextDocument(previewUri).then(doc => {
			currentPreviewDocument = doc;
            vscode.window.showTextDocument(doc, {
				preserveFocus: true,
				preview: false,
				viewColumn: vscode.ViewColumn.Two
			});
        }, (reason) => {
            vscode.window.showErrorMessage(reason);
        });
	}));
	context.subscriptions.push(vscode.commands.registerCommand('opensslutils.convertCrtToPem', (fileObj) => {
		try {
			certConverter(fileObj.path, 'pem');
		} catch (e) {
			console.log(e);
		}
	}));
	context.subscriptions.push(vscode.commands.registerCommand('opensslutils.convertPemToCrt', (fileObj) => {
		try {
			certConverter(fileObj.path, 'der');
		} catch (e) {
			console.log(e);
		}
	}));
	context.subscriptions.push(vscode.commands.registerCommand('opensslutils.generateKeyCsr', () => {
		let pureCssUri = vscode.Uri.file(path.join(context.extensionPath, 'assets', 'pure-min.css'));
		pureCssUri = pureCssUri.with({scheme: 'vscode-resource'});

		let extCssUri = vscode.Uri.file(path.join(context.extensionPath, 'assets', 'opensslutils.css'));
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
	context.subscriptions.push(vscode.commands.registerCommand('opensslutils.generateSelfSignedCert', () => {
		let pureCssUri = vscode.Uri.file(path.join(context.extensionPath, 'assets', 'pure-min.css'));
		pureCssUri = pureCssUri.with({scheme: 'vscode-resource'});

		let extCssUri = vscode.Uri.file(path.join(context.extensionPath, 'assets', 'opensslutils.css'));
		extCssUri = extCssUri.with({scheme: 'vscode-resource'});
		
		let panel = vscode.window.createWebviewPanel('openssl gen', 'Generate self-signed Certificate and Key', vscode.ViewColumn.One, {
			enableScripts: true
		});
		let html = fs.readFileSync(path.join(context.extensionPath, 'assets', 'gencert.html')).toString();
		html = html.replace('${pure_css_uri}', pureCssUri.toString());
		html = html.replace('${ext_css_uri}', extCssUri.toString());
		panel.webview.html = html;
		panel.webview.onDidReceiveMessage((message) => {
			// validate input
			openssl.genSelfSignedCert(message)
				.then((data) => {
					vscode.workspace.openTextDocument({
						content: data.key
					}).then(doc => {
						vscode.window.showTextDocument(doc, editorOptions);
					});
					vscode.workspace.openTextDocument({
						content: data.pem
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
	context.subscriptions.push(vscode.commands.registerCommand('opensslutils.generatePkcs12', () => {
		if (!vscode.workspace.workspaceFolders) {
			return;
		}
		const folder = vscode.workspace.workspaceFolders[0].uri;
		let pureCssUri = vscode.Uri.file(path.join(context.extensionPath, 'assets', 'pure-min.css'));
		pureCssUri = pureCssUri.with({scheme: 'vscode-resource'});

		let extCssUri = vscode.Uri.file(path.join(context.extensionPath, 'assets', 'opensslutils.css'));
		extCssUri = extCssUri.with({scheme: 'vscode-resource'});
		
		let panel = vscode.window.createWebviewPanel('openssl gen', 'Generate PKCS#12', vscode.ViewColumn.One, {
			enableScripts: true
		});
		let html = fs.readFileSync(path.join(context.extensionPath, 'assets', 'genp12.html')).toString();
		html = html.replace('${pure_css_uri}', pureCssUri.toString());
		html = html.replace('${ext_css_uri}', extCssUri.toString());
		panel.webview.html = html;
		panel.webview.onDidReceiveMessage((message) => {
			if (message.command.startsWith('choose-')) {
				const what = message.command.substring(7);
				vscode.window.showOpenDialog({
					canSelectFiles: true,
					canSelectFolders: false,
					canSelectMany: false,
					defaultUri: folder,
					openLabel: 'Choose',
				}).then((res: vscode.Uri[] | undefined) => {
					if (res) {
						console.log(res);
						panel.webview.postMessage({
							command: `set-${what}`,
							file: res[0].path
						});
					}
				});
			}
			if (message.command === 'export') {
				vscode.window.showSaveDialog({
					defaultUri: folder,
					saveLabel: 'Export'
				}).then((res) => {
					if (res) {
						message['p12'] = res.path;
						openssl.genP12(message).then(() => {
							const fileinfo = path.parse(res.path);
							vscode.window.showInformationMessage(`The p12 ${fileinfo.base} has beem exported successfully`);
							panel.dispose();
						})
						.catch((err:any) => {
							vscode.window.showErrorMessage(err.message);
						});
					}
				});
			}
			// validate input
			// openssl.genSelfSignedCert(message)
			// 	.then((data) => {
			// 		vscode.workspace.openTextDocument({
			// 			content: data.key
			// 		}).then(doc => {
			// 			vscode.window.showTextDocument(doc, editorOptions);
			// 		});
			// 		vscode.workspace.openTextDocument({
			// 			content: data.pem
			// 		}).then(doc => {
			// 			vscode.window.showTextDocument(doc, editorOptions);
			// 		});
			// 		panel.dispose();
			// 	})
			// 	.catch((err: any) => {
			// 		vscode.window.showErrorMessage(err.message);
			// 	});
		});
	}));
}

// this method is called when your extension is deactivated
export function deactivate() {
}
