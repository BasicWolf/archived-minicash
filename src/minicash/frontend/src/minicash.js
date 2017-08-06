'use strict';

import App from 'minicash/app';
import './styles/minicash.scss';

document.addEventListener('DOMContentLoaded', () => {
    // NOTE, window.minicash is defined at this point.
    // It contains CONTEXT, passed from the backend.
    // After initialization, minicash.CONTEXT will be still referencing
    // the same object (see App constructor for details).
    window.minicash = new App();
    window.minicash.start();
    window.xxxx = 'abc';
});
