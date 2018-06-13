import openssl from './openssl';
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';


const editorOptions = {
    preview: false,
    viewColumn: vscode.ViewColumn.Active
};


export function generatePrivKey() {
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
}

function getKeyCsrGenerator(extensionPath: string) {
    return () => {
		let bsCssUri = vscode.Uri.file(path.join(extensionPath, 'assets', 'css', 'bootstrap.min.css'));
		bsCssUri = bsCssUri.with({scheme: 'vscode-resource'});

		let extCssUri = vscode.Uri.file(path.join(extensionPath, 'assets', 'css', 'opensslutils.css'));
		extCssUri = extCssUri.with({scheme: 'vscode-resource'});
        
        let jqueryJsUri = vscode.Uri.file(path.join(extensionPath, 'assets', 'js', 'jquery-3.0.0.slim.min.js'));
        jqueryJsUri = jqueryJsUri.with({scheme: 'vscode-resource'});


        let bsJsUri = vscode.Uri.file(path.join(extensionPath, 'assets', 'js', 'bootstrap.bundle.min.js'));
        bsJsUri = bsJsUri.with({scheme: 'vscode-resource'});

        let extJsUri = vscode.Uri.file(path.join(extensionPath, 'assets', 'js', 'opensslutils_gencsr.js'));
        extJsUri = extJsUri.with({scheme: 'vscode-resource'});
        
        let panel = vscode.window.createWebviewPanel('openssl gen', 'Generate CSR', vscode.ViewColumn.One, {
            enableScripts: true
        });
        let html = fs.readFileSync(path.join(extensionPath, 'assets', 'gencsr_bootstrap.html')).toString();
		html = html.replace('${bs_css_uri}', bsCssUri.toString());
        html = html.replace('${ext_css_uri}', extCssUri.toString());
        html = html.replace('${jquery_js_uri}', jqueryJsUri.toString());
        html = html.replace('${bs_js_uri}', bsJsUri.toString());
        html = html.replace('${ext_js_uri}', extJsUri.toString());
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
    };
}

function getSelfSignedCertGenerator(extensionPath: string) {
    return () => {
		let bsCssUri = vscode.Uri.file(path.join(extensionPath, 'assets', 'css', 'bootstrap.min.css'));
		bsCssUri = bsCssUri.with({scheme: 'vscode-resource'});

		let extCssUri = vscode.Uri.file(path.join(extensionPath, 'assets', 'css', 'opensslutils.css'));
		extCssUri = extCssUri.with({scheme: 'vscode-resource'});
        
        let jqueryJsUri = vscode.Uri.file(path.join(extensionPath, 'assets', 'js', 'jquery-3.0.0.slim.min.js'));
        jqueryJsUri = jqueryJsUri.with({scheme: 'vscode-resource'});


        let bsJsUri = vscode.Uri.file(path.join(extensionPath, 'assets', 'js', 'bootstrap.bundle.min.js'));
        bsJsUri = bsJsUri.with({scheme: 'vscode-resource'});

        let extJsUri = vscode.Uri.file(path.join(extensionPath, 'assets', 'js', 'opensslutils_gencert.js'));
        extJsUri = extJsUri.with({scheme: 'vscode-resource'});
		
		let panel = vscode.window.createWebviewPanel('openssl gen', 'Generate self-signed Certificate and Key', vscode.ViewColumn.One, {
			enableScripts: true
		});
		let html = fs.readFileSync(path.join(extensionPath, 'assets', 'gencert_bootstrap.html')).toString();
		html = html.replace('${bs_css_uri}', bsCssUri.toString());
        html = html.replace('${ext_css_uri}', extCssUri.toString());
        html = html.replace('${jquery_js_uri}', jqueryJsUri.toString());
        html = html.replace('${bs_js_uri}', bsJsUri.toString());
        html = html.replace('${ext_js_uri}', extJsUri.toString());
		panel.webview.html = html;
		panel.webview.onDidReceiveMessage((message) => {
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
    };
}

function getP12Generator(extensionPath: string) {
    return () => {
		if (!vscode.workspace.workspaceFolders) {
			return;
		}
		const folder = vscode.workspace.workspaceFolders[0].uri;
		let bsCssUri = vscode.Uri.file(path.join(extensionPath, 'assets', 'css', 'bootstrap.min.css'));
		bsCssUri = bsCssUri.with({scheme: 'vscode-resource'});

		let extCssUri = vscode.Uri.file(path.join(extensionPath, 'assets', 'css', 'opensslutils.css'));
		extCssUri = extCssUri.with({scheme: 'vscode-resource'});
        
        let jqueryJsUri = vscode.Uri.file(path.join(extensionPath, 'assets', 'js', 'jquery-3.0.0.slim.min.js'));
        jqueryJsUri = jqueryJsUri.with({scheme: 'vscode-resource'});


        let bsJsUri = vscode.Uri.file(path.join(extensionPath, 'assets', 'js', 'bootstrap.bundle.min.js'));
        bsJsUri = bsJsUri.with({scheme: 'vscode-resource'});

        let extJsUri = vscode.Uri.file(path.join(extensionPath, 'assets', 'js', 'opensslutils_genp12.js'));
        extJsUri = extJsUri.with({scheme: 'vscode-resource'});


		let panel = vscode.window.createWebviewPanel('openssl gen', 'Generate PKCS#12', vscode.ViewColumn.One, {
			enableScripts: true
		});
		let html = fs.readFileSync(path.join(extensionPath, 'assets', 'genp12_bootstrap.html')).toString();
		html = html.replace('${bs_css_uri}', bsCssUri.toString());
        html = html.replace('${ext_css_uri}', extCssUri.toString());
        html = html.replace('${jquery_js_uri}', jqueryJsUri.toString());
        html = html.replace('${bs_js_uri}', bsJsUri.toString());
        html = html.replace('${ext_js_uri}', extJsUri.toString());
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
							vscode.window.showInformationMessage(`The p12 ${fileinfo.base} has been exported successfully`);
							panel.dispose();
						})
						.catch((err:any) => {
							vscode.window.showErrorMessage(err.message);
						});
					}
				});
			}
		});
    };
}

const generators = {
    generatePrivKey: generatePrivKey,
    getKeyCsrGenerator: getKeyCsrGenerator,
    getSelfSignedCertGenerator: getSelfSignedCertGenerator,
    getP12Generator: getP12Generator
};

export default generators;