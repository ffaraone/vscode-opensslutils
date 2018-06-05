import { execSync } from 'child_process';
import * as vscode from 'vscode';


export class OpenSSLTextDocumentContentProvider implements vscode.TextDocumentContentProvider {
	private _onDidChange = new vscode.EventEmitter<vscode.Uri>();

		public provideTextDocumentContent(uri: vscode.Uri): string {
            return this.processDocument();
            
		}

		get onDidChange(): vscode.Event<vscode.Uri> {
			return this._onDidChange.event;
		}

		public update(uri: vscode.Uri) {
			this._onDidChange.fire(uri);
		}

        private processDocument(): string {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                return 'no editor';
            }
            const text = editor.document.getText().trim();
            if (text.startsWith('-----BEGIN CERTIFICATE-----')) {
                return execSync('openssl x509 -text -noout', {
                    input: text
                }).toString('utf-8');
            }
            return 'Preview not available';
        }

		// private createCssSnippet() {
		// 	let editor = vscode.window.activeTextEditor;
		// 	if (!(editor.document.languageId === 'css')) {
		// 		return this.errorSnippet("Active editor doesn't show a CSS document - no properties to preview.")
		// 	}
		// 	return this.extractSnippet();
		// }

		// private extractSnippet(): string {
		// 	let editor = vscode.window.activeTextEditor;
		// 	let text = editor.document.getText();
		// 	let selStart = editor.document.offsetAt(editor.selection.anchor);
		// 	let propStart = text.lastIndexOf('{', selStart);
		// 	let propEnd = text.indexOf('}', selStart);

		// 	if (propStart === -1 || propEnd === -1) {
		// 		return this.errorSnippet("Cannot determine the rule's properties.");
		// 	} else {
		// 		return this.snippet(editor.document, propStart, propEnd);
		// 	}
		// }

		// private errorSnippet(error: string): string {
		// 	return `
		// 		<body>
		// 			${error}
		// 		</body>`;
		// }

		// private snippet(document: vscode.TextDocument, propStart: number, propEnd: number): string {
		// 	const properties = document.getText().slice(propStart + 1, propEnd);
		// 	return `<style>
		// 			#el {
		// 				${properties}
		// 			}
		// 		</style>
		// 		<body>
		// 			<div>Preview of the <a href="${encodeURI('command:extension.revealCssRule?' + JSON.stringify([document.uri, propStart, propEnd]))}">CSS properties</a></div>
		// 			<hr>
		// 			<div id="el">Lorem ipsum dolor sit amet, mi et mauris nec ac luctus lorem, proin leo nulla integer metus vestibulum lobortis, eget</div>
		// 		</body>`;
		// }
	}