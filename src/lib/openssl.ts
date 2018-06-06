import { exec } from 'child_process';

function crtToPem(infile:string, outfile:string): Promise<any> {
    return new Promise((resolve, reject) => {
        exec(`openssl x509 -in ${infile} -inform der -out ${outfile}`, (err, stdout, stderr) => {
            console.log(err);
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
            console.log(err);
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

const openssl = {
    crtToPem: crtToPem,
    pemToCrt: pemToCrt
};

export default openssl;