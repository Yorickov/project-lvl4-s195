install:
	npm install

build:
	rm -rf dist
	npm run build

dev:
	DEBUG=sequelize* npm run nodemon -- --watch .  --ext '.js' --exec npm run gulp -- server

prod:
	DEBUG=sequelize* npm start

test:
	DEBUG=sequelize* npm test

test-watch:
	npm test -- --watchAll

test-coverage:
	npm test -- --coverage

lint:
	npm run eslint .

clean:
	rm -rf dist

.PHONY: test
