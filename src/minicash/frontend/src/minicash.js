import App from 'coffee/app';
import './styles/minicash.scss';

document.addEventListener('DOMContentLoaded', () => {
    window.minicash = new App();
    window.minicash.start();
});
