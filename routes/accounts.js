var express = require('express');
var router = express.Router();

function SortByDate(a, b) {

    var aDate = new Date(a.last_order_date);
    var bDate = new Date(b.last_order_date);

    return bDate.getTime() - aDate.getTime();
}

/* GET accounts listing. */
router.get('/accountslist', function(req, res, next) {
    var db = req.db;
    var collection = db.get('accounts');
    collection.find({},{},function(e,docs) {
 
	console.log(' Sorting collection Find Results ... ');
	docs.sort(SortByDate);

        res.json(docs);
    });
});


/* Get Account Names */
router.get('/accountnames', function(req, res, next) {
    var db = req.db;
    var collection = db.get('accounts');
    collection.find({},{ "Store": 1}, function(e, docs) {

	console.log('account names result');
	console.log(docs);
        res.json(docs);
    });
});

router.post('/order', function(req, res, next) {

    var db = req.db;
    var collection = db.get('accounts');

    var store_name      = req.body.Store;
    var order_date      = req.body.order_date.trim();
    var rbc_qty         = parseInt( req.body.rbc_qty.trim() );
    var sweet_pot_qty   = parseInt( req.body.sweet_qty.trim() );
    var breakfast_qty   = parseInt( req.body.breakfast_qty.trim() );
    var masala_qty      = parseInt( req.body.masala_qty.trim() ) ;
    var green_chile_qty = parseInt( req.body.green_chile_qty.trim() );
    var gc_tofu_qty     = parseInt( req.body.gc_tofu_qty.trim() );
    var thai_qty        = parseInt( req.body.thai_qty.trim() ) ;
    var apple_qty       = parseInt( req.body.apple_qty.trim() );

    // need a store and a date to pin order to
    if( '' !== store_name && '' !== order_date ) {

        // build orders JSON
        var order = {
	    "order_date": order_date,
	    "rbc_qty": rbc_qty,
	    "sweet_pot_qty": sweet_pot_qty,
	    "breakfast_qty": breakfast_qty,
	    "masala_qty": masala_qty,
	    "green_chile_qty": green_chile_qty,
	    "gc_tofu_qty": gc_tofu_qty,
	    "thai_qty": thai_qty,
	    "apple_qty": apple_qty
	};

	// Add Order 
	collection.update({"Store": store_name},{"$addToSet": {'orders': order }});
    
        // update last_order_date
	collection.updat({"Store": store_name}, {"$set": {"last_order_date": order_date}});
	   
    }

});

/* POST new account */
router.post('/create', function(req, res, next) {

    var db = req.db;
    var collection = db.get('accounts');

    // TODO: real vaidation / sanitization
    var store_name      = req.body.Store.trim();
    var manager         = req.body.Manager.trim();
    var manager_contact = req.body.manager_contact.trim();
    var store_phone     = req.body.store_phone.trim();
    var store_address   = req.body.store_address.trim();
    var city            = req.body.City.trim();
    var state           = req.body.State.trim();
    var zipcode         = req.body.Zipcode.trim();

    // lazy check if basic stuff is there 	
    if( '' !== store_name && '' !== manager_contact && '' !== store_phone) {

	var today = new Date(Date.now()).toLocaleString();
        var account = {
            "Store": store_name,
	    "Manager": manager,
	    "manager_contact": manager_contact,
            "store_phone": store_phone,
	    "store_address": store_address,
	    "State": state,
	    "City": city,
	    "Zipcode": zipcode,
	    "last_order_date": today,
	    
	};

	result = collection.insert( account );
	console.log(' DB Insert Result: ');
	console.log(result);

    }
	
});


module.exports = router;
