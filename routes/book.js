module.exports = function (app) {
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

    var ESI = require('nodesi');
    var esi = new ESI({
        onError: function(src, error) {
            if(error.statusCode === 404) {
                return '<!-- Not found (' + error + ' for ' + src + "-->";
            }
            return '<!-- Failed ' + error + ' for ' + src  + '-->';
        }
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

                return new Promise(function (resolve, reject) {
                    app.render('book', {
                        isbn: isbn,
                        cover: cover,
                        title: title
                    }, function (err, res) {
                        if (err) reject(err)
                        resolve(res.toString());
                    });
                })
            })
            .then(function(r) {return esi.process(r) })
            .then(function(html) { return res.send(html) })

            .catch(next)
        ;

    });
    return router;
}