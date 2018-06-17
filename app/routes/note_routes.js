var request = require('request');
var ObjectID = require('mongodb').ObjectID;

function validate(data) {
	let errors = {};
	if (data.title === '') errors.title = "You cannot have an empty title";
	if (data.description === '') errors.description = "You cannot have an empty description URL";
	const isVal = Object.keys(errors).length === 0;
	return {
		errors,
		isVal
	};
}
module.exports = function (app, db) {
	app.get('/movies', (req, res) => {
		request('https://api.themoviedb.org/3/discover/movie?&sort_by=popularity.desc&api_key=2931998c3a80d7806199320f76d65298', function (error, response, body) {
			console.log('error:', error); // Print the error if one occurred and handle it
			console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
			res.send(body)
		});
	});
	app.get('/movies/:id', (req, res) => {
		const id = req.params.id;
		request('https://api.themoviedb.org/3/movie/' + id + '?&api_key=2931998c3a80d7806199320f76d65298', function (error, response, body) {
			console.log('error:', error); // Print the error if one occurred and handle it
			console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
			res.send(body)
		});
	});
	app.get('/comments/:id', (req, res) => {
		const id = req.params.id;
		request('https://api.themoviedb.org/3/movie/' + id + '/reviews?api_key=4d9c9de3bdf0d3b6837c49c086e3b190', function (error, response, body) {
			console.log('error:', error); // Print the error if one occurred and handle it
			console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
			res.send(body)
		});
	});
	app.post('/movies', (req, res) => {
		console.log(req.body);
		request('https://api.themoviedb.org/3/search/movie?api_key=2931998c3a80d7806199320f76d65298&language=en-US&query=' + req.body.title + '&page=1&include_adult=false', function (error, response, body) {
			console.log("###response from api", JSON.parse(response.body).results[0]);
			const movieObj = JSON.parse(response.body).results[0];
			const {
				errors,
				isVal
			} = validate(req.body);
			if (isVal) {
				const {
					title
				} = req.body;
				console.log("$Title is", title);
				db.collection('movies').insert({
					movieObj
				}, (error, result) => {
					if (error) {
						res.status(500).json({
							errors: {
								global: "Oops something is right!"
							}
						});
					} else {
						res.json({
							show: movieObj
						});
					}
				})
			} else {
				res.status(400).json({
					errors
				});
			}
		});

	});
	app.post('/comments', (req, res) => {
		const { errors, isVal } = validate(req.body);
		if (isVal){
			const { author, description } = req.body;
			db.collection('comments').insert({ author, description }, (error, result) => {
				if (error) {
					res.status(500).json({ errors: { global: "Oops something is right!" }});
				} else {
					res.json({ comments: result.ops[0] });
				} 
			})

		} else {
			res.status(400).json({ errors });
		}

	});
	app.get('/search/:query', (req, res) => {
		const searchString = req.params.query;
		console.log("$$$$request string" + JSON.stringify(searchString));
		request('https://api.themoviedb.org/3/search/movie?api_key=2931998c3a80d7806199320f76d65298&language=en-US&query=' + searchString + '&page=1&include_adult=false', function (error, response, body) {
			console.log('error:', error); // Print the error if one occurred and handle it
			console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
			res.send(body)
		});
	});

	app.get('/theatre', (req, res) => {
		request('https://api.themoviedb.org/3/discover/movie?&primary_release_date.gte=2018-04-25&sort_by=popularity.desc&api_key=2931998c3a80d7806199320f76d65298' + '&page=1&include_adult=false', function (error, response, body) {
			console.log('error:', error); // Print the error if one occurred and handle it
			console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
			res.send(body)
		});
	});


}