import openssl from './openssl';
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
                return openssl.parsePem(text);
            } else if (text.startsWith('-----BEGIN CERTIFICATE REQUEST-----') || text.startsWith('-----BEGIN NEW CERTIFICATE REQUEST-----')) {
                return openssl.parseCsr(text);			
			}
            return 'Preview not available';
        }
	}