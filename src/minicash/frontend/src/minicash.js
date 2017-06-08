'use strict';

import App from 'minicash/app';
import './styles/login.scss';
import './styles/minicash.scss';

document.addEventListener('DOMContentLoaded', () => {
    window.minicash = new App();
    window.minicash.start();
});
