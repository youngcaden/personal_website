var express = require('express');
var app = new express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);     //  var io = require('socket.io').listen(server);


var session = require('express-session');   //----------------------  configure the MiddleWare needs to use.
var sessionMiddleware = session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
});
app.use(sessionMiddleware);                 //----------------------


var path = require('path');
var cookieParser = require('cookie-parser');
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser('this is the secret key for singed cookie'));   




var router = require('./routes/router.js');
var securityController = require('./securityController.js');
//var mysql = require('mysql');


            
app.use('/', router(securityController));     



//var uiCommunications  = require('./uiCommunications.js')(io, securityController, sessionMiddleware);

server.listen(8008, function(){
  var host = server.address().address;
  var port = server.address().port;

  console.log('yongsongLee\'s website listening at http://%s:%s', host, port);
});

