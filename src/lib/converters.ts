import openssl from './openssl';
import * as path from 'path';
import * as vscode from 'vscode';

const convertersMap: any = {
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
    const converter: any = convertersMap[to];
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


function convertCrtToPem(fileObj: any) {
    certConverter(fileObj.path, 'pem');
}

function convertPemToCrt(fileObj: any) {
    certConverter(fileObj.path, 'der');
}

const converters = {
    convertCrtToPem: convertCrtToPem,
    convertPemToCrt: convertPemToCrt
};

export default converters;