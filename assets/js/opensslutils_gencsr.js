'use strict';
$(document).ready(() => {
    const vscode = acquireVsCodeApi();
    $('#btn-submit').on('click', (event) => {
        const form = document.getElementById('form-csr');
        const valid = form.checkValidity();
        form.classList.add('was-validated');
        if (!valid) {
            return;
        }
        vscode.postMessage({
            keyLength: $('#keyLength').val(),
            days: $('#days').val(),
            commonName: $('#commonName').val(),
            email: $('#email').val(),
            organization: $('#organization').val(),
            organizationalUnit: $('#rganizationalUnit').val(),
            locality: $('#locality').val(),
            state: $('#state').val(),
            country: $('#country').val(),
        });
    });
});
