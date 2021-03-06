.DEFAULT_GOAL := all
flake8 = flake8 weaverbird tests
isort = isort weaverbird tests
black = black weaverbird tests

.PHONY: clean
clean:
	rm -rf `find . -name __pycache__`
	rm -f `find . -type f -name '*.py[co]' `
	rm -rf .coverage build dist *.egg-info .pytest_cache .mypy_cache

.PHONY: install
install:
	poetry install

.PHONY: format
format:
	$(isort)
	$(black)

.PHONY: lint
lint:
	$(flake8)
	$(isort) --check-only
	$(black) --check
	mypy .

.PHONY: test
test:
	pytest --junitxml=test-report.xml --cov=weaverbird --cov-report xml

.PHONY: all
all: test lint

.PHONY: build
build:
	poetry build

.PHONY: upload
upload:
	poetry publish
