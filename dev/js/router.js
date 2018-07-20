module.exports = function(){

	//Libraries
	const Navigo = require('navigo');
	const ViewController = require('./view');
	const Gallery = require('./gallery');
	const Skrollr = require('skrollr');
	const isMobile = require('is-mobile');

	//Global variables
	var router = new Navigo(SERVER_NAME, true);
	var skrlr = Skrollr.init({forceHeight: false});
	var view = new ViewController(SERVER_NAME + '/views', '#main-wrapper', '#progressbar');


	router.on('portfolio/:name', function (params) {
		view.load('projects/' + params.name, function(){
			var glry = new Gallery();
			glry.init('#gallery');
		});
	});

	router.on('portfolio', function () {
		view.load('portfolio', function() {
			skrlr.refresh();
		});
	});

	router.on('404', function () {
		console.log('Page not found');
		view.load('404');
	});

	router.on(function () {
		view.load('home', function() {
			skrlr.refresh();
		});
	});

	router.notFound(function() {
		view.load('404');
	});

	router.resolve();

}