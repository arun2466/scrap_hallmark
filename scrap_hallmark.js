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
function save_url(data,callback){
  if( data.length ==  0 ){
    callback('all products url inserted .....');
  }else{
    console.log( data.length);
    rec = data[0];
    data.splice(0, 1); //remove first product
    var DATA = {
      url : rec.url,
      name : rec.name,
      image : rec.image,
      price: '',
      description:'',
      sku:'',
      status : 0
    }
    console.log( DATA );
    sql = 'insert into products set ?';
    sql = mysql.format(sql, DATA);
    connection.query(sql,function(err, rrrr){
    	console.log( err )
      console.log('INSERT HUA HAI!!!');
      save_url(data,callback)
    });
  }
}
function scrap_catalog_page( urls, callback ){
	console.log( 'Pending urls :: ' + urls.length );
	console.log( 'Pending urls :: ' + urls.length );
	console.log( 'Pending urls :: ' + urls.length );
	if( urls.length == 0 ){
		callback();
	}else{
		var urlToScrap = urls[0];
		urls.splice(0, 1);
		get_html( urlToScrap, function(a,d){
			if( a == 'error'){
				scrap_catalog_page( urls, callback );
			}else{
				var all_urls = [];
				//console.log(d);
				jQuery = cheerio.load( d );
				if( jQuery('article.browse-list-item').length > 0 ){
          jQuery('article.browse-list-item').each(function(){
            link = jQuery(this).find('a.js-thumb-link').attr('href');
            link = "http://www.hallmark.com"+link;
            image = jQuery(this).find('a.js-thumb-link').find('img').attr('src');
            name = jQuery(this).find('a.js-thumb-link').attr('title');
            jQuery(this).find('.browse-tile-product-price').find('span').find('span.screen-reader-text').remove();
            row = {
              url : link,
              name :name,
              image :image
            }
            if( typeof name != 'undefined' ){
            	all_urls.push( row );	
            }
            
          })          
        }
        if( all_urls.length > 0 ){
          save_url( all_urls, function(a){
            scrap_catalog_page( urls, callback );
          })
        }else{
        	scrap_catalog_page( urls, callback );	
        }
			}
		})		
	}  
}

function startScraping(){
	var urls = [];
	for( i = 0; i < 600 ; i = i + 36 ){
		var url = "http://www.hallmark.com/ornaments/all-ornaments/?start="+i+"&sz=36&promoslotlength=3";
		urls.push( url );
	}
	scrap_catalog_page( urls, function(){
		console.log('All are done!!!');
		process.exit(0);
	})

}

startScraping();