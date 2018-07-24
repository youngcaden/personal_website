
var config = require('./config.js');
var fs = require('fs');
var securityObj = null;
var validUserArray = new Array();
var validUUID = new Array();
var validID = new Array();

var invalidAccounts = {};

function UnlockLockedAccount(userName){
  if(invalidAccounts.hasOwnProperty(userName))
	delete invalidAccounts[userName];

  if(config.isSecurityLog)
	console.log('UnlockLockedAccount',invalidAccounts);
}

function CheckAccountLockup(userName){
  if(invalidAccounts.hasOwnProperty(userName) && invalidAccounts[userName].isLockup){
	if(config.isSecurityLog)
	  console.log(invalidAccounts);
	return true;
  }

  if(config.isSecurityLog)
	console.log('CheckAccountLockup**',invalidAccounts);
  return false;
}

function UpdateInvalidAccount(userName){

  if(invalidAccounts.hasOwnProperty(userName)){
	invalidAccounts[userName].count += 1;
	if(invalidAccounts[userName].count >= config.accountLockUpCount)
		invalidAccounts[userName].isLockup = true;
  }
  else{
	invalidAccounts[userName] = {count:0, isLockup:false};
  }

  if(config.isSecurityLog)
	console.log('UpdateInvalidAccount',invalidAccounts);
}

function Initialize(rows){
     securityObj = rows;
     console.log(securityObj);
/*
	securityObj=JSON.parse(fs.readFileSync(config.securityFilePath));   
        console.log(securityObj);
*/
}

function ValidateUser(user){
	for (var i in securityObj){
		if (securityObj[i].user === user.name){
			if (securityObj[i].password === user.password)
				return true;
		}	
	}
	return false;
}

//===========================>modify user's password, modify info in security.json
function ModifyPassword(username,old_password,new_password){
	for (var i in securityObj){
		if ((securityObj[i].user === username) && (securityObj[i].password === old_password)){
                        securityObj[i].password = new_password; 
/* 
                        var t = JSON.stringify(securityObj);
                        fs.writeFileSync('./security.json',t,'utf8');
	                securityObj=JSON.parse(fs.readFileSync(config.securityFilePath));    //update acccount information in memory-cache.
                        console.log(securityObj);
                        return true; 
*/
		}	
	}
          
    //    return false;
}
//<============================
//============================>add a new account, write info into security.json
function AddAccount(username,password,level){
       var data =[{"user":username,"password":password,"level":level}];
       //result = result.concat(data);
      securityObj = securityObj.concat(data);
/*
       var result = securityObj.concat(data); 
       var t = JSON.stringify(result);
       fs.writeFileSync('./security.json',t,'utf8');
       securityObj=JSON.parse(fs.readFileSync(config.securityFilePath));   //update acccount information in memory-cache. 
       console.log(securityObj);
       return true;
*/

}
//<============================
//============================>delete an existing account, delete part info in security.json
function DeleteAccount(username,password,level){
                        console.log(username+password+level);
	for (var i in securityObj){
		if ((securityObj[i].user === username) && (securityObj[i].password === password) && (securityObj[i].level === level)){
                        securityObj.splice(i,1);
/*
                        var t = JSON.stringify(securityObj);
                        fs.writeFileSync('./security.json',t,'utf8');
	                securityObj=JSON.parse(fs.readFileSync(config.securityFilePath));    //update acccount information in memory-cache.
                        console.log(securityObj);
                        return true; 
*/
		}	
	}
          
   //     return false;

}
//<=============================
function DeleteDisconnected(id){
  for(i=0;i<validID.length;i++) {
    if(validID[i] == id){
      validID.splice(i,1);
        //console.log('**********','	valid_uuids:', validUUID);
    }
  } 
}

function CheckValidID(id){
  for(i=0;i<validID.length;i++) {
    if(validID[i] == id)
      return true;
  } 
  
  return false;
}

function AddValidID(id){
 for(i=0;i<validID.length;i++) {
    if(validID[i] == id)
      return;
  } 

  validID.push(id);
}

function AddValidUUID(uuid){
  
  for(i=0;i<validUUID.length;i++) {
    if(validUUID[i] == uuid)
      return;
  } 

  validUUID.push(uuid);
}

function CheckValidUUID(uuid){
  for(i=0;i<validUUID.length;i++) {
    if(validUUID[i] == uuid)
      return true;
  } 
  
  return false;
}

function UpdateValidUUID(array){

}

function DeleteValidUUID(uuid){
  console.log('delete uuid', uuid, '	valid_uuids:', validUUID);
  for(i=0;i<validUUID.length;i++) {
    if(validUUID[i] == uuid){
      validUUID.splice(i,1);
        console.log('**********','	valid_uuids:', validUUID);
    }
  } 
}

module.exports.DeleteDisconnected = DeleteDisconnected;
module.exports.AddValidID = AddValidID;
module.exports.CheckValidID = CheckValidID;

module.exports.CheckAccountLockup = CheckAccountLockup;
module.exports.UpdateInvalidAccount = UpdateInvalidAccount;
module.exports.UnlockLockedAccount = UnlockLockedAccount;

module.exports.ValidateUser = ValidateUser;
module.exports.Initialize = Initialize;
module.exports.AddValidUUID = AddValidUUID;
module.exports.CheckValidUUID = CheckValidUUID;
module.exports.DeleteValidUUID = DeleteValidUUID;

module.exports.ModifyPassword = ModifyPassword;
module.exports.AddAccount = AddAccount;
module.exports.DeleteAccount = DeleteAccount;

