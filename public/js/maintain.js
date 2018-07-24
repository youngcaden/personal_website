
/*

   version:01; tag:[Caden 2018-04-12.01]

   version:00; initial
*/


var socket = io.connect();
var makesArray = new Array();
var modelsArray = new Array();
var yearsArray = new Array();
var selectedCarCSV;
var uploadedData=new Array();
var currentTable = "cars";
var radioOptionIndex = 0;
var tbodyName;
var make, model, year;
var isBatchSubmitted = false;

var user_modify_password={};
var user_add_account={};
var user_delete_account={};

$(document).ready(function(){
  updateClient();

  socket.on('getLiftsData', function(data){UpdateMaintainLiftsTable(data);});
  socket.on('getCarsData', function(data){UpdateMaintainCarsTable(data);});
  socket.on('getMakes', function(_makesArray){makesArray = _makesArray});
  socket.on('getModels', function(_modelsArray){modelsArray = _modelsArray});
  socket.on('getYears', function(_yearsArray){yearsArray = _yearsArray});

  socket.on('logout', function(){
    alert('maintain logout');
  });  
//added by Caden On 04/12/2018
//=======================>[Caden 2018-04-12.01]
  socket.on('modify_password_successfully',function(){
           $('#modify_password_results').show();

   });
  socket.on('modify_password_unsuccessfully',function(){
           $('#modify_password_results_no').show();

   });
  socket.on('add_account_user_already_exists',function(){
           $('#add_account_user_exists').show();

   });
  socket.on('add_account_successfully',function(){
           $('#add_account_results').show();

   });
  socket.on('add_account_unsuccessfully',function(){
           $('#add_account_results_no').show();

   });
  socket.on('delete_login_user_refused',function(){
           $('#delete_login_user_refused').show();

   });
  socket.on('delete_account_successfully',function(){
           $('#delete_account_results').show();

   });
  socket.on('delete_account_unsuccessfully',function(){
           $('#delete_account_results_no').show();

   });
//control display contents for SuperAdministrator and OrdinaryAdministrators
  socket.on('get_super_permission_create_account',function(){
           $("#add_account_panel").slideToggle("fast");       //$('#add_account_panel').show();
  });
  socket.on('no_super_permission_create_account',function(){
           alert('Sorry,you don\'t have permission to create new account!')
  });
  socket.on('get_super_permission_delete_account',function(){
           socket.emit('getAdminsFrom_administrators');
           $("#delete_account_panel").slideToggle("fast");       //$('#delete_account_panel').show();
  });
  socket.on('no_super_permission_delete_account',function(){
           alert('Sorry,you don\'t have permission to delete account!')
  });
//All administrators can't modify others' password.
  socket.on('input_user_name_error',function(){
           $('#modify_password_user_status').show(); 
  });

//<=======================[Caden 2018-04-12.01]

  socket.on('AdministratorsFromDatabase_administratrors', function(data){        //purpose is to display all administrators' information for SuperAdministrator .

           UpdateAllAdministrators(data);
         
  });


});


function updateClient(){
  $('#client_id').css("height", $('html body').height()-$('.header').height());
  DisplayMaintainCarsTable();
// import papaparse.min.js library file to parse car.csv file uploaded from user in maintain.js
  $("#file_cars").change(function(evt){
    var file = evt.target.files[0];

    Papa.parse(file, {              
      complete: function(results) {
		uploadedData = results.data;
        DisplayUploadedCarsTable(results.data);
      }
    });
  });
// parse lift.csv file uploaded from user in maintain.js
  $("#file_lifts").change(function(evt){
    var file = evt.target.files[0];
 
    Papa.parse(file, {
      complete: function(results) {
        uploadedData = results.data;
        DisplayUploadedLiftsTable(results.data);
      }
    });
  });

  $('#batch_submit').click(function(){
        $('.modify_information').hide();
	BatchUpload(uploadedData);
	$('#batch_submit').hide();
	isBatchSubmitted = true;
  });

  $('#radio_car_batch').change(function(){
    $('.modify_information').hide();
    //alert('radio_car_batch');
    document.getElementById("file_cars_form").reset();
    disableRadioOptions();
    $('#uplod_car_span').css("color", "yellow");
    $('#file_cars').attr("disabled", false);
    $('#file_cars').css('color', "MediumSpringGreen");
    radioOptionIndex = 0;
    uploadedData.splice(0, uploadedData.length)
    DisplayMaintainCarsTable();
    currentTable='cars';
  });

  $('#radio_add_single_car').change(function(){
    $('.modify_information').hide();
    //alert('radio_add_single_car');
    disableRadioOptions();
    $('#maitain_single_car_span').css("color", "yellow");
    $('#add_new_record').show();
    DisplayMaintainCarsTable();
    radioOptionIndex = 1;
    uploadedData.splice(0, uploadedData.length);
    currentTable='cars';
  });

  $('#radio_modify_db_cars').change(function(){
    $('.modify_information').hide();
    socket.emit("getCarsData");
    disableRadioOptions();
    $('#modify_db_cars_span').css('color', 'yellow');
    radioOptionIndex = 2;
    uploadedData.splice(0, uploadedData.length)
    $('#fliter_lift').hide();
    $('#fliter_car').show();
    socket.emit("getMakes");
    currentTable='cars';
  });

  $('#radio_lift_batch').change(function(){
    $('.modify_information').hide();
    document.getElementById("file_lifts_form").reset();
    disableRadioOptions();
    $('#upload_lift_span').css("color", "yellow");
    $('#file_lifts').attr('disabled', false);
    $('#file_lifts').css('color', "MediumSpringGreen");
    radioOptionIndex = 3;
    uploadedData.splice(0, uploadedData.length)
    DisplayMaintainLiftsTable();
    currentTable='lifts';
  });

  $('#radio_add_single_lift').change(function(){
    $('.modify_information').hide();
    //alert('radio_add_single_lift');
    disableRadioOptions();
    $('#maintain_single_lift_span').css('color', 'yellow');
    $('#add_new_record').show();
    DisplayMaintainLiftsTable();
    radioOptionIndex = 4;
    uploadedData.splice(0, uploadedData.length);
    currentTable='lifts';
  });


  $('#radio_modify_db_lifts').change(function(){
    $('.modify_information').hide();
    socket.emit("getLiftsData");
    disableRadioOptions();
    $('#modify_db_lifts_span').css('color', 'yellow');
    radioOptionIndex = 5;
    uploadedData.splice(0, uploadedData.length);
    currentTable='lifts';
  });

  $('#add_new_record').click(function(){
    AddNewRecord();
  });
//==========================>[Caden 2018-04-12.01]
  $('#modify_password').bind('click', function(){
     $("#modify_password_panel").slideToggle("fast");      // $('#modify_password_panel').show();
     $('#add_account_panel').hide();
     $('#delete_account_panel').hide();
  });

  $('#add_account').bind('click', function(){ 
           $('#modify_password_panel').hide();
           $('#add_account_panel').hide();
           $('#delete_account_panel').hide();
           socket.emit('query_super_permission_create_account');
/*
           socket.on('get_super_permission_create_account',function(){
               $('#modify_password_panel').hide();
               $('#add_account_panel').show();
               $('#delete_account_panel').hide();
           });
           socket.on('no_super_permission_create_account',function(){
                alert('Sorry,you don\'t have permission to create new account!')
           });
*/
  });

  $('#delete_account').bind('click', function(){
           $('#modify_password_panel').hide();
           $('#add_account_panel').hide();
           $('#delete_account_panel').hide();
           socket.emit('query_super_permission_delete_account');
/*
         socket.on('get_super_permission_delete_account',function(){
              $('#modify_password_panel').hide();
              $('#add_account_panel').hide();
              $('#delete_account_panel').show();
         });
         socket.on('no_super_permission_delete_account',function(){
              alert('Sorry,you don\'t have permission to delete account!')
         });
*/
  });

/*
  $('.close_box').mouseenter(function(){      
            var wValue=1.5 * $(this).width();  
            var hValue=1.5 * $(this).height();        
            $(this).stop().animate({width: wValue,  
                            height: hValue,  
                            left:("-"+(0.5 * $(this).width())/2),  
                            top:("-"+(0.5 * $(this).height())/2)}, 100);  
        }).mouseleave(function(){  
            var wValue=2/3 * $(this).width();  
            var hValue=2/3 * $(this).height(); 
            $(this).stop().animate({width: wValue,  
                                         height: hValue,  
                                         left:"0px",  
                                         top:"0px"}, 100 );  
        });  
*/

  $('.close_box').click(function(){   
          $('.modify_information').slideUp("fast");     //$('.modify_information').hide();
          $('#modify_pwd_user_name').val("");
          $('#modify_pwd_old_passwd').val("");
          $('#modify_pwd_user_passwd').val("");
          $('#modify_pwd_confirm_user_passwd').val("");
          $('#add_acc_user_name').val("");
          $('#add_acc_user_passwd').val("");
          $('#add_acc_confirm_user_passwd').val("");
          $('#add_acc_create_super_administrator').val("");
          $('#del_acc_user_name').val("");
          $('#del_acc_user_passwd').val("");
          $('#del_acc_confirm_user_passwd').val("");
          $('#del_acc_super_administrator').val("");
          undisplayPromptinformation();
  });
//<==========================[Caden 2018-04-12.01]
}

//==========================>[Caden 2018-04-12.01]
//modify user's password
function modify_password(){
    undisplayPromptinformation();
    user_modify_password.name = $('#modify_pwd_user_name').val();
    user_modify_password.old_password = $('#modify_pwd_old_passwd').val();
    user_modify_password.new_password = $('#modify_pwd_user_passwd').val();
    user_modify_password.confirm_password = $('#modify_pwd_confirm_user_passwd').val();
    if(user_modify_password.name == "" || user_modify_password.old_password == ""){
          $('#modify_password_user_status').show(); 
    }
    else if(user_modify_password.new_password == "" || (user_modify_password.new_password != user_modify_password.confirm_password)){
              $('#modify_password_status').show();
         }    
         else{   
              socket.emit('modify_password',user_modify_password.name,user_modify_password.old_password,user_modify_password.new_password);
         }  

}
//register a new account
function add_new_account(){
    undisplayPromptinformation();
    user_add_account.name = $('#add_acc_user_name').val();
    user_add_account.password = $('#add_acc_user_passwd').val();
    user_add_account.confirm_password = $('#add_acc_confirm_user_passwd').val();
    user_add_account.administrator_type = $('#add_acc_create_super_administrator').val();
    if(user_add_account.name == "" || user_add_account.password == ""){
          $('#add_account_user_status').show();
    }
    else if (user_add_account.confirm_password == "" || (user_add_account.password != user_add_account.confirm_password)){
             $('#add_account_password_status').show();
         }
         else if(user_add_account.administrator_type == "" || user_add_account.administrator_type < 0 || user_add_account.administrator_type > 1){
                 $('#add_account_administrator_type_null').show();
               }
              else{
    	          socket.emit('add_account',user_add_account.name,user_add_account.password,user_add_account.administrator_type);
              }    
    
}

//delete an existing account
function delete_account(element){

/*
    undisplayPromptinformation();
    user_delete_account.name = $('#del_acc_user_name').val();
    user_delete_account.password = $('#del_acc_user_passwd').val();
    user_delete_account.confirm_password = $('#del_acc_confirm_user_passwd').val();      
    user_delete_account.administrator_type = $('#del_acc_super_administrator').val();
    if(user_delete_account.name == "" || user_delete_account.password == ""){
    	$('#delete_account_user_status').show();
    }
    else if(user_delete_account.confirm_password == "" || (user_delete_account.password != user_delete_account.confirm_password)){
    	      $('#delete_account_password_status').show();
         }
         else if(user_delete_account.administrator_type == "" || user_delete_account.administrator_type < 0 || user_delete_account.administrator_type > 1){
    	        $('#delete_account_administrator_type_null').show();
               }
              else{
    	           socket.emit('delete_account',user_delete_account.name,user_delete_account.password,user_delete_account.administrator_type);
              }

*/

    curTR = element.parentNode.parentNode;
    index = curTR.rowIndex;
    undisplayPromptinformation();
    user_delete_account.name = front = curTR.cells[0].textContent;
    user_delete_account.password = curTR.cells[1].textContent;
    user_delete_account.administrator_type = curTR.cells[2].textContent;
//Are you sure you are going to delete this account??
if(confirm('Are you sure you want to delete the account '+user_delete_account.name+" ?")){

    socket.emit('delete_account',user_delete_account.name,user_delete_account.password,user_delete_account.administrator_type);
    $('#administrators_table tr:eq('+(index)+')').remove();
}



}
//<==========================[Caden 2018-04-12.01]

function disableRadioOptions(){

  $('#uplod_car_span').css("color", "black");
  $('#file_cars').attr("disabled", true);
  $('#file_cars').css("color", "black");
  $('#maitain_single_car_span').css("color", "black");
  $('#upload_lift_span').css("color", "black");
  $('#file_lifts').attr('disabled', true);
  $('#file_lifts').css('color', "black");
  $('#modify_db_cars_span').css('color', 'black');
  $('#modify_db_lifts_span').css('color', 'black');
  $('#maintain_single_lift_span').css('color', 'black');
  $('#add_new_record').hide();
  $('#batch_submit').hide();
  $('#cars_table').html("");
  $('#administrators_table').html("");
  $('#fliter_lift').hide();
  $('#fliter_car').hide();
  isBatchSubmitted = false;
}
//Do not display prompt information
function undisplayPromptinformation(){
    $('#modify_password_user_status').hide();
    $('#modify_password_status').hide();
    $('#modify_password_results').hide();
    $('#modify_password_results_no').hide();
    $('#add_account_user_status').hide();
    $('#add_account_password_status').hide();
    $('#add_account_user_exists').hide();
    $('#add_account_results').hide();
    $('#add_account_results_no').hide();
    $('#add_account_administrator_type_null').hide();
    $('#delete_login_user_refused').hide();
    $('#delete_account_results').hide();
    $('#delete_account_results_no').hide();

}

function BatchUpload(data){
  //alert('batch_upload');
  socket.emit("batch_upload", currentTable, data);
}

function CheckRowCellEmpty(row){
  for (index = 0; index < curTR.childElementCount - 1; index++){
	if(curTR.cells[index].textContent == "")
	  return false;
    if(tbodyName == 'cars_data' && (isNaN(curTR.cells[0].textContent) || isNaN(curTR.cells[1].textContent) || isNaN(curTR.cells[2].textContent)))
      return false;
    if(tbodyName == 'lifts_data' && (isNaN(curTR.cells[1].textContent) || isNaN(curTR.cells[2].textContent) || isNaN(curTR.cells[3].textContent) ||
						isNaN(curTR.cells[4].textContent) || isNaN(curTR.cells[5].textContent) || isNaN(curTR.cells[6].textContent) ||
						isNaN(curTR.cells[7].textContent) || isNaN(curTR.cells[8].textContent) || isNaN(curTR.cells[9].textContent) ||
						isNaN(curTR.cells[10].textContent) || isNaN(curTR.cells[11].textContent) || isNaN(curTR.cells[12].textContent)))
      return false;
  }
  return true;
}

function AddNewRecordToDataBase(curTR){
  if(radioOptionIndex == 1 || radioOptionIndex == 2 || radioOptionIndex == 0){
    var newCar = {};
	newCar.make = curTR.cells[3].textContent;
        newCar.model = curTR.cells[4].textContent;
	newCar.year = curTR.cells[5].textContent;
	newCar.front = curTR.cells[0].textContent;
        newCar.rear = curTR.cells[1].textContent;
	newCar.leng = curTR.cells[2].textContent;
    console.log('add_new_car', newCar);
    socket.emit('add_new_car', newCar);  
  }
  else if(radioOptionIndex == 4 || radioOptionIndex == 5 || radioOptionIndex == 3){
    var newLift = {};
  	newLift.lift_name = curTR.cells[0].textContent;
        newLift.WT = curTR.cells[1].textContent;
	newLift.PD = curTR.cells[2].textContent;
	newLift.LCF = curTR.cells[3].textContent;
        newLift.LCR = curTR.cells[4].textContent;
	newLift.RFE = curTR.cells[5].textContent;
  	newLift.RFR = curTR.cells[6].textContent;
        newLift.RRE = curTR.cells[7].textContent;
	newLift.RRR = curTR.cells[8].textContent;
	newLift.DAP = curTR.cells[9].textContent;
        newLift.YO = curTR.cells[10].textContent;
	newLift.WOF = curTR.cells[11].textContent;
  	newLift.WOR = curTR.cells[12].textContent;
    console.log('add_new_lift', newLift);
    socket.emit('add_new_lift', newLift);
  }
}

function GetTheRowEditable(element, tableName){

  curTR = element.parentNode.parentNode;
  rowIndex = curTR.rowIndex;

  if (element.value === "edit")
    element.value = "save";

  else if (element.value === "save"){

             if(CheckRowCellEmpty(curTR)){
                   element.value = "edit";
	           if(radioOptionIndex == 1 || radioOptionIndex == 4 || radioOptionIndex == 2 || radioOptionIndex == 5)
		               AddNewRecordToDataBase(curTR);
	           if(radioOptionIndex == 0 || radioOptionIndex == 3){
		                 if(!isBatchSubmitted)
		                              console.log('is not submit and ignore the save');
	                         else
		                              AddNewRecordToDataBase(curTR);
	            }
              }
              else{
                                 alert('Some cells is empty or Value is Invalid!');
                                  return;
              }
  }

  for (index = 0; index < curTR.childElementCount - 1; index++){
    if (element.value === "save"){
          curTR.cells[index].children[0].contentEditable = 'true';
          curTR.cells[index].children[0].style.background = 'white';

	  if((radioOptionIndex == 2 || radioOptionIndex == 1) && index > 2){
		 curTR.cells[index].children[0].contentEditable = 'false';
		 curTR.cells[index].children[0].style.background = 'none';
	  }

	  if((radioOptionIndex == 5 || radioOptionIndex == 4)&& index == 0){
		 curTR.cells[index].children[0].contentEditable = 'false';
		 curTR.cells[index].children[0].style.background = 'none';
	  }
    }
    else if (element.value === "edit"){
          curTR.cells[index].children[0].contentEditable = 'false';
          curTR.cells[index].children[0].style.background = 'none';
	  if(radioOptionIndex == 0 || radioOptionIndex == 3)
          uploadedData[rowIndex][index] =  curTR.cells[index].textContent;
    }
  } 		
}

function DeleteRecordFromDataBase(curTR){
  if(radioOptionIndex == 1 || radioOptionIndex == 2 || radioOptionIndex == 0){

	if(radioOptionIndex == 0 && !isBatchSubmitted){
		console.log('is not submit and ignore the delete');
		return;
	}
    var newCar = {};
	newCar.front = curTR.cells[0].textContent;
        newCar.rear = curTR.cells[1].textContent;
	newCar.leng = curTR.cells[2].textContent;
	newCar.make = curTR.cells[3].textContent;
        newCar.model = curTR.cells[4].textContent;
	newCar.year = curTR.cells[5].textContent;
	console.log('delete_a_car', newCar);
    socket.emit('delete_a_car', newCar);
  }
  else if(radioOptionIndex == 4 || radioOptionIndex == 5 || radioOptionIndex == 3){

	if(radioOptionIndex == 3 && !isBatchSubmitted){
		console.log('is not submit and ignore the delete');
		return;
	}

    var newLift = {};
  	newLift.lift_name = curTR.cells[0].textContent;
        newLift.WT = curTR.cells[1].textContent;
	newLift.PD = curTR.cells[2].textContent;
	newLift.LCF = curTR.cells[3].textContent;
        newLift.LCR = curTR.cells[4].textContent;
	newLift.RFE = curTR.cells[5].textContent;
  	newLift.RFR = curTR.cells[6].textContent;
        newLift.RRE = curTR.cells[7].textContent;
	newLift.RRR = curTR.cells[8].textContent;
	newLift.DAP = curTR.cells[9].textContent;
        newLift.YO = curTR.cells[10].textContent;
	newLift.WOF = curTR.cells[11].textContent;
  	newLift.WOR = curTR.cells[12].textContent;
	console.log('delete_a_lift', newLift);
    socket.emit('delete_a_lift', newLift);
  }
}

function GetTheRowDeleted(element, tableName){
 // alert('getTheRowDeleted');

  curTR = element.parentNode.parentNode;
  index = curTR.rowIndex;

  if(radioOptionIndex == 0 || radioOptionIndex == 3){
    element.parentNode.parentNode.parentNode.deleteRow(index-1)
    uploadedData.splice(index, 1);
	DeleteRecordFromDataBase(curTR);
  }
  else if(radioOptionIndex == 1 || radioOptionIndex == 4 || radioOptionIndex == 2 || radioOptionIndex == 5){
    element.parentNode.parentNode.parentNode.deleteRow(index);
	DeleteRecordFromDataBase(curTR);
  }
}

function DisplayUploadedCarsTable(data){
  
  if(data.length < 2){
	alert('Empty or invalid CSV');
    return;
  }
  else if (data[0].length != 6 || 
     (data[0][0] != 'front' || data[0][1] != 'rear' || data[0][2] != 'leng' || data[0][3] != 'make' || data[0][4] != 'model' || data[0][5] != 'year'   )){
	alert('Invalid cars CSV');
    return;
  }

  //console.log(data);
 /* head = '<thead><tr><td class="front" style="width:5%">' + 'front' + '</td><td  class="rear" style="width:5%">' + 'rear' + '<td class="length" style="width:5%"> ' + 'leng' + '</td><td class="make" style="width:20%">' + 'make' + '</td><td class="model" style="width:40%">' + 'model' + '<td class="year" style="width:5%"> ' + 'year' +'</td><td class="operation" style="width:20%">Operation</td></tr></thead>';
*/

  tableData = '<tbody>'
  tbodyName='cars_data';
  for(index = 1; index < data.length; index++){
    if (data[index].length == 6){
      tableData += '<tr>';
          tableData += '<td style="width:5%"> <div class="front" contentEditable ="false">' + data[index][0] + '</div></td>';
	  tableData += '<td style="width:5%"> <div class="rear" contentEditable ="false">' + data[index][1] + '</div></td>'
	  tableData += '<td style="width:5%"> <div class="length" contentEditable ="false">' + data[index][2] + '</div></td>'
	  tableData += '<td style="width:20%"> <div class="make" contentEditable ="false">' + data[index][3] + '</div></td>'
	  tableData += '<td style="width:40%"> <div class="model" contentEditable ="false">' + data[index][4] + '</div></td>'
	  tableData += '<td style="width:5%"> <div class="year" contentEditable ="false">' + data[index][5] + '</div></td>'
	  tableData += '<td class="option" style="width:20%"><input type="button" value="edit" style="cursor:pointer" onclick="GetTheRowEditable(this, tbodyName)"><input type="button" style="cursor:pointer" onclick="GetTheRowDeleted(this, tbodyName)" value="delete"/></td>'
      tableData +='</tr>';
    }
  }
  tableData += '</tbody>'
  $('#cars_table').html(tableData);
  if(index >= 17 )   $('#maintain_table_header').css("width", "98.66%");
  else             $('#maintain_table_header').css("width", $('#maintain_table_cars').width());
  $('#batch_submit').show();
}


function DisplayUploadedLiftsTable(data){
  if(data.length < 2){
	alert('Empty or lift CSV');
    return;
  }
  else if (data[0].length != 13 || (data[0][0] != 'lift_name' || data[0][1] != 'WT' || data[0][2] != 'PD' || data[0][3] != 'LCF' || data[0][4] != 'LCR' || data[0][5] != 'RFE' || data[0][6] != 'RFR' || data[0][7] != 'RRE' || data[0][8] != 'RRR' || data[0][9] != 'DAP' || data[0][10] != 'YO' || data[0][11] != 'WOF' || data[0][12] != 'WOR'))
  {
	alert('Invalid lift CSV');
    return;
  }


  tableData = '<tbody>'
  tbodyName = 'lifts_data';
  for(index = 1; index < data.length; index++){
    if (data[index].length == 13){
      tableData += '<tr>';
          tableData += '<td style="width:16%">' + data[index][0] + '</td>';
	  tableData += '<td style="width:7%">' + data[index][1] + '</td>'
	  tableData += '<td style="width:5%">' + data[index][2] + '</td>'
	  tableData += '<td style="width:5%">' + data[index][3] + '</td>'
	  tableData += '<td style="width:5%">' + data[index][4] + '</td>'
	  tableData += '<td style="width:7%">' + data[index][5] + '</td>'
	  tableData += '<td style="width:7%">' + data[index][6] + '</td>'
	  tableData += '<td style="width:7%">' + data[index][7] + '</td>'
	  tableData += '<td style="width:7%">' + data[index][8] + '</td>'
	  tableData += '<td style="width:7%">' + data[index][9] + '</td>'
	  tableData += '<td style="width:5%">' + data[index][10] + '</td>'
	  tableData += '<td style="width:7%">' + data[index][11] + '</td>'
	  tableData += '<td style="width:7%">' + data[index][12] + '</td>'
	  tableData += '<td class="option" style="width:8%"><input type="button" value="edit" style="cursor:pointer" onclick="GetTheRowEditable(this, tbodyName)"><input type="button" style="cursor:pointer" onclick="GetTheRowDeleted(this, tbodyName)" value="delete"/><!--input type="button" style="cursor:pointer" onclick="GetTheRowEditCanceled(this, tbodyName)" value="cancel"/--></td>'
      tableData +='</tr>';
    }
  }
  tableData += '</tbody>'
 
  //$('#cars_table').css('width', '100%');
  $('#cars_table').html(tableData);
 if(index >= 29 )   $('#maintain_table_header').css("width", "98.66%");
 else             $('#maintain_table_header').css("width", $('#maintain_table_cars').width());

  $('#batch_submit').show();
}

function DisplayMaintainCarsTable(){
  //alert('DisplayMaintainCarsTable');
  head = '<thead><tr><td class="front" style="width:5%">' + 'front' + '</td><td  class="rear" style="width:5%">' + 'rear' + '<td class="length" style="width:5%"> ' + 'leng' + '</td><td class="make" style="width:20%">' + 'make' + '</td><td class="model" style="width:40%">' + 'model' + '<td class="year" style="width:5%"> ' + 'year' +'</td><td class="operation" style="width:20%">Operation</td></tr></thead>';

  tableData = '<tbody></tbody>'

  //$('#cars_table').html(head+tableData);
  $('#maitain_table_head').html(head+tableData);
}

function DisplayMaintainLiftsTable(){
  //alert('DisplayMaintainLiftsTable');
  head = '<thead><tr><td class="lift_name" style="width:16%">' + 'Lift' + '</td><td  class="WT" style="width:7%">' + 'WT' + '</td><td class="PD" style="width:5%">' + 'PD' + '</td><td class="LCF" style="width:5%">' + 'LCF' + '</td><td class="LCR" style="width:5%">' + 'LCR' + '<td class="RFE" style="width:7%">' + 'RFE' +'<td class="RFR" style="width:7%">' + 'RFR' +'<td class="RRE" style="width:7%">' + 'RRE' +'<td class="RRR" style="width:7%">' + 'RRR' +'<td class="DAP" style="width:7%">' + 'DAP' +'<td class="YO" style="width:5%">' + 'YO' +'<td class="WOF" style="width:7%">' + 'WOF' +'<td class="WOR" style="width:7%">' + 'WOR' +'</td><td class="operation" style="width:8%">Operation</td></tr></thead>';

  tableData = '<tbody></tbody>'

  //$('#cars_table').html(head + tableData);
  $('#maitain_table_head').html(head + tableData);
}


// ===========> display all administrators' info in table ,created by Caden,08/05/2018
function DisplayAllAdministrators(){

   head = '<thead><tr><td class="administrator_name" style="width:25%;text-align:center">' + 'account' + '</td><td  class="administrator_password" style="width:27%;text-align:center">' + 'password' + '</td><td class="administrator_level" style="width:20%;text-align:center">' + 'level' + '</td><td class="delete_button" style="width:28%;text-align:center">' + ' ' + '</td></tr></thead>';

  tableData = '<tbody></tbody>'
  
  $('#administrators_table').html(head+tableData);

}


function UpdateAllAdministrators(data){

  DisplayAllAdministrators();

  for(var i = 0; i < data.length; i++){
          var newRow = null;
          newRow += '<tr>';
          newRow += '<td><div style="text-align:center">' + data[i].user + '</div></td>';
          newRow += '<td><div style="text-align:center;display:none">' + data[i].password + '</div></td>';
	  newRow += '<td><div style="text-align:center">' + data[i].level + '</div></td>';
          newRow += '<td class="delete_account_button"><input type="button" style="cursor:pointer;" onclick="delete_account(this)" value="delete this account"/></td>';
          newRow +='</tr>';
          $("#administrators_table tr:last").after(newRow);
  }

}


//<=========================

function UpdateMaintainLiftsTable(data){
  DisplayMaintainLiftsTable();
  tbodyName = "lifts_data";
    var newRow = '<tbody>';
  for(var index=0; index < data.length; index++){
    //var newRow = null;
      newRow += '<tr>';
          newRow += '<td style="width:16%"><div>'+data[index].lift_name+'</div></td>';
	  newRow += '<td style="width:7%"><div>'+data[index].WT+'</div></td>'
	  newRow += '<td style="width:5%"><div>'+data[index].PD+'</div></td>'
	  newRow += '<td style="width:5%"><div>'+data[index].LCF+'</div></td>'
	  newRow += '<td style="width:5%"><div>'+data[index].LCR+'</div></td>'
	  newRow += '<td style="width:7%"><div>'+data[index].RFE+'</div></td>'
	  newRow += '<td style="width:7%"><div>'+data[index].RFR+'</div></td>'
	  newRow += '<td style="width:7%"><div>'+data[index].RRE+'</div></td>'
	  newRow += '<td style="width:7%"><div>'+data[index].RRR+'</div></td>'
	  newRow += '<td style="width:7%"><div>'+data[index].DAP+'</div></td>'
	  newRow += '<td style="width:5%"><div>'+data[index].YO+'</div></td>'
	  newRow += '<td style="width:7%"><div>'+data[index].WOF+'</div></td>'
	  newRow += '<td style="width:7%"><div>'+data[index].WOR+'</div></td>'
	  newRow += '<td class="option" style="width:8%"><input type="button" value="edit" style="cursor:pointer" onclick="GetTheRowEditable(this, tbodyName)"><input type="button" style="cursor:pointer" onclick="GetTheRowDeleted(this, tbodyName)" value="delete"/></td></tr>'
	//  $("#cars_table tr:last").after(newRow);
  }
   newRow += '</tbody>';
   $("#cars_table ").html(newRow);

   Adjust_maintain_table_header_Width(index);

}

function MaintainCarsTableEventsBind(){
/*********************make********************************/
  $('#id_select_make').blur(function(){
   $('#id_select_make').empty();
  });

  $('#id_select_make').focus(function(){
		$('#id_select_make').append('<option>'+'Select'+'</li>');
		$('#id_select_make').append('<option>'+'All'+'</li>');
                /*
		makesArray.forEach(function(make){
			$('#id_select_make').append('<option>'+make+'</li>');
		});
                */
               for(var i = 0; i < makesArray.length; i++){
                        if(makesArray[i] !== null )
			$('#id_select_make').append('<option>'+makesArray[i]+'</li>');
               }                
  });

   $('#id_select_make').change(function(){  		
 	//alert('onchange');
	make = $(this).val();
	model = year = null;
    $('#id_select_make').empty();
	if(make==="All"){
		socket.emit('getCarsData');
		modelsArray.splice(0, modelsArray.length);	
		yearsArray.splice(0, yearsArray.length);
	}
	else{
		socket.emit('getCarsData', make);
		socket.emit('getModels', make);
	}
  });

/**********************model***************************/
  $('#id_select_model').blur(function(){
   $('#id_select_model').empty();
  });

  $('#id_select_model').focus(function(){
		$('#id_select_model').append('<option>'+'Select'+'</li>');
		$('#id_select_model').append('<option>'+'All'+'</li>');
                /*
		modelsArray.forEach(function(model){
			$('#id_select_model').append('<option>'+model+'</li>');
		});
                */
               for(var i = 0; i < modelsArray.length; i++){
                        if(modelsArray[i] !== null )
			$('#id_select_model').append('<option>'+modelsArray[i]+'</li>');
               }  
  });

   $('#id_select_model').change(function(){  		
 	//alert('onchange');
	model = $('#id_select_model option:selected').text(); // if use val, the
	year = null;
    $('#id_select_model').empty();
	if(year==="All"){
		socket.emit('getCarsData', make);
		yearsArray.splice(0, modelsArray.length);
	}
	else{
		socket.emit('getCarsData', make, model);
		socket.emit('getYears', make, model);
	}
  });

/**********************year***************************/
  $('#id_select_year').blur(function(){
   $('#id_select_year').empty();
  });

  $('#id_select_year').focus(function(){
		$('#id_select_year').append('<option>'+'Select'+'</li>');
		$('#id_select_year').append('<option>'+'All'+'</li>');
                /*
		yearsArray.forEach(function(year){
			$('#id_select_year').append('<option>'+year+'</li>');
		});
                */
               for(var i = 0; i < yearsArray.length; i++){
                        if(yearsArray[i] !== null )
			$('#id_select_year').append('<option>'+yearsArray[i]+'</li>');
               } 
  });

   $('#id_select_year').change(function(){  		
	year = $(this).val();
    $('#id_select_year').empty();
	if(year==="All"){
		socket.emit('getCarsData', make, model);
	}
	else{
		socket.emit('getCarsData', make, model, year);
	}
  });
}

function UpdateMaintainCarsTable(data){
  //DisplayMaintainCarsTable();
  head = '<thead><tr><td class="front" style="width:5%">' + 'front' + '</td><td  class="rear" style="width:5%">' + 'rear' + '<td class="length" style="width:5%"> ' + 'leng' + '</td><td class="make" style="width:17%">' + 'make' + '&nbsp<select id="id_select_make"></select></td><td class="model" style="width:40%">' + 'model' + '&nbsp<select id="id_select_model"></select><td class="year" style="width:8%"> ' + 'year' +'&nbsp<select id="id_select_year"></select></td><td class="operation" style="width:20%">Operation</td></tr></thead>';

  tableData = '<tbody></tbody>';
 // $('#cars_table').html(head+tableData);
$('#maitain_table_head').html(head+tableData);

  tbodyName = "cars_data";
  var newRow = '<tbody>';
  for(var index=0; index < data.length; index++){
    //var newRow = null;
      newRow += '<tr>';
      newRow += '<td style="width:5%"><div>'+data[index].front+'</div></td>';
	  newRow += '<td style="width:5%"><div>'+data[index].rear+'</div></td>'
	  newRow += '<td style="width:5%"><div>'+data[index].leng+'</div></td>'
	  newRow += '<td style="width:17%"><div>'+data[index].make+'</div></td>'
	  newRow += '<td style="width:40%"><div>'+data[index].model+'</div></td>'
	  newRow += '<td style="width:8%"><div>'+data[index].year+'</div></td>'
	  newRow += '<td class="option style="width:20%""><input type="button" value="edit" style="cursor:pointer" onclick="GetTheRowEditable(this, tbodyName)"><input type="button" style="cursor:pointer" onclick="GetTheRowDeleted(this, tbodyName)" value="delete"/></td></tr>'
	
	 // $("#cars_table tr:last").after(newRow);
  }
 newRow += '</tbody>';
 $('#cars_table').html(newRow);

 Adjust_maintain_table_header_Width(index);

 MaintainCarsTableEventsBind();

}

function Adjust_maintain_table_header_Width(index){

 if(index >= 23 )   $('#maintain_table_header').css("width", "98.66%");
 else             $('#maintain_table_header').css("width", $('#maintain_table_cars').width());

}

function AddNewRecord(){
  var newRow = '<tbody><tr>';
  if (radioOptionIndex == 1){
      tbodyName = 'cars_data';
     // newRow += '<tr>';
          newRow += '<td style="width:5%"><div contentEditable="true" style="background:white"></div></td>';
	  newRow += '<td style="width:5%"><div contentEditable="true" style="background:white"></div></td>'
	  newRow += '<td style="width:5%"><div contentEditable="true" style="background:white"></div></td>'
	  newRow += '<td style="width:20%"><div contentEditable="true" style="background:white"></div></td>'
	  newRow += '<td style="width:40%"><div contentEditable="true" style="background:white"></div></td>'
	  newRow += '<td style="width:5%"><div contentEditable="true" style="background:white"></div></td>'
	  newRow += '<td class="option" style="width:20%"><input type="button" value="save" style="cursor:pointer" onclick="GetTheRowEditable(this, tbodyName)"><input type="button" style="cursor:pointer" onclick="GetTheRowDeleted(this, tbodyName)" value="delete"/></td></tr>'
  }
  else if (radioOptionIndex == 4){
  	  tbodyName = 'lifts_data';
     //   newRow += '<tr>';
          newRow += '<td style="width:16%"><div contentEditable="true" style="background:white"></div></td>';
	  newRow += '<td style="width:7%"><div contentEditable="true" style="background:white"></div></td>'
	  newRow += '<td style="width:5%"><div contentEditable="true" style="background:white"></div></td>'
	  newRow += '<td style="width:5%"><div contentEditable="true" style="background:white"></div></td>'
	  newRow += '<td style="width:5%"><div contentEditable="true" style="background:white"></div></td>'
	  newRow += '<td style="width:7%"><div contentEditable="true" style="background:white"></div></td>'
	  newRow += '<td style="width:7%"><div contentEditable="true" style="background:white"></div></td>'
	  newRow += '<td style="width:7%"><div contentEditable="true" style="background:white"></div></td>'
	  newRow += '<td style="width:7%"><div contentEditable="true" style="background:white"></div></td>'
	  newRow += '<td style="width:7%"><div contentEditable="true" style="background:white"></div></td>'
	  newRow += '<td style="width:5%"><div contentEditable="true" style="background:white"></div></td>'
	  newRow += '<td style="width:7%"><div contentEditable="true" style="background:white"></div></td>'
	  newRow += '<td style="width:7%"><div contentEditable="true" style="background:white"></div></td>'
	  newRow += '<td class="option" style="width:8%"><input type="button" value="save" style="cursor:pointer" onclick="GetTheRowEditable(this, tbodyName)"><input type="button" style="cursor:pointer" onclick="GetTheRowDeleted(this, tbodyName)" value="delete"/></td></tr>'
  }
        newRow += '</tbody>';
	//    $("#cars_table tr:last").after(newRow);
     $("#cars_table").html(newRow);


}
