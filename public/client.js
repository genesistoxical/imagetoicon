// client-side js

function restart() {
  location.reload();
}

function wait() {
  $("#form, #details-main, #link-main").hide();
  $("#details-wait, #link-wait, .cargando").show();
  $(".link").css("margin-top", 51);
}

function activatebtn() {
  document.getElementById("convert").disabled = false;
}
