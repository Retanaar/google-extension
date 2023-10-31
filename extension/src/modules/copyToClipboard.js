import {getTopContainer, logger, setStatus, showError} from "./utils.js";

const log = logger('CopyClipboard');

export function init() {
    _initCopyToClipboardButtons();
}

function _initCopyToClipboardButtons() {
    const copyButtons = getTopContainer().querySelectorAll('.copy-btn');
    copyButtons.forEach(button => button.addEventListener('click', async () => {
        const dataElementId = button.getAttribute('data-element-id');
        const dataElement = getTopContainer().querySelector(`#${dataElementId}`);
        try {
            await navigator.clipboard.writeText(dataElement.textContent);
            setStatus('Copied');
            log(`Value copied to clipboard [${dataElement.textContent}]`);
        } catch (error) {
            const errorString = JSON.stringify(error);
            log(`Unable to copy value into clipboard [${errorString}]`);
            showError(errorString);
        }
    }));
}

