MODULESDIR = ./node_modules/.bin
STATIC_LIB_DIR = ./static/lib/

all: build

build: create-lib-symlinks
	$(MODULESDIR)/webpack --watch --config webpack.config.js

build-release: create-lib-symlinks
	$(MODULESDIR)/webpack --config webpack.config.release.js

create-lib-symlinks: ${STATIC_LIB_DIR}
	ln -sr -f ./node_modules/backbone/backbone.js ${STATIC_LIB_DIR}
	ln -sr -f ./node_modules/backbone.marionette/lib/backbone.marionette.js ${STATIC_LIB_DIR}
	ln -sr -f ./node_modules/backbone.radio/build/backbone.radio.js ${STATIC_LIB_DIR}
	ln -sr -f ./node_modules/backbone.radio/build/backbone.radio.js.map ${STATIC_LIB_DIR}
	ln -sr -f ./node_modules/underscore/underscore.js ${STATIC_LIB_DIR}
	ln -sr -f ./node_modules/jquery/dist/jquery.js ${STATIC_LIB_DIR}
	ln -sr -f ./node_modules/bootstrap/dist/js/bootstrap.js ${STATIC_LIB_DIR}
	ln -sr -f ./node_modules/bootstrap-notify/bootstrap-notify.js ${STATIC_LIB_DIR}
	ln -sr -f ./node_modules/bootstrap/dist/css/bootstrap.min.css ${STATIC_LIB_DIR}
	ln -sr -f ./node_modules/eonasdan-bootstrap-datetimepicker/build/js/bootstrap-datetimepicker.min.js ${STATIC_LIB_DIR}
	ln -sr -f ./node_modules/moment/min/moment-with-locales.js ${STATIC_LIB_DIR}
	ln -sr -f ./node_modules/jquery-validation/dist/jquery.validate.js ${STATIC_LIB_DIR}

${STATIC_LIB_DIR}:
	mkdir -p ${STATIC_LIB_DIR}


clean:
	@rm -rf build
	@rm -rf ${STATIC_LIB_DIR}


.PHONY: build clean lib
