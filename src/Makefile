MANAGEPY_CMD = python manage.py
MANAGEPY_LOCAL_SETTINGS = minicash.app.settings.local
MANAGEPY_DEV_SETTINGS = minicash.app.settings.dev

TESTS = minicash.core minicash.auth minicash.frontend

all:
	@echo 'Available actions:'
	@echo 'devserver'
	@echo 'localserver'
	@echo 'frontend'
	@echo 'shell'
	@echo 'test'
	@echo 'check'


devserver:
	$(MANAGEPY_CMD) runserver_plus 127.0.0.1:5001 --settings $(MANAGEPY_DEV_SETTINGS)


localserver:
	$(MANAGEPY_CMD) runserver 127.0.0.1:5001 --settings $(MANAGEPY_LOCAL_SETTINGS)


frontend:
	$(MAKE) -C ./minicash/frontend


shell:
	$(MANAGEPY_CMD) shell_plus


test:
	$(MANAGEPY_CMD) test -v 2 $(TESTS) --settings $(MANAGEPY_DEV_SETTINGS) --noinput


check: pycheck


pycheck: flake8 pylint


checklicense:
	git grep --files-without-match 'Copyright (C) 2017' -- './*' ':(exclude)*/.*' ':(exclude).*' ':(exclude)*.txt'


flake8:
	flake8 --config=.flake8rc .


pylint:
	pylint --load-plugins pylint_django --rcfile=.pylintrc minicash.core minicash.auth minicash.frontend > pylint.out


pylizard:
	lizard . -l python


.PHONY: clean
