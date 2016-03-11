var express = require('express');
var router = express.Router();
var goodGuyLib = require("good-guy-http");
var jp = require('jsonpath');

var gg = goodGuyLib({
    maxRetries: 3,
    defaultCaching: {
        cached: true,
        timeToLive: 5000,
    },
    cache: goodGuyLib.inMemoryCache(10)
});

// 3 retries, cache-cont, 5 secs,

/* GET book listing. */
router.get('/:isbn', function (req, res, next) {
    var isbn = req.params.isbn;

    var url = 'https://book-catalog-proxy-3.herokuapp.com/book?isbn=' + isbn;

    gg(url).then(function (response) {
        var j0 = JSON.parse(response.body);
        var cover = jp.value(j0, "$.items[0].volumeInfo.imageLinks.thumbnail");
        var title = jp.value(j0, "$.items[0].volumeInfo.title");

        res.render('book', {
            isbn: isbn,
            cover: cover,
            title: title
        })
    }).catch(next)

})
;

module.exports = router;
