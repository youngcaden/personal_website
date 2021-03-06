

module.exports = function(securityController){       //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

var express = require('express');
var router = express.Router();
var path = require('path');
//var config = require('./config.js');

var htmlPath = process.cwd() + "/public/html/";
var carcsvPath = process.cwd() + "/asset/car.csv";
var liftcsvPath = process.cwd() + "/asset/lift.csv";

var util = require('util');
var url = require('url');
var uuid = require('node-uuid');

router.use(function(req,res, next){
  //console.log("*** ", res);
  //res.sendFile(htmlPath + "opt.html");
  next();
});

router.get('/',function(req, res){
  // req.session.user_uuid = '6d01ca63-f966-4d54-9691-18f669767eb0';
  console.log('/', req.session.user_uuid);
  res.sendFile(htmlPath + "welcomePage.html");
});

router.get('/home',function(req, res){
  // req.session.user_uuid = '6d01ca63-f966-4d54-9691-18f669767eb0';
  console.log('/', req.session.user_uuid);
  res.sendFile(htmlPath + "home.html");
});


router.get('/releaseLockedAccount', function(){
  
});



router.get('/login', function(req, res){
//var uuid = uuid.v4();

  if(securityController.CheckAccountLockup(url.parse(req.url, true).query.name)){
    res.contentType('json');
    res.send(JSON.stringify({isLockUp:true}));
    res.end();
    console.log(url.parse(req.url, true).query.name, 'already lock-up');
    return;
  }


  if(securityController.ValidateUser(url.parse(req.url, true).query)){

    req.session.user_uuid = uuid.v4();
	req.session.name = url.parse(req.url, true).query.name;
        req.session.password = url.parse(req.url,true).query.password;
    console.log('valid user', url.parse(req.url, true).query, 'UUID:'+req.session.user_uuid);
	res.contentType('json');
    res.send(JSON.stringify({valid:true}));
	securityController.AddValidUUID(req.session.user_uuid);
	securityController.UnlockLockedAccount(url.parse(req.url, true).query.name);
    //logger.log(new Date().toString()+'----------'+'uuid:'+req.session.user_uuid+', User('+req.session.name+') logged in the system')
  }
  else{
    securityController.UpdateInvalidAccount(url.parse(req.url, true).query.name);
    console.log('invalid user');
    res.contentType('json');
    res.send(JSON.stringify({valid:false}));
  }

  res.end();
})

//===============>added by Caden 02/05/2018
router.get('/logs', function(req, res){

  //console.log('maintain', req.session, req.url);
  console.log('/logs', req.session.user_uuid);
  var user = {user:req.session.name, uuid:req.session.user_uuid}

  if(securityController.CheckValidUUID(req.session.user_uuid))
  	res.sendFile(htmlPath + "log.html");
  else{
    //res.send("Sorry, you have no permission to access this page!");
	res.redirect("/");
  }


})
//<===============
router.get('/logout', function(req,res){
  //logger.log(new Date().toString()+'----------'+'uuid:'+req.session.user_uuid+', User('+req.session.name+') logged out the system')
  securityController.DeleteValidUUID(req.session.user_uuid);

  var maintainIndex = req.headers.referer.indexOf('/mantainance');
  console.log('/logout from page:', req.headers.referer, 'maintainIndex', maintainIndex);
  if(req.headers.referer.inde == -1)
	 res.end();
  else{
	 res.redirect("/");
  }
})

router.get('/mantainance', function(req, res){
  //console.log('maintain', req.session, req.url);
  console.log('/mantainance', req.session.user_uuid);
  var user = {user:req.session.name, uuid:req.session.user_uuid}

  if(securityController.CheckValidUUID(req.session.user_uuid))
  	res.sendFile(htmlPath + "maintain.html");
  else{
    //res.send("Sorry, you have no permission to access this page!");
	res.redirect("/");
  }
});

router.get('/car_csv_temperate', function(req, res){
  res.download(carcsvPath, 'car.csv', function(err){
  		if (err) {
    		// Handle error, but keep in mind the response may be partially-sent
    		// so check res.headersSent
			console.log('error:',err);
  		} else {
    		// decrement a download credit, etc.
			console.log('OK');
			
 	 	}
	});
});

router.get('/lift_csv_temperate', function(req, res){
res.download(liftcsvPath, 'lift.csv', function(err){
  		if (err) {
    		// Handle error, but keep in mind the response may be partially-sent
    		// so check res.headersSent
			console.log('error:',err);
  		} else {
    		// decrement a download credit, etc.
			console.log('OK');
			
 	 	}
	});
});


/*router.get('/downloadCar', function(req, res, next){
  if (checkSecurtity(req)){
	next();
  }else{
    console.log('invalid user');
	res.sendStatus(200);
  }
});

function checkSecurtity(req){
	return false;
}

router.get('/downloadCar', function(req, res){
  //res.sendFile(htmlPath + "maintain.html");
	console.log('downloadCar',req);
	res.download(carcsvPath, 'car.csv', function(err){
  		if (err) {
    		// Handle error, but keep in mind the response may be partially-sent
    		// so check res.headersSent
			console.log('error:',err);
  		} else {
    		// decrement a download credit, etc.
			console.log('OK');
			
 	 	}
	});
});*/

return router;
}                                  //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
//module.exports = router;
