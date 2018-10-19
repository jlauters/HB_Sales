// Global JS file

var accountsListData = [];

$(document).ready(function() {
    populateTable();
    populateAccounts();
});

function SortByDate(a, b) {

    var aDate = new Date(a.order_date);
    var bDate = new Date(b.order_date);

    return bDate.getTime() - aDate.getTime();
}

function populateAccounts() {

    var accountsContent = '<option value="0"> -- Select Store -- </option>';
    $.getJSON('/accounts/accountnames', function(data) {
        $.each(data, function() {
            accountsContent += '<option value="' + this._id + '">' + this.Store + '</option>';
	});

        $('#store-select').html(accountsContent);    

    });
	
}

function populateTable() {
    var tableContent = '';
    var orderContent = '';


    $.getJSON('/accounts/accountslist', function(data) {
    
        $.each(data, function() {

            // Make date from string 
            var today = new Date();
            var d = new Date(this.last_order_date);

            var row_color = '';
            var diff_ms  = d.getTime() - today.getTime();
            var days_old = ( -1 * Math.floor( diff_ms / (1000 * 60 * 60 *24 )) )

            if ( 7 > days_old ) {
                row_color = 'level1';
	    } else if( 10 > days_old ) {
		row_color = 'level2';
            } else if( 14 > days_old ) {
		row_color = 'level3';
	    } else if( 20 > days_old) {
		row_color = 'level4';
	    } else if( 25 > days_old) {
		row_color = 'level5';
            } else if( 30 > days_old) {
		row_color = 'level6';
	    } else if( 35 > days_old) {
		row_color = 'level7';
            } else if( 40 > days_old) {
		row_color = 'level8';
            } else {
	        row_color = 'level9';
            }

	    tableContent += '<tr class="' + row_color + '">';
            tableContent += '<td>' + this.last_order_date + '</td>';
	    tableContent += '<td>' + this.Store + '</td>';
	    tableContent += '<td>' + this.Manager + '</td>';
	    tableContent += '<td>' + this.manager_contact + '</td>';
	    tableContent += '<td>' + this.store_phone + '</td>';
	    tableContent += '</tr>';

            store_name = this.Store;

            if( undefined !== $(this).attr('orders') ) {

                this.orders.sort(SortByDate);
                $.each(this.orders, function() {

                    orderContent += '<tr>';
		    orderContent += '<td>' + this.order_date + '</td>';
		    orderContent += '<td>' + store_name + '</td>';
		    orderContent += '<td>' + this.rbc_qty + '</td>';
                    orderContent += '<td>' + this.sweet_pot_qty + '</td>';
		    orderContent += '<td>' + this.breakfast_qty + '</td>';
		    orderContent += '<td>' + this.masala_qty + '</td>';
		    orderContent += '<td>' + this.green_chile_qty + '</td>';
		    orderContent += '<td>' + this.gc_tofu_qty + '</td>';
		    orderContent += '<td>' + this.thai_qty + '</td>';
		    orderContent += '<td>' + this.apple_qty + '</td>';
		    orderContent += '</tr>';
	        });
            }
	});

        $('#accountslist table tbody').html(tableContent);
	$('#orderslist table tbody').html(orderContent);
    });


};
