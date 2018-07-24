var mysql = require('mysql');
var config = require('../config.js');
var securityController = require('../securityController.js');

/*
logger.log();
logger.log('*************************************************************************************logs for PointCloud system***************************************************************************************');
logger.log('The server starts working at '+new Date().toString()+'=================================================================================================================================');
logger.error('error.log');
*/


Array.prototype.sortAndUnique = function(){
  console.log('sort and unique');
  this.sort();
  var res = [this[0]];  

  for(var i = 1; i < this.length; i++){
    if(this[i] !== res[res.length - 1])
      res.push(this[i]);
  }
  return res;
}

module.exports = function(event){      // in file uiCommunications.js, var dbController = new dbAccess(event_dbAccess);

 
var conn = mysql.createConnection({    //create conn to connect the database db which includes two tables(car,lift)
  host: "localhost",
  user: "root",
  password: "root",
  database:"db"
});

conn.connect(function(err) {
  if (err) throw err;
  console.log("MySQL-Database db Connected!");
});

var con = mysql.createConnection({     //create con to connect the database logs which includes two tables(car_log,lift_log)
  host: "localhost",
  user: "root",
  password: "root",
  database:"logs"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("MySQL-Database logs Connected!");
});

var con_admin = mysql.createConnection({     //create con to connect the database administrartors which includes table admin
  host: "localhost",
  user: "root",
  password: "root",
  database:"administrators"
});

con_admin.connect(function(err) {
  if (err) throw err;
  console.log("MySQL-Database administrators Connected!");
});

  this.QueryAllMakes = function(id){

    var makes = new Array();

      conn.query("select make from car", function(err, rows){
		
	rows.forEach(function(e){
           makes.push(e.make);
       });	
		
        makes = makes.sortAndUnique();
        
        console.log('makes id:',id);
        event.emit('makes',id, makes);      //======##=====>uiCommunications.js------------1
   });

  }


  this.QueryModels = function(id, make){

    var models = new Array();
    var currentMake = make


      var query = "select model from car where make = \'"  + currentMake + "\'";
      console.log(query);

      conn.query(query, function(err, rows){
        rows.forEach(function(e){
             models.push(e.model);
        });
        models = models.sortAndUnique();
        event.emit('models', id, models);    //======##=====>uiCommunications.js--------------2
        if(config.DB_DEBUG) console.log(models);
      });

  }


  this.QueryYears = function(id, make, model){

    var years = new Array();
    var currentMake = make;
    var currentModel = model;

    
      var query = "select year from car where make = \'"  + currentMake + "\' and model = \'" + currentModel + "\'";
      console.log(query);
      conn.query(query, function(err, rows){
	console.log('year rows', rows);
        rows.forEach(function(e){years.push(e.year);});
        years = years.sortAndUnique();
        event.emit('years', id, years);    //======##=====>uiCommunications.js--------------3
        if(config.DB_DEBUG) console.log(years);
     
    });
  }


  this.QueryCarData = function(id, make, model, year){
     
      var query = "select front,rear,leng from car where make = \'"  + make + "\' and model = \'" + model + "\' and year=\'" + year + "\'";
      console.log(query);
      conn.query(query, function(err, rows){
      /*if(config.DB_DEBUG) */console.log('front/rear/length', rows);
     event.emit('car_data', id, rows);         //======##=====>uiCommunications.js--------------4

    });  
  }

  this.QueryLift = function(id){

	var lifts = new Array();
        var query= "select lift_name from lift";
        console.log(query);

        conn.query(query, function(err, rows){
        rows.forEach(function(item){lifts.push(item.lift_name);});
	if(config.DB_DEBUG) console.log('lifts', lifts);
           event.emit('lifts', id, lifts);         //======##=====>uiCommunications.js--------------one
      });
  
  }

  this.QueryLiftData = function(id, lift){

      var query = "select * from lift where lift_name = \'" + lift + "\'"
      console.log(query);

      conn.query(query, function(err, rows){
        if(config.DB_DEBUG) console.log('liftData:', rows);
        event.emit('liftData', id, rows);     //======##=====>uiCommunications.js--------------two
      });

  }


  this.QueryLiftsData = function(id){    

      var query = "select * from lift"
      console.log(query);

      conn.query(query, function(err, rows){
        if(config.DB_DEBUG) console.log('liftsData:', rows);
           event.emit('liftsData', id, rows);
      });

  }


  this.QueryCarsData = function(id, make, model, year){

 //var query = "select front,rear,leng from car where make = \'"  + make + "\' and model = \'" + model + "\' and year=\'" + year + "\'";
    var queryCondition = null;
    var query = "select front,rear,leng,make,model,year from car ";

    if(make != undefined){
		if (model != undefined){
		  if(year != undefined){queryCondition = "where make=\'"+make+"\' and model=\'"+model+"\' and year=\'"+year+"\'";} // make model year
          else {queryCondition = "where make=\'"+make+"\' and model=\'"+model+"\'";}//make model 		
		}
		else{ queryCondition = "where make=\'"+make+"\'";} // make
	}
    //default all;
	if(queryCondition)
		query += queryCondition;

    console.log(query);

    conn.query(query, function(err, rows){
        if(config.DB_DEBUG) console.log('carData:', rows);
          event.emit('carsData', id, rows);                    //1. ====>uiCommunications.js
    });
  }


//=============================>  created by caden,03/05/2018,query all logs from mysql logs database.
 this.QueryCarsLog = function(id){    

      var query = "select * from car_log";
      console.log(query);

      con.query(query, function(err, rows){
        if(config.DB_DEBUG) console.log('CarsData:', rows);
           event.emit('carsLog', id, rows);
      });

  }

  this.QueryLiftsLog = function(id){    

      var query = "select * from lift_log";
      console.log(query);

      con.query(query, function(err, rows){
        if(config.DB_DEBUG) console.log('liftsData:', rows);
           event.emit('liftsLog', id, rows);
      });

  }
//<==================================

//=============================>  created by caden,03/05/2018,query logs by administrator from mysql logs database.
 this.QueryCarsLogByAdministrator = function(id, administrator){    

      var query = "select * from car_log where user = \'"+ administrator+"\'";
      console.log(query);

      con.query(query, function(err, rows){
        if(config.DB_DEBUG) console.log('LogsData:', rows);
           event.emit('carsLog', id, rows);
      });

  }
//<==================================
//<==================================created by caden,03/05/2018,query logs from mysql logs database 
  this.QueryLiftsLogByAdministrator = function(id, administrator){    

      var query = "select * from lift_log where user = \'"+administrator+"\'";
      console.log(query);

      con.query(query, function(err, rows){
        if(config.DB_DEBUG) console.log('liftsData:', rows);
           event.emit('liftsLog', id, rows);
      });

  }
//<==================================
//=============================>  created by caden,09/05/2018,query all administrator from mysql administrators database
 this.QueryAllAdministratorsFromDatabaseAdministrators = function(id){    

      var query = "select * from admin";
      console.log(query);

      con_admin.query(query, function(err, rows){
        if(config.DB_DEBUG) console.log('administratorsDataFromAdministrators:', rows);
           event.emit('allAdministratorsFromAdministrators', id, rows);
      });

  }
//<==================================
//=============================>  created by caden,07/05/2018,query all administrator from mysql logs database
 this.QueryAllAdministratorsFromDatabaseLogs = function(id){    

      var query = "select user from car_log union select user from lift_log";
      console.log(query);

      con.query(query, function(err, rows){
        if(config.DB_DEBUG) console.log('administratorsDataFromLogs:', rows);
           event.emit('allAdministratorsFromLogs', id, rows);
      });

  }
//<==================================
//=============================>  created by caden,09/05/2018,query administrator's jurisdiction from mysql administrators database
 this.QuerySuperPermission = function(id,username,password,mark){    

      var query = "select level from admin ";
      var queryCondition = "where user=\'" + username + "\' and password=\'"+ password+"\'";
      query += queryCondition;
      console.log(query);

      con_admin.query(query, function(err, rows){
            if(rows){
                   if(rows.length === 1){
                             if(rows[0].level === 1)  event.emit('super_permission', id, mark);
                             if(rows[0].level === 0)  event.emit('no_super_permission', id, mark);
                    }

             }
      });

  }
//<==================================
//=============================>  created by caden,09/05/2018,modify administrator's password in database.
 this.ModifyAdministratorPassword = function(id,username,old_password,new_password){    

      var query = "select * from admin ";
      var queryCondition = "where user=\'" + username + "\' and password=\'"+ old_password+"\'";
      query += queryCondition;
      console.log(query);

      con_admin.query(query, function(err, rows){
            if(rows){
                   if(rows.length > 0){
                              var query = "update admin ";
                              var queryCondition = "set password=\'" + new_password + "\' where user=\'"+ username+"\' and password=\'"+old_password+"\'";
                              query += queryCondition;
                              console.log(query);
                       con_admin.query(query, function(err, rows){
                                 console.log(err);
                                 console.log(rows);
                           if(err == null){
                                 event.emit('modify_password_yes', id);
                                 securityController.ModifyPassword(username,old_password,new_password);                 
                           }
                           else     event.emit('modify_password_no', id);
                       });
                    }
                    else  event.emit('modify_password_no', id);

             }
      });

  }
//<==================================
//=============================>  created by caden,09/05/2018,create new administrator account in database.
 this.AddNewAccount = function(id,username,password,level){    

      var query = "select * from admin ";
      var queryCondition = "where user=\'" + username + "\'";
      query += queryCondition;
      console.log(query);

      con_admin.query(query, function(err, rows){
            if(rows){
                   if(rows.length > 0){                  //user already exists!! can not create new account
                        event.emit('user_already_exists', id);
                    }
                    else{
              
                              var query = "insert into admin values";
                              var queryCondition = "(null,\'" + username + "\',\'"+ password+"\',\'"+level+"\')";
                              query += queryCondition;
                              console.log(query);
                         con_admin.query(query, function(err, rows){
                                 console.log(err);
                                 console.log(rows);
                             if(err == null){     
                               event.emit('create_account_yes', id);
                               securityController.AddAccount(username,password,level);
                             }
                             else     event.emit('create_account_no', id);
                         });
                    }
  
             }
      });

  }
//<==================================
//=============================>  created by caden,09/05/2018,delete the existed account in database.
 this.DeleteExistAccount = function(id,username,password,level){    

      var query = "select * from admin ";
      var queryCondition = "where user=\'" + username + "\'";
      query += queryCondition;
      console.log(query);

      con_admin.query(query, function(err, rows){
            if(rows){
                    if(rows.length > 0){     
                              var query = "delete from admin where ";
                              var queryCondition = "user=\'" + username + "\' and password=\'"+ password+"\' and level=\'"+level+"\'";
                              query += queryCondition;
                              console.log(query);
                         con_admin.query(query, function(err, rows){
                                 console.log(err);
                                 console.log(rows);
                             if(err == null){
                                     event.emit('delete_account_yes', id);
                                     securityController.DeleteAccount(username,password,level)
                             }
                             else     event.emit('delete_account_no', id);
                         });
                    }
  
             }
      });

  }
//<==================================
//=============================>  created by caden,03/05/2018,query all administrator from mysql logs database.
  this.UpdateLift = function(id, user, data){
	var query = "update lift set WT=" + data.WT + ", PD=" + data.PD + ", LCF=" + data.LCF + ", LCR=" + data.LCR + ", RFE=" + data.RFE + ", RFR=" + data.RFR + ", RRE=" + data.RRE + ", RRR=" + data.RRR + ", DAP=" + data.DAP + ", YO=" + data.YO + ", WOF=" + data.WOF + ", WOR=" + data.WOR + " ";
	var queryCondition = "where lift_name=\'" + data.lift_name + "\'";
	query += queryCondition;
	console.log(query);
	conn.query(query);
                 // insert operation information into lift_log table
                 var now = new Date();
                 var time = now.getFullYear()+"-"+(parseInt(now.getMonth())+1)+"-"+now.getDate()+" "+now.getHours()+":"+now.getMinutes()+":"+now.getSeconds();
                 var query_clause = "insert into lift_log (user,date,operation,liftname,description) values";
                 var query_clause_condition = "(\'"+user+"\',\'"+time+"\',\'"+"Modified"+"\',\'"+data.lift_name+"\',\'WT="+data.WT+",PD="+data.PD+",LCF="+data.LCF+",LCR="+data.LCR+",RFE="+data.RFE+",RFR="+data.RFR+",RRE="+data.RRE+",RRR="+data.RRR+",DAP="+data.DAP+",YO="+data.YO+",WOF="+data.WOF+",WOR="+data.WOR+"\')";
                 query_clause += query_clause_condition;
console.log(query_clause);
                 con.query(query_clause,function(err,row){
                      if(err) console.log('insert add lift information into lift_log database failed ', err);
                 });

  }  


  this.AddLift = function(id, user, uuid, data){
        var self = this;

	var query = "select * from lift ";
	var queryCondition = "where lift_name=\'" + data.lift_name + "\'";
	query += queryCondition;
    //console.log(query);
	conn.query(query, function(err, rows){
		
	  //console.log(query, rows, rows.length);
	  if(rows){
	      if(rows.length > 0){
                     if(!((rows[0].WT == data.WT) && (rows[0].PD == data.PD) && (rows[0].LCF == data.LCF) && (rows[0].LCR == data.LCR) && (rows[0].RFE == data.RFE) && (rows[0].RFR == data.RFR) && (rows[0].RRE == data.RRE) && (rows[0].RRR == data.RRR) && (rows[0].DAP == data.DAP) && (rows[0].YO == data.YO) && (rows[0].WOF == data.WOF) && (rows[0].WOR == data.WOR))){
		            console.log(query, rows, err, 'update record', rows.length);
		            self.UpdateLift(id, user, data);
                     }
	      }
	      else{
		 // console.log(query, rows, err, 'new record', rows.length);
		 // self.AddCar(id, recordJSON);

 	         var query = "insert into lift values";
	         var queryCondition = "(\'" + data.lift_name+"\'," + data.WT + "," + data.PD + "," + data.LCF + "," + data.LCR + "," + data.RFE + "," + data.RFR + "," + data.RRE + "," + data.RRR + "," + data.DAP + "," + data.YO + "," + data.WOF + "," + data.WOR +")";
	         query += queryCondition;
	         console.log(query);
	         conn.query(query);

                 // insert operation information into lift_log table
                 var now = new Date();
                 var time = now.getFullYear()+"-"+(parseInt(now.getMonth())+1)+"-"+now.getDate()+" "+now.getHours()+":"+now.getMinutes()+":"+now.getSeconds();
                 var query_clause = "insert into lift_log (user,date,operation,liftname,description) values";
                 var query_clause_condition = "(\'"+user+"\',\'"+time+"\',\'"+"Added"+"\',\'"+data.lift_name+"\',\'WT="+data.WT+",PD="+data.PD+",LCF="+data.LCF+",LCR="+data.LCR+",RFE="+data.RFE+",RFR="+data.RFR+",RRE="+data.RRE+",RRR="+data.RRR+",DAP="+data.DAP+",YO="+data.YO+",WOF="+data.WOF+",WOR="+data.WOR+"\')";
                 query_clause += query_clause_condition;
                 con.query(query_clause,function(err,row){
                      if(err) console.log('insert add lift information into lift_log database failed ', err);
                 });
                // logger.log(new Date()+", user:"+user+", Add a lift,"+query);     //write records into access.log
	       }
          }
     
    });
  }



  this.DeleteLift = function(id, user, uuid, data){
        var query = "delete from lift ";
	var queryCondition = "where lift_name=\'" + data.lift_name + "\'";
	query += queryCondition;
	console.log(query);
	conn.query(query);
        // insert operation information into lift_log table

        var now = new Date();
        var time = now.getFullYear()+"-"+(parseInt(now.getMonth())+1)+"-"+now.getDate()+" "+now.getHours()+":"+now.getMinutes()+":"+now.getSeconds();
        var query_clause = "insert into lift_log (user,date,operation,liftname,description) values";
        var query_clause_condition = "(\'"+user+"\',\'"+time+"\',\'"+"Deleted"+"\',\'"+data.lift_name+"\',\'WT="+data.WT+",PD="+data.PD+",LCF="+data.LCF+",LCR="+data.LCR+",RFE="+data.RFE+",RFR="+data.RFR+",RRE="+data.RRE+",RRR="+data.RRR+",DAP="+data.DAP+",YO="+data.YO+",WOF="+data.WOF+",WOR="+data.WOR+"\')";
        query_clause += query_clause_condition;
        con.query(query_clause,function(err,row){
            if(err) console.log('insert delete lift information into lift_log database failed ', err);
        });
       // logger.log(new Date()+", user:"+user+", Delete a lift,"+query);     //write records into access.log
  }


  this.UpdateCar = function(id, user, data){
 	var query = "update car set front=" + data.front + ", rear=" + data.rear + ", leng=" + data.leng + " ";
	var queryCondition = "where make=\'" + data.make + "\' and model=\'" + data.model.replace(/\'/g,'ft') +"\' and year=\'" + data.year + "\'";
	query += queryCondition;
	console.log(query);
	conn.query(query);
                 // insert operation information into car_log table
                 var now = new Date();
                 var time = now.getFullYear()+"-"+(parseInt(now.getMonth())+1)+"-"+now.getDate()+" "+now.getHours()+":"+now.getMinutes()+":"+now.getSeconds();
                 var query_clause = "insert into car_log (user,date,operation,make,model,year,description) values";
                 var query_clause_condition = "(\'"+user+"\',\'"+time+"\',\'"+"Modified"+"\',\'"+data.make+"\',\'"+data.model.replace(/\'/g,'ft')+"\',\'"+data.year+"\',\'"+"front="+data.front+",rear="+data.rear+",length="+data.leng+"\')";
                 query_clause += query_clause_condition;
console.log(query_clause);
                 con.query(query_clause,function(err,row){
                      if(err) console.log('insert add car information into car_log database failed ', err);
                 });

  }  


  this.AddCar = function(id, user, uuid, data){
        var self = this;
	var query = "select * from car ";
	var queryCondition = "where make=\'" + data.make + "\' and model=\'" + data.model.replace(/\'/g,'ft') + "\' and year=\'" + data.year + "\'";
	query += queryCondition;
    //console.log(query);
	conn.query(query, function(err, rows){
		
	  //console.log(query, rows, rows.length);
	  if(rows){
		if(rows.length > 0){
                       if(!((rows[0].front == data.front) && (rows[0].rear == data.rear) && (rows[0].leng == data.leng))){
		                  console.log(query, rows, err, 'update record', rows.length);
		                  self.UpdateCar(id, user, data);
                       }
		}
	        else{
		   // console.log(query, rows, err, 'new record', rows.length);
		   // self.AddCar(id, recordJSON);

 	          var query = "insert into car (front,rear,leng,make,model,year) values";
	          var queryCondition = "("+data.front+","+ data.rear +"," + data.leng +",\'" + data.make + "\',\'" + data.model.replace(/\'/g,'ft') + "\',\'" + data.year + "\')";
	          query += queryCondition;
	          conn.query(query,function(err,rows){
                               console.log("***"+query+err)
                  });

                 // insert operation information into car_log table
                 var now = new Date();
                 var time = now.getFullYear()+"-"+(parseInt(now.getMonth())+1)+"-"+now.getDate()+" "+now.getHours()+":"+now.getMinutes()+":"+now.getSeconds();
                 var query_clause = "insert into car_log (user,date,operation,make,model,year,description) values";
                 var query_clause_condition = "(\'"+user+"\',\'"+time+"\',\'"+"Added"+"\',\'"+data.make+"\',\'"+data.model.replace(/\'/g,'ft')+"\',\'"+data.year+"\',\'"+"front="+data.front+",rear="+data.rear+",length="+data.leng+"\')";
                 query_clause += query_clause_condition;
                 con.query(query_clause,function(err,row){
                      if(err) console.log('insert add car information into car_log database failed ', err);
                 });

                   //logger.log(new Date()+", user:"+user+", Create a car,"+query);     //write records into access.log
	         }

	  }
    });
  }


  this.DeleteCar = function(id, user, uuid, data){
    var query = "delete from car ";
	var queryCondition = "where make=\'" + data.make + "\' and model=\'" + data.model +"\' and year=\'" + data.year + "\'";
	query += queryCondition;
	console.log(query);
	conn.query(query);

        // insert operation information into car_log table
        var now = new Date();
        var time = now.getFullYear()+"-"+(parseInt(now.getMonth())+1)+"-"+now.getDate()+" "+now.getHours()+":"+now.getMinutes()+":"+now.getSeconds();
        var query_clause = "insert into car_log (user,date,operation,make,model,year,description) values";
        var query_clause_condition = "(\'"+user+"\',\'"+time+"\',\'"+"Deleted"+"\',\'"+data.make+"\',\'"+data.model+"\',\'"+data.year+"\',\'"+"front="+data.front+",rear="+data.rear+",length="+data.leng+"\')";
        query_clause += query_clause_condition;
        con.query(query_clause,function(err,row){
          if(err) console.log('insert delete car information into car_log database failed ', err);
        });

       // logger.log(new Date()+", user:"+user+", Delete a car,"+query);     //write records into access.log
  }
 

  this.BatchUploadCar = function(id, user, uuid, data){
         var self = this;
	   //console.log(typeof(data), data.length);
         data.forEach(function(record, index){
	   //console.log(record)
         if(record.length !== 6){
 	    console.log(record, index, 'is invalid');
	    return;	
	 }
         if(record[3] == 'make' || record[4] == 'model' || record[5] == 'year'){
 	    console.log(record, index, 'is invalid');
	    return;	
         }

	  var recordJSON = {make:'',model:'',year:'',front:0,rear:0,leng:0};
	  recordJSON.make = record[3];
	  recordJSON.model = record[4];
	  recordJSON.year = record[5];
	  recordJSON.front = record[0];
	  recordJSON.rear = record[1];
	  recordJSON.leng = record[2];
	  try{
	      
	  self.AddCar(id, user, uuid, recordJSON);
             
          }catch(error){
                console.log(recordJSON+error);
          }
          })
  }


  this.BatchUploadLift = function(id, user, uuid, data){
         var self = this;
	 data.forEach(function(record, index){
         if(record.length !== 13){
 	        console.log(record, index, 'is invalid');
		return;	
	  }
          if(record[0] == 'lift_name'){
 	        console.log(record, index, 'is invalid');
		return;	
	  }

	  var recordJSON = {lift_name:'',WT:'', PD:'', LCF:0, LCR:0, RFE:0, RFR:0, RRE:0, RRR:0, DAP:0, YO:0, WOF:0, WOR:0};
	  recordJSON.lift_name = record[0];
	  recordJSON.WT = record[1];
	  recordJSON.PD = record[2];
	  recordJSON.LCF = record[3];
	  recordJSON.LCR = record[4];
	  recordJSON.RFE = record[5];
	  recordJSON.RFR = record[6];
	  recordJSON.RRE = record[7];
	  recordJSON.RRR = record[8];
	  recordJSON.DAP = record[9];
	  recordJSON.YO = record[10];
	  recordJSON.WOF = record[11];
	  recordJSON.WOR = record[12];


	  self.AddLift(id, user, uuid, recordJSON);

	});
  }


}






































