/*
* this module is used to communication between server and browser client throught socket
*/

/*
var dbAccess = require('./database/dbAccess.js');

var dbController = new dbAccess('./database/db1.db', event_dbAccess);
*/

var EventEmitter = require('events').EventEmitter;

var dbAccess = require('./database/mysql.js');
var event_dbAccess = new EventEmitter(); //event used to listen message from dbController
var dbController = new dbAccess(event_dbAccess);

var config = require('./config.js');
var sockets = []; // stores connected sockets from web client


///cache.put('name', 'mars');


/*remove sockets that disconnected*/
function updateSockets(){
  var index = 0;
  var length = sockets.length;
  for(index = 0; index < length; index++){
    if(sockets[index].disconnected){
      sockets.splice(index,1);
      break;
    }
  }
  
  if(index >= length)
    return;
  else
    updateSockets();
}

/*find socket objtect which socket.id == id*/
function findSocket(id){
  var index = 0;

  for(index = 0; index < sockets.length; index++){
    if(sockets[index].id === id)
      return sockets[index];
  }

  if(index >= sockets.length)
    return null;
}

function socketsLogout(sessionID, id){
  console.log('sessionID, id', sessionID, id);
  var index = 0;

  for(index = 0; index < sockets.length; index++){
	console.log('***uuid, id', sockets[index].request.sessionID, sockets[index].id);
    if(sockets[index].request.sessionID === sessionID && sockets[index].id !== id)
	{
      sockets[index].emit('logout');	
	}
  }
}

module.exports = function(io, securityController, sessionMiddleware){  //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  var _socket;

  io.use(function(socket, next) {
	sessionMiddleware(socket.request, socket.request.res, next);
  });


  io.on('connection', function(socket){       //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
	
    //TODO:
    _socket = socket;
	//console.log('**************cookie**********',socket.request.headers.cookie);
	//console.log('socket*********', socket);

    sockets.push(socket);
    //console.log('client:', _socket.id, 'connected');
    //sockets.forEach(function(item){console.log(item.id, item.connected, item.disconnected);});



	socket.on('getMakes', function(){
	  //TODO:
	  console.log('receive getMakes from client');
          dbController.QueryAllMakes(socket.id);        //=====##===>dbAccess.js-----------1
	});



	socket.on('getModels', function(make){           
	  //TODO:
	  console.log('receive getModels from client');
          dbController.QueryModels(socket.id, make);    //=====##===>dbAccess.js-------------2
	});



	socket.on('getYears', function(make, model){
	  //TODO:
	  console.log('receive getYears from client', make, model);
          dbController.QueryYears(socket.id, make, model);    //=====##===>dbAccess.js-------------3
	});



    socket.on('getCarData', function(make, model, year){
      console.log('receive getCarData from client', make, model, year);
      dbController.QueryCarData(socket.id, make, model, year);    //=====##===>dbAccess.js-------------4
    });
    


    socket.on('getLifts', function(){
      console.log('receive getLifts from client');
      dbController.QueryLift(socket.id);                        //=====##===>dbAccess.js-------------one
    });



    socket.on('getLiftData', function(lift){
      dbController.QueryLiftData(socket.id, lift);              //=====##===>dbAccess.js-------------two
    });
    // =========>query whether the user has super permission ,created by Caden on 04/05/2018.
    socket.on('query_super_permission_create_account',function(){
       if(!securityController.CheckValidID(socket.id)&& !securityController.CheckValidUUID(socket.request.session.user_uuid)){
		 console.log('Invalid Socket.ID or user_uuid',socket.id, socket.request.session.user_uuid);
		 return;
       }  
       var mark = 'create';
       dbController.QuerySuperPermission(socket.id,socket.request.session.name,socket.request.session.password,mark);

    });
    socket.on('query_super_permission_delete_account',function(){
      if(!securityController.CheckValidID(socket.id)&& !securityController.CheckValidUUID(socket.request.session.user_uuid)){
		 console.log('Invalid Socket.ID or user_uuid',socket.id, socket.request.session.user_uuid);
		 return;
       }  
       var mark = 'delete';
       dbController.QuerySuperPermission(socket.id,socket.request.session.name,socket.request.session.password,mark);

    });
   //<==============
    // =========>modify user's password ,created by Caden on 09/05/2018.
    socket.on('modify_password',function(username,old_password,new_password){
      if(!securityController.CheckValidID(socket.id)&& !securityController.CheckValidUUID(socket.request.session.user_uuid)){
		 console.log('Invalid Socket.ID or user_uuid',socket.id, socket.request.session.user_uuid);
		 return;
       }  
      if(username != socket.request.session.name){
             socket.emit('input_user_name_error');
             return;
       }  

      dbController.ModifyAdministratorPassword(socket.id,username,old_password,new_password);

    });
   //<==============
   // =========>register a new account ,created by Caden on 09/05/2018.
    socket.on('add_account',function(username,password,administrator_type){
       if(!securityController.CheckValidID(socket.id)&& !securityController.CheckValidUUID(socket.request.session.user_uuid)){
		console.log('Invalid Socket.ID or user_uuid',socket.id, socket.request.session.user_uuid);
		return;
       }    

       dbController.AddNewAccount(socket.id,username,password,administrator_type);

    });
   //<==============
   // =========>delete an existing account ,created by Caden on 09/05/2018.
    socket.on('delete_account',function(username,password,administrator_type){
       if(!securityController.CheckValidID(socket.id)&& !securityController.CheckValidUUID(socket.request.session.user_uuid)){
		console.log('Invalid Socket.ID or user_uuid',socket.id, socket.request.session.user_uuid);
		return;
       } 
       if(username == socket.request.session.name){
                socket.emit('delete_login_user_refused');
                return;
       }
   
       dbController.DeleteExistAccount(socket.id,username,password,administrator_type);

    });
   //<==============
   // =========>get all administrators from administrators database ,created by Caden on 09/05/2018.
    socket.on('getAdminsFrom_administrators',function(){
      if(!securityController.CheckValidID(socket.id)&& !securityController.CheckValidUUID(socket.request.session.user_uuid)){
		console.log('Invalid Socket.ID or user_uuid',socket.id, socket.request.session.user_uuid);
		return;
      }    
      console.log('query all administrators from database administrators !');
      dbController.QueryAllAdministratorsFromDatabaseAdministrators(socket.id);

      });
   //<==============
   // =========>get all administrators from logs database  ,created by Caden on 07/05/2018.
   socket.on('getAdministrators',function(){
      if(!securityController.CheckValidID(socket.id)&& !securityController.CheckValidUUID(socket.request.session.user_uuid)){
		console.log('Invalid Socket.ID or user_uuid',socket.id, socket.request.session.user_uuid);
		return;
      }    
      console.log('query all administrators from database logs!');
      dbController.QueryAllAdministratorsFromDatabaseLogs(socket.id);
   });



   //<==============
   // =========>get cars log ,created by Caden on 03/05/2018.
    socket.on('getCarsLog',function(){
      console.log('query cars log from mysql database !');
      dbController.QueryCarsLog(socket.id); 

    });
   //<==============
   // =========>get lifts log ,created by Caden on 03/05/2018.
    socket.on('getLiftsLog',function(){
      console.log('query lift log from mysql database !');
      dbController.QueryLiftsLog(socket.id); 
    });
   //<==============
   // =========>get cars log by addministrator ,created by Caden on 07/05/2018.
    socket.on('getcarLogsByAdministrator',function(administrator){
      console.log('query cars log by administrator from mysql database !');
      dbController.QueryCarsLogByAdministrator(socket.id, administrator); 

    });
   //<==============
   // =========>get lifts log by administrator ,created by Caden on 07/05/2018.
    socket.on('getliftLogsByAdministrator',function(administrator){
      console.log('query lift log by administrator from mysql database !');
      dbController.QueryLiftsLogByAdministrator(socket.id, administrator); 
    });
   //<==============

    socket.on('batch_upload', function(table, data){
		
      if(!securityController.CheckValidID(socket.id)&& !securityController.CheckValidUUID(socket.request.session.user_uuid)){
		console.log('Invalid Socket.ID or user_uuid',socket.id, socket.request.session.user_uuid);
		return;
      }

      console.log(table);
      if(table === "lifts")
	    dbController.BatchUploadLift(socket.id, socket.request.session.name, socket.request.session.user_uuid, data);
      else if(table === "cars")
	    dbController.BatchUploadCar(socket.id, socket.request.session.name, socket.request.session.user_uuid, data);
    });



    socket.on('add_new_car', function(data){
	  if(!securityController.CheckValidID(socket.id)&& !securityController.CheckValidUUID(socket.request.session.user_uuid)){
		console.log('Invalid Socket.ID or user_uuid',socket.id, socket.request.session.user_uuid);
		return;
          }

	        dbController.AddCar(socket.id, socket.request.session.name, socket.request.session.user_uuid, data);
	});




      socket.on('delete_a_car', function(data){
         if(!securityController.CheckValidID(socket.id)&& !securityController.CheckValidUUID(socket.request.session.user_uuid)){
		console.log('Invalid Socket.ID or user_uuid',socket.id, socket.request.session.user_uuid);
		return;
          }

	        dbController.DeleteCar(socket.id, socket.request.session.name, socket.request.session.user_uuid, data);
	});


	socket.on('add_new_lift', function(data){
	  if(!securityController.CheckValidID(socket.id)&& !securityController.CheckValidUUID(socket.request.session.user_uuid)){
		console.log('Invalid Socket.ID or user_uuid',socket.id, socket.request.session.user_uuid);
		return;
          }

	       dbController.AddLift(socket.id, socket.request.session.name, socket.request.session.user_uuid, data);
	});



	socket.on('delete_a_lift', function(data){
	    if(!securityController.CheckValidID(socket.id)&& !securityController.CheckValidUUID(socket.request.session.user_uuid)){
		console.log('Invalid Socket.ID or user_uuid',socket.id, socket.request.session.user_uuid);
		return;
             }

	     dbController.DeleteLift(socket.id, socket.request.session.name, socket.request.session.user_uuid, data);
	 });

	socket.on('enter_home', function(){
             if(securityController.CheckValidUUID(socket.request.session.user_uuid))
		socket.emit('maintain_on');
        });



    socket.on('getLiftsData', function(){
	  if(!securityController.CheckValidID(socket.id)&& !securityController.CheckValidUUID(socket.request.session.user_uuid)){
		console.log('Invalid Socket.ID or user_uuid',socket.id, socket.request.session.user_uuid);
		return;
          }

          console.log('getLiftsData');
	  dbController.QueryLiftsData(socket.id);
    })


    socket.on('getCarsData', function(make, model, year){
	 
	  if(!securityController.CheckValidID(socket.id) && !securityController.CheckValidUUID(socket.request.session.user_uuid))
	  {
		console.log('Invalid Socket.ID or user_uuid',socket.id, socket.request.session.user_uuid);
		return;
          }

          console.log('getCarsData', make,model,year);
	  dbController.QueryCarsData(socket.id, make, model, year);             //1. ====>dbAccess.js
    })


    socket.on('disconnect', function(){
      console.log('client:', socket.id, 'disconnected');
      updateSockets();
	
      sockets.forEach(function(item){
           console.log(item.id, item.connected, item.disconnected);
      });

      securityController.DeleteDisconnected(socket.id);
    });


	socket.on('logout', function(){
		//console.log('*&&&&&&&&&&&&', socket);
		//socketsLogout(socket.request.sessionID, socket.id)
    });

    socket.on('login', function(data){
	       console.log(data.name,'****************');

		if(securityController.CheckAccountLockup(data.name)){
			socket.emit('user_lockup');
			return;
		}

		if (securityController.ValidateUser(data)){
			//socket.request.session.cookie.user_uuid = user_uuid;
			console.log('validUser');
			securityController.AddValidID(socket.id);
			//socket.emit('validUser');
		}
		else{
			console.log('invalid user', data);
			//socket.emit('invalidUser');
		}
    });
  });                       //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  

  event_dbAccess.on('makes', function(socketID, makes){    //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
       var dest_socket = findSocket(socketID);
       if(dest_socket != null){
	   console.log('find sockedID:', socketID);
           dest_socket.emit('getMakes', makes);         //=======##========>opt.js-------------1
	}
	else{
		console.log('not find socketID:', socketID);
	}
  });


  event_dbAccess.on('models', function(socketID, models){
    var dest_socket = findSocket(socketID);
    if(dest_socket != null)
        dest_socket.emit('getModels', models);       //=======##========>opt.js--------------2
  });

  event_dbAccess.on('years', function(socketID, years){
    var dest_socket = findSocket(socketID);
    if(dest_socket != null)
        dest_socket.emit('getYears', years);         //=======##========>opt.js--------------3
  });

  event_dbAccess.on('car_data', function(socketID, data){
    var dest_socket = findSocket(socketID);
    if(dest_socket != null)
        dest_socket.emit('getCarData', data);         //=======##========>opt.js-------------4
  });

  event_dbAccess.on('lifts', function(socketID, data){
    var dest_socket = findSocket(socketID);
    if(dest_socket != null)
        dest_socket.emit('getLifts', data);           ////=======##========>opt.js------------one
  });
  
  event_dbAccess.on('liftData', function(socketID, data){
    var dest_socket = findSocket(socketID);
    if(dest_socket != null)
        dest_socket.emit('getLiftData', data);        ////=======##========>opt.js------------two
  });

  event_dbAccess.on('liftsData', function(socketID, data){
    var dest_socket = findSocket(socketID);
    if(dest_socket != null)
        dest_socket.emit('getLiftsData', data);
  });

  event_dbAccess.on('carsData', function(socketID, data){
    var dest_socket = findSocket(socketID);
    if(dest_socket != null)
        dest_socket.emit('getCarsData', data);        //1. ====>uiCommunications.js
  });                                   //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$4
  event_dbAccess.on('modify_password_yes', function(socketID){
    var dest_socket = findSocket(socketID);
    if(dest_socket != null)
        dest_socket.emit('modify_password_successfully');       
  }); 
  event_dbAccess.on('modify_password_no', function(socketID){
    var dest_socket = findSocket(socketID);
    if(dest_socket != null)
        dest_socket.emit('modify_password_unsuccessfully');       
  }); 
  event_dbAccess.on('user_already_exists', function(socketID){
    var dest_socket = findSocket(socketID);
    if(dest_socket != null)
        dest_socket.emit('add_account_user_already_exists');    
  });
  event_dbAccess.on('create_account_yes', function(socketID){
    var dest_socket = findSocket(socketID);
    if(dest_socket != null)
        dest_socket.emit('add_account_successfully');       
  }); 
  event_dbAccess.on('create_account_no', function(socketID){
    var dest_socket = findSocket(socketID);
    if(dest_socket != null)
       dest_socket.emit('add_account_unsuccessfully');       
  });

  event_dbAccess.on('super_permission', function(socketID,mark){
    var dest_socket = findSocket(socketID);
    if(dest_socket != null){
          if(mark === 'delete')     dest_socket.emit('get_super_permission_delete_account');
          if(mark === 'create')     dest_socket.emit('get_super_permission_create_account');
    }     
  }); 
  event_dbAccess.on('no_super_permission', function(socketID,mark){
    var dest_socket = findSocket(socketID);
    if(dest_socket != null){
          if(mark === 'delete')    dest_socket.emit('no_super_permission_delete_account');
          if(mark === 'create')    dest_socket.emit('no_super_permission_create_account');
    }      
  });

  event_dbAccess.on('delete_account_yes', function(socketID){
    var dest_socket = findSocket(socketID);
    if(dest_socket != null)
       dest_socket.emit('delete_account_successfully');       
  });
  event_dbAccess.on('delete_account_no', function(socketID){
    var dest_socket = findSocket(socketID);
    if(dest_socket != null)
        dest_socket.emit('delete_account_unsuccessfully');       
  }); 

  event_dbAccess.on('carsLog', function(socketID, data){
    var dest_socket = findSocket(socketID);
    if(dest_socket != null)
        dest_socket.emit('getCarsLog', data);       
  }); 

  event_dbAccess.on('liftsLog', function(socketID, data){
    var dest_socket = findSocket(socketID);
    if(dest_socket != null)
        dest_socket.emit('getLiftsLog', data);
  });
  event_dbAccess.on('allAdministratorsFromLogs', function(socketID, data){
    var dest_socket = findSocket(socketID);
    if(dest_socket != null)
        dest_socket.emit('AdministratorsFromDatabase_logs', data);
  });
  event_dbAccess.on('allAdministratorsFromAdministrators', function(socketID, data){
    var dest_socket = findSocket(socketID);
    if(dest_socket != null)
        dest_socket.emit('AdministratorsFromDatabase_administratrors', data);
  });


  console.log('initialize uiCommunications');
}    //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@












