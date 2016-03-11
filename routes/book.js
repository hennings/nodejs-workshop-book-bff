var express = require('express');
var router = express.Router();
var request = require("request");

/* GET book listing. */
router.get('/:isbn', function(req, res, next) {
  var isbn = req.params.isbn;
  var cover;

  var url = 'https://book-catalog-proxy-2.herokuapp.com/book?isbn='+isbn;

  request(url, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      //console.log(body) // Show the HTML for the Google homepage.
      var j = JSON.parse(body);
      res.render('book', {isbn: isbn,
        cover: j.items[0].volumeInfo.imageLinks.thumbnail,
        title: j.items[0].volumeInfo.title
      })
    }
  })

});

module.exports = router;
