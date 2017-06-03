var request = require("request");
var cheerio = require('cheerio');
var mysql = require('mysql');

var connection = mysql.createConnection({
  //socketPath : '/var/run/mysqld/mysqld.sock',
  host: '127.0.0.1',
  user: 'root',
  password: 'arun',
  database: 'hallmark'
});

function get_html( url, callback ){    
  request(url, function (error, response, body) {
    if (!error) {
      callback('success',body);
    } else {
      callback('error',body)
    }
  });
}


function update_record( row_id, data, callback){
    console.log( row_id );
    data['status'] = 1;
    console.log( data );
    
    
    connection.query('select * from products where id = ?', row_id, function (err, results) {
        if (err) {
            callback();
        } else {
            if( results.length > 0 ){
                connection.query('UPDATE products SET ? WHERE ?', [data, { id: row_id }],function( err , rrrr){
                    console.log('UPDATE HUA HAI!!!');
                    callback();
                });
            }else{
                callback();
            }
        }
    });
}

function scrapWikiPage( row_id, url,url_name, callback ){
    get_html( url,function(status, data){
        console.log(' STATUS scrapWikiPage :: ' + status);
        if( status == 'error'){
            callback('error','');
        }else{
            jQuery = cheerio.load( data );
            var description = jQuery('div.product-description-container').text();
            var price = jQuery('meta[property="og:price:amount"]').attr('content');
            var sku = '';

            data = {
                description : description,
                price : price,
                sku: sku
            }
            update_record( row_id, data, function(){
                callback( 'success',data);
            })
            
        }
    })
}

function startScraping( rows ){
    
    console.log('\n');
    console.log('\n');
    console.log('--------------PENDING URLS :: '+rows.length);
    console.log('\n');
    console.log('\n');
    console.log('WAIT TIME : 5 SECS' );
    
    setTimeout(function() {
        if( rows.length == 0){
            console.log('All are done');
            process.exit(0);
        }else{
            row = rows[0];

            rows.splice(0, 1);

            row_url = row['url'];
            row_url_name = row['url_name'];
            row_id = row['id'];
            console.log( row_url );
            scrapWikiPage( row_id, row_url,row_url_name, function( status, data){
                if( status == 'error'){

                }else{
                    console.log( data );
                }
                console.log('---------------------------------------------------------');
                console.log('---------------------------------------------------------');
                console.log('---------------------------------------------------------');
                console.log('---------------------------------------------------------');
                console.log('---------------------------------------------------------');

                startScraping( rows );
            })
        }
    }, 1000);
}


function start(){
    connection.query('select * from products where status = ?', 0, function (err, results) {
        if (err) {
           
        } else {
            if( results.length == 0){
                console.log('All are done');
                process.exit(0);
            }else{
                startScraping( results );
            }
        }
    });
}




start();