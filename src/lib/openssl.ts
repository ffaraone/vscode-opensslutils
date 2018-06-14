import { exec } from 'child_process';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as vscode from 'vscode';


let opensslExec = vscode.workspace.getConfiguration('opensslutils').get('opensslPath') || 'openssl';


function crtToPem(infile:string, outfile:string): Promise<any> {
    return new Promise((resolve, reject) => {
        exec(`${opensslExec} x509 -in ${infile} -inform der -out ${outfile}`, (err, stdout, stderr) => {
            if (err) {
                reject(err);
                return;
            }
            if (stderr) {
                reject(stderr);
            }
            resolve(stdout);
        });
    });
}

function pemToCrt(infile:string, outfile:string): Promise<any> {
    return new Promise((resolve, reject) => {
        exec(`${opensslExec} x509 -in ${infile} -outform der -out ${outfile}`, (err, stdout, stderr) => {
            if (err) {
                reject(err);
                return;
            }
            if (stderr) {
                reject(stderr);
            }
            resolve(stdout);
        });
    });
}

function genPrivKey(size: number, algo: string): Promise<any> {
    let cmd = `${opensslExec}`;
    if (algo === 'rsa') {
        cmd += ` genrsa ${size}`;
    } else {
        cmd += ` dsaparam -genkey ${size}`;
    }
    return new Promise((resolve, reject) => {
        exec(cmd, (err, stdout, stderr) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(stdout);
        });
    });
}

function genP12(data: any): Promise<any> {
    let cmd = `${opensslExec} pkcs12 -export -out ${data.p12} -inkey ${data.key} -in ${data.cert} -password pass:${data.pwd}`;
    if (data.bundle) {
        cmd += ` -certfile ${data.bundle}`;
    }
    if (data.alias) {
        cmd += ` -name "${data.alias}"`;
    }
    return new Promise((resolve, reject) => {
        exec(cmd, (err, stdout, stderr) => {
            if (err) {
                reject(err);
                return;
            }
            resolve();
        });
    });
}

function genKeyCsr(data:any): Promise<any> {
    const rndStr = crypto.randomBytes(10).toString('hex');
    const tmpKey = path.join(os.tmpdir(), `op_${rndStr}.key`);
    const tmpCsr = path.join(os.tmpdir(), `op_${rndStr}.csr`);

    let subj = `/CN=${data.commonName}/C=${data.country}`;
    if (data.state) {
        subj += `/ST=${data.state}`;
    }
    if (data.locality) {
        subj += `/localityName=${data.locality}`;
    }
    if (data.organization) {
        subj += `/O=${data.organization}`;
    }
    if (data.organizationalUnit) {
        subj += `/OU=${data.organizationalUnit}`;
    }
    if (data.email) {
        subj += `/emailAddress=${data.email}`;
    } 
    subj = '"' + subj + '"';

    return new Promise((resolve, reject) => {
        const cmd = `${opensslExec} req -new -newkey rsa:${data.keyLength} -keyout ${tmpKey} -out ${tmpCsr} -nodes -subj ${subj}`;
        exec(cmd, (err, stdout, stderr) => {
            if (err) {
                reject(err);
                return;
            }
            const output = {
                key: fs.readFileSync(tmpKey).toString(),
                csr: fs.readFileSync(tmpCsr).toString()
            };
            resolve(output);
            fs.unlink(tmpKey, (err) => {
                if (err) {
                    console.log(err);
                }
            });
            fs.unlink(tmpCsr, (err) => {
                if (err) {
                    console.log(err);
                }
            });
        });
    });
}

function genSelfSignedCert(data:any): Promise<any> {
    const rndStr = crypto.randomBytes(10).toString('hex');
    const tmpKey = path.join(os.tmpdir(), `op_${rndStr}.key`);
    const tmpPem = path.join(os.tmpdir(), `op_${rndStr}.pem`);

    let subj = `/CN=${data.commonName}/C=${data.country}`;
    if (data.state) {
        subj += `/ST=${data.state}`;
    }
    if (data.locality) {
        subj += `/localityName=${data.locality}`;
    }
    if (data.organization) {
        subj += `/O=${data.organization}`;
    }
    if (data.organizationalUnit) {
        subj += `/OU=${data.organizationalUnit}`;
    }
    if (data.email) {
        subj += `/emailAddress=${data.email}`;
    } 
    subj = '"' + subj + '"';

    return new Promise((resolve, reject) => {
        const cmd = `${opensslExec} req -x509 ${data.hashAlgo} -nodes -days ${data.days} -newkey rsa:${data.keyLength} -keyout ${tmpKey} -out ${tmpPem} -subj ${subj}`;
        exec(cmd, (err, stdout, stderr) => {
            if (err) {
                reject(err);
                return;
            }
            const output = {
                key: fs.readFileSync(tmpKey).toString(),
                pem: fs.readFileSync(tmpPem).toString()
            };
            resolve(output);
            fs.unlink(tmpKey, (err) => {
                if (err) {
                    console.log(err);
                }
            });
            fs.unlink(tmpPem, (err) => {
                if (err) {
                    console.log(err);
                }
            });
        });
    });
}

const openssl = {
    crtToPem: crtToPem,
    pemToCrt: pemToCrt,
    genKeyCsr: genKeyCsr,
    genPrivKey: genPrivKey,
    genSelfSignedCert: genSelfSignedCert,
    genP12: genP12
};

export default openssl;