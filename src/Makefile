#    Copyright (C) 2017 Zaur Nasibov and contributors
#
#    This file is part of Minicash.

#    Minicash is free software: you can redistribute it and/or modify
#    it under the terms of the GNU General Public License as published by
#    the Free Software Foundation, either version 3 of the License, or
#    (at your option) any later version.

#    Foobar is distributed in the hope that it will be useful,
#    but WITHOUT ANY WARRANTY; without even the implied warranty of
#    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#    GNU General Public License for more details.

#    You should have received a copy of the GNU General Public License
MANAGEPY_CMD = python manage.py
MANAGEPY_DEV_SETTINGS = minicash.app.settings.dev
MANAGEPY_LOCAL_SETTINGS = minicash.app.settings.local

TESTS = minicash.core minicash.auth minicash.frontend

all:
	@echo 'Available actions:'
	@echo 'devserver'
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
