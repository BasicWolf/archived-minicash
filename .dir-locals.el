((python-mode . ((eval . (message "Setting up Minicash environment for Emacs"))

                 (eval . (setq flycheck-jshintrc (concat (projectile-project-root) "src/.jshintrc")))
                 (eval . (flycheck-set-checker-executable 'python-flake8 (expand-file-name "~/.virtualenvs/minicash/bin/flake8"))))))
