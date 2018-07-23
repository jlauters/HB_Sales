var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/accountslist', function(req, res, next) {
    var db = req.db;
    var collection = db.get('accounts');
    collection.find({},{},function(e,docs) {
        res.json(docs);
    });
});

module.exports = router;
