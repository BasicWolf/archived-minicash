MANAGEPY_CMD = python manage.py
MANAGEPY_DEV_SETTINGS = minicash.app.settings.dev
MANAGEPY_TEST_SETTINGS = minicash.app.settings.test

NODE_MODULES_DIR = ./node_modules
FRONTEND_DIR = ./minicash/frontend
FRONTEND_STATIC_DIR = $(FRONTEND_DIR)/static
FRONTEND_STATIC_LIB_DIR = $(FRONTEND_STATIC_DIR)/lib


TESTS := minicash.utils minicash.core minicash.auth minicash.frontend
TESTS := minicash.core.tests.test_records_filter_api

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
	heroku local web

shell:
	$(MANAGEPY_CMD) shell_plus


test:
	$(MANAGEPY_CMD) test -v 2 $(TESTS) --settings $(MANAGEPY_TEST_SETTINGS) --noinput

test-behave:
	$(MANAGEPY_CMD) behave --settings $(MANAGEPY_TEST_SETTINGS)


check: check-python


check-python: flake8 pylint safety


checklicense:
	git grep --files-without-match 'Copyright (C) 2017' -- './*' ':(exclude)*/.*' ':(exclude).*' ':(exclude)*.txt'


flake8:
	flake8 --config=.flake8rc .


pylint:
	pylint --rcfile=.pylintrc minicash.core minicash.auth minicash.frontend > pylint.out

safety:
	safety check -r requirements.txt

pylizard:
	lizard . -l python


# === Build and release === #
# ========================= #
frontend: $(NODE_MODULES_DIR) frontend-create-dev-symlinks
	$(NODE_MODULES_DIR)/.bin/webpack --watch

$(NODE_MODULES_DIR):
	npm install .

frontend-create-dev-symlinks: ${FRONTEND_STATIC_LIB_DIR}
	ln -sr -f ./node_modules/backbone/backbone.js ${FRONTEND_STATIC_LIB_DIR}
	ln -sr -f ./node_modules/backbone.marionette/lib/backbone.marionette.js ${FRONTEND_STATIC_LIB_DIR}
	ln -sr -f ./node_modules/backbone.radio/build/backbone.radio.js ${FRONTEND_STATIC_LIB_DIR}
	ln -sr -f ./node_modules/backbone.radio/build/backbone.radio.js.map ${FRONTEND_STATIC_LIB_DIR}
	ln -sr -f ./node_modules/underscore/underscore.js ${FRONTEND_STATIC_LIB_DIR}
	ln -sr -f ./node_modules/jquery/dist/jquery.js ${FRONTEND_STATIC_LIB_DIR}
	ln -sr -f ./node_modules/bootstrap/dist/js/bootstrap.js ${FRONTEND_STATIC_LIB_DIR}
	ln -sr -f ./node_modules/bootstrap-notify/bootstrap-notify.js ${FRONTEND_STATIC_LIB_DIR}
	ln -sr -f ./node_modules/bootstrap/dist/css/bootstrap.min.css ${FRONTEND_STATIC_LIB_DIR}
	ln -sr -f ./node_modules/bootstrap/dist/fonts ${FRONTEND_STATIC_DIR}
	ln -sr -f ./node_modules/eonasdan-bootstrap-datetimepicker/src/js/bootstrap-datetimepicker.js ${FRONTEND_STATIC_LIB_DIR}
	ln -sr -f ./node_modules/moment/moment.js ${FRONTEND_STATIC_LIB_DIR}
	ln -sr -f ./node_modules/jquery-validation/dist/jquery.validate.js ${FRONTEND_STATIC_LIB_DIR}

${FRONTEND_STATIC_LIB_DIR}:
	mkdir -p ${FRONTEND_STATIC_LIB_DIR}

build-release: django-collectstatic

django-collectstatic:
	$(MAKE) -C $(FRONTEND_DIR) build-release
	$(MANAGEPY_CMD) collectstatic --no-input


heroku-deploy:
	cd .. && git push heroku `git subtree split --prefix src master`:master --force

heroku-migrate:
	heroku run manage.py migrate

clean:
	rm -rf $(NODE_MODULES_DIR) ${FRONTEND_STATIC_DIR}

.PHONY: clean
