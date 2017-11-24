MANAGEPY_CMD = python manage.py
MANAGEPY_DEV_SETTINGS = minicash.app.settings.dev
MANAGEPY_TEST_SETTINGS = minicash.app.settings.test

NODE_MODULES_DIR = ./node_modules
FRONTEND_DIR = ./minicash/frontend
FRONTEND_STATIC_DIR = $(FRONTEND_DIR)/static
FRONTEND_STATIC_LIB_DIR = $(FRONTEND_STATIC_DIR)/lib
FRONTEND_STATIC_IMG_DIR = $(FRONTEND_STATIC_DIR)/img
BEHAVE_FEATURES_DIR = $(FRONTEND_DIR)/tests/features

REQUIREMENTS_FILE = requirements.txt

PYLINT_APPS := minicash.utils minicash.core minicash.auth minicash.frontend
TEST_APPS := minicash.app minicash.utils minicash.core minicash.auth minicash.frontend
BEHAVE_FEATURES :=  $(BEHAVE_FEATURES_DIR)/tab_records.feature
TEST_ENV := REQUIREMENTS_PATH=$(realpath $(REQUIREMENTS_FILE))

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

test-all: check test test-behave

test:
	$(TEST_ENV) $(MANAGEPY_CMD) test -v 2 $(TEST_APPS) --settings $(MANAGEPY_TEST_SETTINGS) --noinput

test-behave:
	$(MANAGEPY_CMD) behave --settings $(MANAGEPY_TEST_SETTINGS) $(BEHAVE_FEATURES)


check: check-python

check-python: flake8 pylint mypy safety

flake8:
	flake8 --config=.flake8rc .

pylint:
	pylint --rcfile=.pylintrc ${PYLINT_APPS} > pylint.out

mypy:
	mypy . --ignore-missing-imports --follow-imports=skip

safety:
	safety check -r requirements.txt

pylizard:
	lizard ./minicash -l python


# === Build and release === #
# ========================= #
frontend: $(NODE_MODULES_DIR) frontend-create-dev-symlinks
	$(NODE_MODULES_DIR)/.bin/webpack --watch

$(NODE_MODULES_DIR):
	npm install .

frontend-create-dev-symlinks: ${FRONTEND_STATIC_IMG_DIR} ${FRONTEND_STATIC_LIB_DIR}
	ln -sr -f ./node_modules/backbone/backbone.js ${FRONTEND_STATIC_LIB_DIR}
	ln -sr -f ./node_modules/backbone.marionette/lib/backbone.marionette.js ${FRONTEND_STATIC_LIB_DIR}
	ln -sr -f ./node_modules/backbone.radio/build/backbone.radio.js ${FRONTEND_STATIC_LIB_DIR}
	ln -sr -f ./node_modules/backbone.radio/build/backbone.radio.js.map ${FRONTEND_STATIC_LIB_DIR}
	ln -sr -f ./node_modules/lodash/lodash.js ${FRONTEND_STATIC_LIB_DIR}
	ln -sr -f ./node_modules/jquery/dist/jquery.js ${FRONTEND_STATIC_LIB_DIR}
	ln -sr -f ./node_modules/jquery-validation/dist/jquery.validate.js ${FRONTEND_STATIC_LIB_DIR}
	ln -sr -f ./node_modules/bootstrap/dist/js/bootstrap.js ${FRONTEND_STATIC_LIB_DIR}
	ln -sr -f ./node_modules/bootstrap-notify/bootstrap-notify.js ${FRONTEND_STATIC_LIB_DIR}
	ln -sr -f ./node_modules/bootstrap/dist/css/bootstrap.min.css ${FRONTEND_STATIC_LIB_DIR}
	ln -sr -f ./node_modules/bootstrap/dist/fonts ${FRONTEND_STATIC_DIR}
	ln -sr -f ./node_modules/eonasdan-bootstrap-datetimepicker/src/js/bootstrap-datetimepicker.js ${FRONTEND_STATIC_LIB_DIR}
	ln -sr -f ./node_modules/moment/moment.js ${FRONTEND_STATIC_LIB_DIR}
	ln -sr -f ./node_modules/select2/dist/js/select2.js ${FRONTEND_STATIC_LIB_DIR}
	ln -sr -f ./node_modules/select2/dist/css/select2.css ${FRONTEND_STATIC_LIB_DIR}

${FRONTEND_STATIC_LIB_DIR}:
	mkdir -p ${FRONTEND_STATIC_LIB_DIR}

${FRONTEND_STATIC_IMG_DIR}:
	ln -sr -f ./${FRONTEND_DIR}/src/img ${FRONTEND_STATIC_DIR}/img

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

.PHONY: clean $(REQUIREMENTS_FILE)
