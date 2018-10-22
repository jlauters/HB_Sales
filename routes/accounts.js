var express = require('express');
var router = express.Router();

function SortByDate(a, b) {

    var aDate = new Date(a.last_order_date);
    var bDate = new Date(b.last_order_date);

    return bDate.getTime() - aDate.getTime();
}

/* Aggregate Qtys */
router.get('/aggregate', function(req, res, next) {

    var db = req.db;
    var collection = db.get('accounts');
 
    collection.aggregate( [
        { "$unwind": "$orders"},
	{ "$group": 
	    {
	        "_id": "$order_date",
		"egg_total": { "$sum": "$orders.breakfast_qty" },
		"rbc_total": { "$sum": "$orders.rbc_qty" },
		"sweet_total": { "$sum": "$orders.sweet_pot_qty"},
		"masala_total": { "$sum": "$orders.masala_qty"},
		"green_chile_total": { "$sum": "$orders.green_chile_qty"},
		"gc_tofu_total": { "$sum": "$orders.gc_tofu_qty"},
		"thai_total": { "$sum": "$orders.thai_qty"},
		"apple_total": { "$sum": "$orders.apple_qty"}
	    }
        }
    ], function(e, docs) {
         console.log("aggregate docs: ");
	 console.log(docs);

	 res.json(docs);
    
    });
});

/* GET accounts listing. */
router.get('/accountslist', function(req, res, next) {
    var db = req.db;
    var collection = db.get('accounts');
    collection.find({},{},function(e,docs) {
	docs.sort(SortByDate);
        res.json(docs);
    });
});


/* Get Account Names */
router.get('/accountnames', function(req, res, next) {
    var db = req.db;
    var collection = db.get('accounts');
    collection.find({},{ "Store": 1}, function(e, docs) {

        docs.sort(function(a,b) {

            var a_store = a.Store.toLowerCase();
	    var b_store = b.Store.toLowerCase();

            if(a_store < b_store) { return -1; }
	    if(a_store > b_store) { return 1; }
	    return 0;
	});

        res.json(docs);
    });
});

router.post('/add-order', function(req, res, next) {

    var db = req.db;
    var collection = db.get('accounts');

    var store_name      = req.body.Store;
    var order_date      = req.body.order_date.trim();
    var rbc_qty         = parseInt( req.body.rbc_qty.trim() ) || 0;
    var sweet_pot_qty   = parseInt( req.body.sweet_qty.trim() ) || 0;
    var breakfast_qty   = parseInt( req.body.breakfast_qty.trim() ) || 0;
    var masala_qty      = parseInt( req.body.masala_qty.trim() ) || 0;
    var green_chile_qty = parseInt( req.body.green_chile_qty.trim() ) || 0;
    var gc_tofu_qty     = parseInt( req.body.gc_tofu_qty.trim() ) || 0;
    var thai_qty        = parseInt( req.body.thai_qty.trim() ) || 0;
    var apple_qty       = parseInt( req.body.apple_qty.trim() ) || 0;

    // need a store and a date to pin order to
    if( '' !== store_name && '' !== order_date ) {

        console.log('Minimum Requirements met ..creating order');

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
    

	var last_order = {"last_order_date": ""};
        collection.find({"Store": store_name}, {"last_order_date": 1}, function(e, docs) {
            last_order.last_order_date = docs[0].last_order_date; 

            var current_order = {"last_order_date": ""};
	    current_order.last_order_date = order_date;	

            // Only update last_order_date if it's more recent
            var sorted_date_value = SortByDate(last_order, current_order);
	
            console.log("last_order_date:" + last_order.last_order_date);
            console.log("order_date: " + current_order.last_order_date);

            console.log("sorted_value: " + sorted_date_value);

            if( 0 < sorted_date_value ) {
	        collection.update({"Store": store_name}, {"$set": {"last_order_date": order_date}});
	    }

	});

        // Redirect back to dashboard
	res.writeHead(302, {'Location': 'http://localhost:3000'});
	res.end();

    }

    console.log('Minimum Requirements Not met. Error Message Response needed');

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

        // Redirect back to dashboard
	res.writeHead(302, {'Location': 'http://localhost:3000'});
	res.end();

    } else {
        console.log('Store Name, Manager Contact, Store phone minimums not met!');	    
    }
	
});


module.exports = router;
