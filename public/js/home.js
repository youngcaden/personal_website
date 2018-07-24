

var socket = io.connect();



$(document).ready(function(){


    $('.middle-div').css("height", $('html body').height()-$('.top-div').height());


     $('#picture').bind('click', function(){
        set_option_color_original();
        $('#picture').style.backgroundColor="white";
     });


});

function set_option_color_original(){




}

