content/index.html: content/index.template.html content/partials/*.html
	./scripts/partials content/index.template.html > $@

.PHONY: clean
clean:
	rm content/index.html
