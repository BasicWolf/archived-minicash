((python-mode . ((eval . (message "Setting up Minicash environment for Emacs"))
                 (eval . (pyvenv-workon "minicash"))
                 (eval . (flycheck-set-checker-executable 'python-flake8 (expand-file-name "~/.virtualenvs/minicash/bin/flake8"))))))
