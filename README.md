# WebTemplate

A basic template for small projects, creates a basic `index.html` and creates a generic folder structure, the gulp script handles `watch` over `less`, `scss`, `js` files.

Also contains command for optimization of scripts, styles and assets for production.

## Install

* npm install gulp-cli -g
* npm install gulp -D
* npm install
* gulp `command`

## Commands

* **create-template**: Creates a generic folder structure for small projects (`/css`, `js`, `libs`, `assets`, `fonts`, `index.html`)
* **production-release**: 
	* Concatenates and minifies all JS files from `/libs` and `/js`
	* Compiles any (LESS, SASS files) minifies all CSS files
	* Optimizes images on the `/assets` folder
* **dev-watch**: Watches for changes in Less or Sass files and compiles them, exporting a minified .css file
* **dev-watch-all**: Watches for changes in Js, Less or Sass files and compiles them, exporting a minified .css file and a concatenated minified .js file

## Notes

* Grid Library is: https://github.com/milligram/milligram
* Normalize.css included
* lodash.min.js included
* Analytics script on index.html included
* Jquery latest added