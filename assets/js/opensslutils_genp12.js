'use strict';
$(document).ready(() => {
    const vscode = acquireVsCodeApi();
    $('#pwd').on('input', (el) => {
        $('#repwd').attr('pattern', el.value);
    });
    window.addEventListener('message', (msg) => {
        if (msg.data.command.startsWith('set-')) {
            const what = msg.data.command.substring(4);
            document.getElementById(what).value = msg.data.file;
        }
    });
    for (let what of ['key', 'cert', 'bundle']) {
        $(`#${what}`).focusin(() => {
            $(`#${what}`).prop('readonly', true);
        });
        $(`#btn-${what}`).click(() => {
            $(`${what}`).prop('readonly', true);
            vscode.postMessage({
                command: `choose-${what}`
            });
        });
    }

    $('#btn-submit').on('click', (event) => {
        const form = document.getElementById('form-p12');
        $('#key').removeAttr('readonly');
        $('#cert').removeAttr('readonly');
        const valid = form.checkValidity();
        form.classList.add('was-validated');
        if (!valid) {
            return;
        }

        vscode.postMessage({
            command: 'export',
            key: $('#key').val(),
            cert: $('#cert').val(),
            bundle: $('#bundle').val(),
            alias: $('#alias').val(),
            pwd: $('#pwd').val()
        });
    });
});