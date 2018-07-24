var socket = io.connect();

$(document).ready(function(){
  $("#home-title-english").animate({top:'120px'});
  setTimeout("$('#home-title-english').animate({left:'+=450px'});",1000);
  title_dancing();
  slidebar_dancing(); 
  setTimeout("$('#home-title-english').animate({left:'+=450px'});",2000);
  setTimeout("$('#home-title-english').animate({left:'+=450px'});",2000);
  setTimeout("$('#home-title-english').animate({left:'+=-1000px'});",2000);
  setTimeout("$('#home-title-english').animate({left:'+=-10000px'});",2000);
});


function slidebar_dancing(){
  setTimeout("$('#slide-bar').show()",1500);
  setInterval("on_move_bar()",100);
}
function on_move_bar(){
  $("#slide-bar").animate({top:'+=20px'});
  $("#home-title-english").animate({top:'+=10px'});
  $("#slide-bar").animate({top:'-=20px'});
  $("#home-title-english").animate({top:'-=10px'});
}
function title_dancing(){
      var txtAnim = {
        len: 0,
        txtDom: "",
        arrTxt: [],
        init: function(obj) {
          this.obj = obj;
          this.txtDom = obj.innerHTML.replace(/\n+/g, "");
          this.len = this.txtDom.length;
          obj.innerHTML = "";
          this.addDom();
        },

        addDom: function() {
          for (var i = 0; i < this.len; i++) {
            var spanDom = document.createElement("span");
            spanDom.innerHTML = this.txtDom.substring(i, i + 1);
            this.obj.appendChild(spanDom);
            this.arrTxt.push(spanDom);
          };
          for (var j = 0; j < this.len; j++) {
            this.arrTxt[j].style.position = "relative";
          };
          this.strat();
        },
        strat: function() {
          for (var i = 0; i < this.len; i++) {
            this.arrTxt[i].onmouseover = function() {
              this.stop = 0;
              this.speed = -1;
              var $this = this;
              this.timer = setInterval(function() {
                $this.stop += $this.speed; //0 += -1
                if ($this.stop <= -20) {
                  $this.speed = 3;
                }
                  $this.style.top = $this.stop + "2px";
                  if ($this.stop >= 0) {
                   clearInterval($this.timer)
                   $this.style.top = 0 + "px";
                  }
              },
              50);
            };

          }

        }

      }

      var txtDom = document.getElementById("home-title-english-content");

      txtAnim.init(txtDom);
}
