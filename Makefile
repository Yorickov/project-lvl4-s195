install:
	npm install

build:
	rm -rf public
	npm run build

start:
	DEBUG=app:* npm run nodemon -- --watch .  --ext '.js' --exec npm run gulp -- server

test:
	npm test

test-debug:
	DEBUG=app:* npm test

test-watch:
	npm test -- --watchAll

test-coverage:
	npm test -- --coverage

lint:
	npm run eslint .

clean:
	rm -rf dist

.PHONY: test
