/*

   version:01; tag:[Caden 2018-03-13.01]

   version:00; initial
*/

var socket = io.connect();

var make, model, year, lift_data;
var  car_data = {front:0, rear:0, leng:0, shiftBF:0}
var coordinate = {};
//var circles = {};
var dataset = [];
var shiftBF = 0;
var client_height;

var isCarSelected = false;
var isLiftSelected = false;
var user = {}; 
var selectedCarCSV;
var uploadedData;
var currentTable = "cars";

var circles = {};
var slantLinesAtZeroEnds = {};
var circlesLift = {};
var circlesCar = {};
var lineOnLiftLayout = {};
var abscissa = new Array();
var frontRSRetracted = new Array();
var frontLSRetracted = new Array();
var frontRSExtended = new Array();
var frontLSExtended = new Array();
//[Caden 2018-03-13.01]==>
var frontRSRetracted_rel = new Array();  // added 4 lines with yellow background-color in worksheet "Calculations";
var frontLSRetracted_rel = new Array();  //
var frontRSExtended_rel = new Array();   //
var frontLSExtended_rel = new Array();   //
//<==[Caden 2018-03-13.01]
var rearRSRetracted = new Array();
var rearLSRetracted = new Array();
var rearRSExtended = new Array();
var rearLSExtended = new Array();
var maxFrontRS = new Array();
var maxRearRS = new Array();
var maxFrontLS = new Array();
var maxRearLS = new Array();


var approxFRSWheel = new Array();
var approxFLSWheel = new Array();
var approxFrontWheel = new Array();
var ordinateFrontWheel = new Array();
var approxRRSWheel = new Array();
var approxRLSWheel = new Array();
var approxRearWheel = new Array();
var ordinateRearWheel = new Array();
var approxCenter = new Array();
var ordinateCenter = new Array();


var vehiclePoints = {};

var testResult = {};


function updateClient(){
  $('#client_id').css("top", $('.header').height());

  $('.close_box').click(function(){
       $('.select_box').hide();
       $('#user_name').val("");
       $('#user_passwd').val("");
       $('#login_status').hide();
  });

  client_height = $('#client_id').height();
  $('#client_left').height(client_height);
  $('#client_right').height(client_height);

  var client_car_height = client_height/3;
  var client_lift_heigth = client_height - client_car_height;
  $('#car_id').height(client_car_height);
  $('#lift_id').height(client_lift_heigth);

  $('#specSelect_button').click(function(){
//[Caden 2018-03-13.01]==>
      $('#login_box').hide();
//<==[Caden 2018-03-13.01]
      if($('#select_spec_box').is(':visible') == true)
		$('#select_spec_box').hide();
      else{
        $('#select_spec_box').show();
        $('#select_lift_box').hide();
 	    $('#makes').show();
	    $('#models').hide();
	    $('#years').hide();
        socket.emit("getMakes"); 
        socket.emit("getLifts");
      }
  });
  
  $('#item_make').click(function(){
   	  $('#makes').show();
	  $('#models').hide();
	  $('#years').hide();
  });

  $('#item_model').click(function(){
   	  $('#makes').hide();
	  $('#models').show();
	  $('#years').hide();
  });

  $('#item_year').click(function(){
   	  $('#makes').hide();
	  $('#models').hide();
	  $('#years').show();
  });

  $('#liftSelect_button').click(function(){
//[Caden 2018-03-13.01]==>
         $('#login_box').hide();
//<==[Caden 2018-03-13.01]                                                                     
    if($('#select_lift_box').is(':visible') == true)
	  $('#select_lift_box').hide();
    else{
	  $('#select_lift_box').show();
      $('#select_spec_box').hide();
      socket.emit("getMakes"); 
      socket.emit("getLifts");
   }
  });
//trigger function when click the button "Generate PDF"


  $('.select_box').height(client_height/1.5);
//[Caden 2018-03-13.01]==>
      $('.select_box').width(client_height/0.9);    
//<==[Caden 2018-03-13.01]  
  $('.select_box').css("left",  $('#client_id').width()/3.5);
  $('.select_box').css("top", client_height/6);
//[Caden 2018-03-13.01]==>
      $('#login_box').css("left",  $('#client_id').width()/2.7);
      $('#login_box').css("top", client_height/4);
//<==[Caden 2018-03-13.01]
  $('.content_ul').height($('.select_box').height() * 0.75);
  $('#select_lift_content').height($('.select_box').height() * 0.85);

  $('#login_box').height(client_height/2.7);
  $('#login_box').width($('#login_box').height()*1.5);
  $('#close_box_login').css("width", "5%");
//hide the button for generating pdf file
  $('.button_generate_pdf').hide();
  $('#login_menu').click(function(){ 
//[Caden 2018-03-13.01]==>                                                                     
     $('#select_lift_box').hide();
     $('#select_spec_box').hide();
//<==[Caden 2018-03-13.01]
	if($('#login_menu').text() == 'Logout'){   
		
		$.get("/logout");
		$('#login_menu').text('Login');
		socket.emit('logout');
		$("#user_name").val("");
   		$("#user_passwd").val("");            //set user_name = null,user_password = null while logouting
	        $('#maintain_menu').hide();
	}
       else
	        $('#login_box').show();}
  );

  $('#edit_car').click(function(){
	OwnDimensions();
  });

  $('.editing_car').keyup(function(event){
//	CheckValidKey(event.keyCode);	
	OnEditingCarValue();
  });

  
  $('#shift_BF').keyup(function(event){                 
	newShiftBF = Number($('#shift_BF').val());
    if(isNaN(newShiftBF)){
      if($('#shift_BF').val() == '-')
      	newShiftBF = 0;
      else{
		alert('illegal value');
        return;
      }
    }
    if(newShiftBF == shiftBF)                      // the default value  of shiftBF is 0   
     return;
    console.log('newShiftBF', newShiftBF);
	shiftBF = newShiftBF;
	car_data.shiftBF = shiftBF;
	if (isCarSelected && isLiftSelected){
              // let Generate PDF button show
               $('.button_generate_pdf').show();
		calculation();
		Drawing();

	}
  });
}



function ClearShiftBF(){
/*
  shiftBF = 0;
  $('#shift_BF').val(0);
*/
}



function CheckValidKey(keyCode){

  //var realkey=String.fromCharCode(keyCode);
  console.log(keyCode);
  if((keyCode <= 57 && keyCode >= 48) || keyCode == 45 || keyCode == 95 || keyCode == 109 || keyCode==189 || keyCode == 190 || (keyCode >=96 && keyCode <= 105))
    return true;

  return false;
}



function OwnDimensions(){
  if($('#edit_car').is(':checked')){                              //if the checkbox selected , execute the if clause.
   // alert('checked');
	ClearShiftBF();

    $('#front_track').attr('contentEditable', 'true');
    $('#rear_track').attr('contentEditable', 'true');
    $('#length').attr('contentEditable', 'true');
	$('#front_track').css('background',"white");
	$('#rear_track').css('background', "white");
	$('#length').css('background', "white");
	$('#length').text('0');
	$('#front_track').text('0');
	$('#rear_track').text('0');
	car_data.front = 0;                                         
        car_data.rear = 0;
        car_data.leng = 0;
        car_data.shiftBF = shiftBF;
        $('#carModel').text('Own Dimensions');
//[Caden 2018-03-13.01]==>
        if($('#front_track').text() != '0' && Number($('#front_track').text()) >= 100 && $('#rear_track').text() != '0' && Number($('#rear_track').text()) >= 100 && $('#length').text () != '0' && Number($('#length').text()) >= 100 ){
	car_data.front = Number($('#front_track').text());                                       
	car_data.rear = Number($('#rear_track').text());
	car_data.leng = Number($('#length').text());
	isCarSelected = true;
	}
//<==[Caden 2018-03-13.01]
									//isCarSelected = true;
	if (isCarSelected && isLiftSelected){
               // let Generate PDF button show
               $('.button_generate_pdf').show();
		calculation();
		Drawing();
	}
  }
  else{
	
	DisbleOwnDimension();
  }
}

function OnEditingCarValue(){

  var length = $('#length').text();
  var front_track = $('#front_track').text();
  var rear_track = $('#rear_track').text();

  if(length == '-')
    length = 0;
  if(front_track == '-')
    front_track = 0;
  if(rear_track == '-')
    rear_track = 0;

  console.log('keydown', front_track, rear_track, length);
  
  if(isNaN(length) || isNaN(front_track) || isNaN(rear_track)){
	alert('Illegal Input');
	return;
  }
  else{

    if(Number(front_track) < 0 ||  Number(rear_track) < 0 ||  Number(length) < 0){
		alert('Illegal value');
                isCarSelected = false;
   		return;
    }
    else if(Number(front_track) < 100 ||  Number(rear_track) < 100 ||  Number(length) < 100)
		return;
         else{
                       
			car_data.front = Number(front_track);
			car_data.rear = Number(rear_track);
			car_data.leng = Number(length);
                        isCarSelected = true;
              if (isCarSelected && isLiftSelected){
                       // let Generate PDF button show
                      $('.button_generate_pdf').show();
			calculation();
			Drawing();
              }
         }
		
  }

}


function DisbleOwnDimension(){
    $('#edit_car').prop("checked", false);
    $('#front_track').attr('contentEditable', 'false');
    $('#rear_track').attr('contentEditable', 'false');
    $('#length').attr('contentEditable', 'false');
    $("#front_track").css('background', 'none');
	$("#rear_track").css('background', 'none');
	$("#length").css('background', 'none');
	$('#front_track').text('--');
	$('#rear_track').text('--');
        $('#length').text('--');
	$('#carModel').text('--------------');
        isCarSelected = false;
}



function login(){
    obj=$("#user_name")
    user.name = $("#user_name").val();
    user.password = $("#user_passwd").val();
   // socket.emit("login", user);
	
	$.get("/login", {name:user.name, password:user.password}, function(data){
	if(data.hasOwnProperty('isLockUp') && data.isLockUp){
		$('#maintain_menu').hide();
    		$('#login_menu').text('Login'); 
		$('#login_status').text('Account locked up, connect with the Administrator');
		$('#login_status').show();
		return;
        }

	if(data.valid){
		$('#maintain_menu').show();
		$('#login_status').hide();
	 	$('#login_box').hide();
    		$('#welcome_id').text('Welcome ' + user.name + '!');
		$('#login_menu').text('Logout');
	}
        else{
            $('#maintain_menu').hide();
            $('#login_status').text('Invalid User or password');
            $('#login_status').show();
    	    $('#welcome_id').text('Welcome Guest!');
        }
    });
}



$(document).ready(function(){

  $('body').show();
  updateClient();

  socket.emit("enter_home");

  var _modelArray, _liftArray;

  console.log("on ready");

  socket.on('maintain_on', function(){ 
	$('#login_menu').text('Logout'); 
	$('#maintain_menu').show();
  });

  /*socket.on('user_lockup', function(){
    $('#maintain_menu').hide();
    $('#login_menu').text('Login'); 
	$('#login_status').text('Account locked up, connect with the Administrator');
	$('#login_status').show();
  });*/
 
  socket.on('connect', function(){                        //getMakes start from here
    console.log('connectted to Server')
    socket.emit("getMakes");                         //  ===##====--->  uiCommubications.js----------1
    socket.emit("getLifts");                         //  ===##====--->  uiCommubications.js----------one 
  });
 
  socket.on('disconnect', function(){console.log('server disconnected');});

  socket.on('getMakes', function(makesArray){
    console.log("getMakes from Server");                    
	$('#makes li').remove();
/*
    makesArray.forEach(function(make){
		$('#makes').append("<li class=\"li_make\">"+make+"</li>");
	});
*/
     for(var i = 0; i < makesArray.length; i++){
               if(makesArray[i] !== null )
	      $('#makes').append("<li class=\"li_make\">"+makesArray[i]+"</li>");
     }

	$('.li_make').bind('click', function(){
		 // ResetCarData();
     
	  make = $(this).text();  
          model = year = null;

      socket.emit('getModels', make);              //===##====--->  uiCommubications.js-------------2
	  $('#makes').hide();
	  $('#models').show();
          $('#years').hide();
	  $('#temp_select_car').text(make);
	});
  });

  socket.on('getModels', function(modelArray){      //===##====--->  uiCommubications.js------------3
    //TODO:
    console.log("getModels from Server");
	$('#models li').remove();
    _modelArray = modelArray;
/*
    _modelArray.forEach(function(model){
		$('#models').append("<li class=\"li_model\">"+model+"</li>");
	});
*/
     for(var i = 0; i < _modelArray.length; i++){
               if(_modelArray[i] !== null )
	      $('#models').append("<li class=\"li_model\">"+_modelArray[i]+"</li>");
     }

	$('.li_model').bind('click', function(){
 		// ResetCarData();
      	model = $(this).text();
      	year = null;

        socket.emit('getYears', make, model);       //===##====--->  uiCommubications.js-------------4
	    $('#makes').hide();
	    $('#models').hide();
            $('#years').show();
        $('#temp_select_car').text(make + " " + model);
	});
  });

  socket.on('getYears', function(yearsArray){       
    //TODO:
    console.log("getYears from Server");
    $('#years li').remove();
/*
	yearsArray.forEach(function(year){
		$('#years').append("<li class=\"li_year\">"+year+"</li>");
	});
*/
     for(var i = 0; i < yearsArray.length; i++){
               if(yearsArray[i] !== null )
	      $('#years').append("<li class=\"li_year\">"+yearsArray[i]+"</li>");
     }

    if(yearsArray.length == 1)
      year = yearsArray[0];

	$('.li_year').bind('click', function(){
	  year = $(this).text();

          socket.emit('getCarData', make, model, year);    //==##====--->  uiCommubications.js-------------5
	  $('#select_spec_box').hide();

//========> remove (#models li),(#years li) after hiding (#select_spec_box) for avoiding get mistakes when select veichle again.
          $('#models li').remove();
          $('#years li').remove();
//<========
          $('#carModel').text(make + " " + model + " " + year);
          $('#temp_select_car').text(make + " " + model + " " + year);
	});

  });

  socket.on('getCarData', function(data){          // ==##====--->  uiCommubications.js-------------6------getMakes ends here
    car_data = data[0];
    car_data.shiftBF = shiftBF;

    console.log('getCarData', data);
    $("#front_track").text(car_data.front);
    $("#rear_track").text(car_data.rear);
    $("#length").text(car_data.leng);

	isCarSelected = true;
    //  DisbleOwnDimension();
    //calculateCoordinate(coordinate, car_data)
	ClearShiftBF();
	if (isCarSelected && isLiftSelected){
	       // let Generate PDF button show
               $('.button_generate_pdf').show();
		calculation();
		Drawing();
	}
  });



  socket.on('getLifts', function(lifts){        
    console.log('getlifts from server');
    $('#liftModels li').remove();
    _liftArray = lifts;
/*
    lifts.forEach(function(lift){
		$('#liftModels').append("<li class=\"li_liftModel\">"+lift+"</li>");
	});
*/
     for(var i = 0; i < _liftArray.length; i++){
               if(_liftArray[i] !== null )
	      $('#liftModels').append("<li class=\"li_liftModel\">"+_liftArray[i]+"</li>");
     }

	$('.li_liftModel').bind('click', function(){
	  lift = $(this).text();
          socket.emit('getLiftData', lift);       //==##====--->  uiCommubications.js-------------two     
          $('#temp_select_lift').text(lift);
          $('#select_lift_box').hide();
	  $('#liftModel').text(lift);
	});
  });

  socket.on('getLiftData', function(data){ //==##====--->  uiCommubications.js-------------three-----end
    lift_data = data[0];
    $('#WT').text(data[0].WT);
    $('#PD').text(data[0].PD);
    $('#LCF').text(data[0].LCF);
    $('#LCR').text(data[0].LCR);
    $('#RFE').text(data[0].RFE);
    $('#RFR').text(data[0].RFR);
    $('#RRE').text(data[0].RRE);
    $('#RRR').text(data[0].RRR);
    $('#DAP').text(data[0].DAP);
    //$('#YO').text(data[0].YO);
    $('#WOF').text(data[0].WOF);
    $('#WOR').text(data[0].WOR); 


    calculateLiftData(lift_data);

	isLiftSelected = true;  
	ClearShiftBF();
	if (isLiftSelected && isCarSelected){
        // let Generate PDF button show
        $('.button_generate_pdf').show();
      	calculation();
	Drawing();
	}
  });

  /*socket.on('logout', function(){
    alert('opt logout');
  });  */

 /* socket.on('invalidUser', function(){
    $('#maintain_menu').hide();
	$('#login_status').show();
    $('#welcome_id').text('Welcome Guest!');
  });
  
  socket.on('validUser', function(){
    $('#maintain_menu').show();
	$('#login_status').hide();
	 $('#login_box').hide();
    $('#welcome_id').text('Welcome ' + user.name + '!');
  });*/
});

function ResetCarData(){
  $("#front_track").text("--");
  $("#rear_track").text("--");
  $("#length").text("--");
  car_data = [];
}




function updateResult(){
  if(testResult.front){
	$('#frontResult').text("Front: CAN REACH PICK-UP POINTS");
	$('#frontResult').css('color', 'green')
  }
  else{
  	$('#frontResult').text("Front: CAN'T REACH PICK-UP POINTS");
	$('#frontResult').css('color', 'red')
  }

  if(testResult.rear){
	$('#rearResult').text("Rear: CAN REACH PICK-UP POINTS");
	$('#rearResult').css('color', 'green')
  }
  else{
  	$('#rearResult').text("Rear: CAN'T REACH PICK-UP POINTS");
	$('#rearResult').css('color', 'red')
  }
}


function DrawingLines(){

  var ctx = $("#myChart").get(0).getContext("2d");

  var data = {
	labels : ["","","","","","","","","","",
			  "","","","","","","","","","",
			  "","","","","","","","","","",
              "","","","","","","","","","",
              "","","","","","","","","","",
              "","","","","","","","","","",
              "","","","","","","","","","",
              "","","","","","","","",""],
	datasets : [
		{
			fillColor : "rgba(151,187,205,0)",
			strokeColor : "rgba(0,0,0,.0)",
			pointColor : "rgba(0,102,255,1)",
			pointStrokeColor : "#fff",
			data : frontRSRetracted
		},
		{
			fillColor : "rgba(151,187,205,0)",
			strokeColor : "rgba(0,0,0,.0)",
			pointColor : "rgba(0,102,255,1)",
			pointStrokeColor : "#fff",
			data : frontLSRetracted
		},
		{
			fillColor : "rgba(151,187,205,0)",
			strokeColor : "rgba(0,0,0,.0)",
			pointColor : "rgba(0,102,255,1)",        
			pointStrokeColor : "#fff",  
			data : frontRSExtended
		},
		{
			fillColor : "rgba(151,187,205,0)",
			strokeColor : "rgba(0,0,0,.0)",
			pointColor : "rgba(0,102,255,1)",       
			pointStrokeColor : "#fff",
			data : frontLSExtended
		},
		{
			fillColor : "rgba(151,187,205,0)",
			strokeColor : "rgba(0,0,0,.0)",
			pointColor : "rgba(127,127,127,1)",    //    "rgba(0,0,255,.4)",
			pointStrokeColor : "#fff",
			data : rearRSRetracted
		},
		{
			fillColor : "rgba(151,187,205,0)",
			strokeColor : "rgba(0,0,0,.0)",
			pointColor : "rgba(127,127,127,1)",    //  "rgba(0,0,255,.4)",
			pointStrokeColor : "#fff",
			data : rearLSRetracted
		},
		{
			fillColor : "rgba(151,187,205,0)",
			strokeColor : "rgba(0,0,0,.0)",
			pointColor : "rgba(127,127,127,1)",    //"rgba(0,0,255,.4)",
			pointStrokeColor : "#fff",
			data : rearRSExtended
		},
		{
			fillColor : "rgba(151,187,205,0)",
			strokeColor : "rgba(0,0,0,.0)",
			pointColor : "rgba(127,127,127,1)",    //"rgba(0,0,255,.4)", 
			pointStrokeColor : "#fff", 
			data : rearLSExtended
		},
		{
			fillColor : "rgba(151,187,205,0)",
			strokeColor : "rgba(0,0,0,.0)",
			pointColor : "rgba(0,102,255,1)",     
			pointStrokeColor : "#fff",
			data : maxFrontRS
		},
		{
			fillColor : "rgba(151,187,205,0)",
			strokeColor : "rgba(0,0,0,.0)",
			pointColor : "rgba(127,127,127,1)",     
			pointStrokeColor : "#fff",
			data : maxRearRS
		},
		{
			fillColor : "rgba(151,187,205,0)",
			strokeColor : "rgba(0,0,0,.0)",
			pointColor : "rgba(0,102,255,1)",    
			pointStrokeColor : "#fff",
			data : maxFrontLS
		},
		{
			fillColor : "rgba(151,187,205,0)",
			strokeColor : "rgba(0,0,0,.0)",
			pointColor : "rgba(127,127,127,1)",   
			pointStrokeColor : "#fff",
			data : maxRearLS
		},

//[Caden 2018-03-13.01]==>              //the gray points rgba(0,102,255,1)

                {
                        fillColor : "rgba(151,187,205,0)",
			strokeColor : "rgba(0,0,0,.0)",
			pointColor : "rgba(0,102,255,1)",
			pointStrokeColor : "#fff",
			data : frontRSRetracted_rel,
                },
                {
                        fillColor : "rgba(151,187,205,0)",
			strokeColor : "rgba(0,0,0,.0)",
			pointColor : "rgba(0,102,255,1)",
			pointStrokeColor : "#fff",
			data : frontLSRetracted_rel,
                },
                {
                        fillColor : "rgba(151,187,205,0)",
			strokeColor : "rgba(0,0,0,.0)",
			pointColor : "rgba(0,102,255,1)",
			pointStrokeColor : "#fff",
			data : frontRSExtended_rel,
                },
                {
                        fillColor : "rgba(151,187,205,0)",
			strokeColor : "rgba(0,0,0,.0)",
			pointColor : "rgba(0,102,255,1)",
			pointStrokeColor : "#fff",
			data : frontLSExtended_rel,
                 },
//<==[Caden 2018-03-13.01]

		{
			fillColor : "rgba(255,0,0,0)",
			strokeColor : "rgba(120,187,255,0)",
			pointColor : "rgba(255,0,0,1)",
			pointStrokeColor : "#fff",
			data : ordinateFrontWheel
		},
		{
			fillColor : "rgba(255,0,0,0)",
			strokeColor : "rgba(120,187,255,0)",
			pointColor : "rgba(255,0,0,1)",
			pointStrokeColor : "#fff",
			data : ordinateRearWheel
		},
		{
			fillColor : "rgba(151,187,205,0)",               //   127,127,127,1      0,102,255,1   0,0,255,0.4
			strokeColor : "rgba(255,255,255,0)",
			pointColor : "rgba(0,0,255,.4)",
			pointStrokeColor : "#fff",
			data : ordinateCenter,
		}
	]
  }


  var options = {
				
	//Boolean - If we show the scale above the chart data			
	scaleOverlay : false,
	
	//Boolean - If we want to override with a hard coded scale
	scaleOverride : false,
	
	//** Required if scaleOverride is true **
	//Number - The number of steps in a hard coded scale
	scaleSteps : null,
	//Number - The value jump in the hard coded scale
	scaleStepWidth : null,
	//Number - The scale starting value
	scaleStartValue : null,

	//String - Colour of the scale line	
	scaleLineColor : "rgba(0,0,0,0)",
	
	//Number - Pixel width of the scale line	
	scaleLineWidth : 1,

	//Boolean - Whether to show labels on the scale	
	scaleShowLabels : false,
	
	//Interpolated JS string - can access value
	scaleLabel : "<%=value%>",
	
	//String - Scale label font declaration for the scale label
	scaleFontFamily : "'Arial'",
	
	//Number - Scale label font size in pixels	
	scaleFontSize : 12,
	
	//String - Scale label font weight style	
	scaleFontStyle : "normal",
	
	//String - Scale label font colour	
	scaleFontColor : "#666",	
	
	///Boolean - Whether grid lines are shown across the chart
	scaleShowGridLines : false,
	
	//String - Colour of the grid lines
	scaleGridLineColor : "rgba(0,0,0,.02)",
	
	//Number - Width of the grid lines
	scaleGridLineWidth : 1,	
	
	//Boolean - Whether the line is curved between points
	bezierCurve : true,
	
	//Boolean - Whether to show a dot for each point
	pointDot : true,
	
	//Number - Radius of each point dot in pixels
	pointDotRadius : 3,
	
	//Number - Pixel width of point dot stroke
	pointDotStrokeWidth : 1,
	
	//Boolean - Whether to show a stroke for datasets
	datasetStroke : true,
	
	//Number - Pixel width of dataset stroke
	datasetStrokeWidth : 3,
	
	//Boolean - Whether to fill the dataset with a colour
	datasetFill : true,
	
	//Boolean - Whether to animate the chart
	animation : false,

	//Number - Number of animation steps
	animationSteps : 60,
	
	//String - Animation easing effect
	animationEasing : "easeOutQuart",

	//Function - Fires when the animation is complete
	onAnimationComplete : null,

	showTooltips: false,
	
  }
  new Chart(ctx).Line(data,options);
}


function Drawing(){
  updateResult();
  DrawingLines();
}
















