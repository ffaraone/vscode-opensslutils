import { exec } from 'child_process';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

function crtToPem(infile:string, outfile:string): Promise<any> {
    return new Promise((resolve, reject) => {
        exec(`openssl x509 -in ${infile} -inform der -out ${outfile}`, (err, stdout, stderr) => {
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
        exec(`openssl x509 -in ${infile} -outform der -out ${outfile}`, (err, stdout, stderr) => {
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
        const cmd = `openssl req -new -newkey rsa:${data.keyLength} -keyout ${tmpKey} -out ${tmpCsr} -nodes -subj ${subj}`;
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

const openssl = {
    crtToPem: crtToPem,
    pemToCrt: pemToCrt,
    genKeyCsr: genKeyCsr
};

export default openssl;