# Repository Guidelines

## Project Structure & Module Organization

This repository is a multi-package ModOmega browser extension project. `omega-pac/` contains the standalone PAC generator and profile model logic. `omega-target/` contains browser-independent options and profile management. `omega-web/` contains the Angular-based options UI, Jade templates, Less styles, popup assets, themes, and icons. `omega-target-chromium-extension/` provides the WebExtension target, browser API integrations, overlay manifests, and packaging tasks. `omega-build/` is the root orchestration package for dependency setup, linked local development, builds, and releases. Localized strings live under `omega-locales/<locale>/LC_MESSAGES/`.

## Build, Test, and Development Commands

Run commands from `omega-build/` unless working on one package only:

```sh
cd omega-build
npm run deps      # install npm dependencies in all modules and bower deps for omega-web
npm run dev       # link local modules for cross-package development
npm run build     # run Grunt default tasks across packages
npm run release   # build release archives under dist/
grunt watch       # watch all package Gruntfiles
grunt test        # run package test aliases through grunt-hub
```

For focused work, run `npm test` in `omega-pac/` or `omega-target/`, or `grunt test` in any package with tests.

## Coding Style & Naming Conventions

Most source is CoffeeScript. Follow existing file patterns: lowercase module filenames with underscores, package code under `src/`, package tests under `test/`, and build tasks under `grunt/`. CoffeeLint enforces arrow spacing, operator spacing, colon assignment spacing, no empty functions, no empty parameter lists, and no interpolation in single quotes. Keep indentation consistent with surrounding files because CoffeeLint intentionally ignores indentation due to an upstream issue.

## Testing Guidelines

Tests use Mocha with Chai and `coffee-script/register`; test files are `test/**/*.coffee`. Add focused tests next to the package that owns the behavior, for example `omega-pac/test/rule_list.coffee` for PAC rule logic. Run the nearest package test first, then `cd omega-build && grunt test` before broad changes.

## Commit & Pull Request Guidelines

Git history uses short, imperative or descriptive subjects such as `Update Russian translation` and `Fixed an issue where some logs were not being printed.` Keep commit subjects concise and behavior-focused. Pull requests should describe the changed module, user-visible impact, test commands run, and any browser-specific validation. Include screenshots or recordings for UI changes in `omega-web/` or extension popup flows.

## Security & Configuration Tips

Do not commit generated `build/`, `dist/`, or dependency directories. Keep proxy-provider wording neutral; the project is independent and does not provide network-provider support.
