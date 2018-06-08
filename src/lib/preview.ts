import { OpenSSLTextDocumentContentProvider } from './providers';
import * as vscode from 'vscode';


let currentPreviewDocument: vscode.TextDocument | null = null;


const previewUri = vscode.Uri.parse('openssl-preview://authority/OpenSSL%20Preview');

let provider = new OpenSSLTextDocumentContentProvider();

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


function previewDocument() {
    vscode.workspace.openTextDocument(previewUri).then(doc => {
        currentPreviewDocument = doc;
        vscode.window.showTextDocument(doc, {
            preserveFocus: true,
            preview: false,
            viewColumn: vscode.ViewColumn.Two
        });
    }, (reason) => {
        vscode.window.showErrorMessage(reason);
    });
}

const preview = {
    command: previewDocument,
    disposable: vscode.Disposable.from(vscode.workspace.registerTextDocumentContentProvider('openssl-preview', provider))
};

export default preview;