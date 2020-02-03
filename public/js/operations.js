var customers = [];
var nicList = [];
var fullUserList = [];
var additionals = [];
var selectedUser = {};

function autocomplete(inp, arr, ext, prop) {
    /*the autocomplete function takes two arguments,
    the text field element and an array of possible autocompleted values:*/
    var currentFocus;
    /*execute a function when someone writes in the text field:*/
    inp.addEventListener("input", function(e) {
        var a, b, i, val = this.value;
        /*close any already open lists of autocompleted values*/
        closeAllLists();
        if (!val) { return false;}
        currentFocus = -1;
        /*create a DIV element that will contain the items (values):*/
        a = document.createElement("DIV");
        a.setAttribute("id", this.id + "autocomplete-list");
        a.setAttribute("class", "autocomplete-items");
        /*append the DIV element as a child of the autocomplete container:*/
        this.parentNode.appendChild(a);
        /*for each item in the array...*/
        for (i = 0; i < arr.length; i++) {
          /*check if the item starts with the same letters as the text field value:*/
          if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
            /*create a DIV element for each matching element:*/
            b = document.createElement("DIV");
            /*make the matching letters bold:*/
            b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
            b.innerHTML += arr[i].substr(val.length);
            /*insert a input field that will hold the current array item's value:*/
            b.innerHTML += "<input type='hidden' value='" + arr[i] + "|"+i+"'>";
            /*execute a function when someone clicks on the item value (DIV element):*/
                b.addEventListener("click", function(e) {
                /*insert the value for the autocomplete text field:*/
                inp.value = ((this.getElementsByTagName("input")[0].value).split('|'))[0];
                selectedUser = fullUserList[parseInt(((this.getElementsByTagName("input")[0].value).split('|'))[1])];
                ext.value = selectedUser[prop];
                // alert(JSON.stringify(this.getElementsByTagName("label")));
                /*close the list of autocompleted values,
                (or any other open lists of autocompleted values:*/
                closeAllLists();
            });
            a.appendChild(b);
          }
        }
    });
    /*execute a function presses a key on the keyboard:*/
    inp.addEventListener("keydown", function(e) {
        var x = document.getElementById(this.id + "autocomplete-list");
        if (x) x = x.getElementsByTagName("div");
        if (e.keyCode == 40) {
          /*If the arrow DOWN key is pressed,
          increase the currentFocus variable:*/
          currentFocus++;
          /*and and make the current item more visible:*/
          addActive(x);
        } else if (e.keyCode == 38) { //up
          /*If the arrow UP key is pressed,
          decrease the currentFocus variable:*/
          currentFocus--;
          /*and and make the current item more visible:*/
          addActive(x);
        } else if (e.keyCode == 13) {
          /*If the ENTER key is pressed, prevent the form from being submitted,*/
          e.preventDefault();
          if (currentFocus > -1) {
            /*and simulate a click on the "active" item:*/
            if (x) x[currentFocus].click();
          }
        }
    });
    function addActive(x) {
      /*a function to classify an item as "active":*/
      if (!x) return false;
      /*start by removing the "active" class on all items:*/
      removeActive(x);
      if (currentFocus >= x.length) currentFocus = 0;
      if (currentFocus < 0) currentFocus = (x.length - 1);
      /*add class "autocomplete-active":*/
      x[currentFocus].classList.add("autocomplete-active");
    }
    function removeActive(x) {
      /*a function to remove the "active" class from all autocomplete items:*/
      for (var i = 0; i < x.length; i++) {
        x[i].classList.remove("autocomplete-active");
      }
    }
    function closeAllLists(elmnt) {
      /*close all autocomplete lists in the document,
      except the one passed as an argument:*/
      var x = document.getElementsByClassName("autocomplete-items");
      for (var i = 0; i < x.length; i++) {
        if (elmnt != x[i] && elmnt != inp) {
        x[i].parentNode.removeChild(x[i]);
      }
    }
  }
  /*execute a function when someone clicks in the document:*/
  document.addEventListener("click", function (e) {
      closeAllLists(e.target);
  });
}
autocomplete(document.getElementById("userNameInput"), customers, document.getElementById("userID"),"nic");
autocomplete(document.getElementById("userID"), nicList, document.getElementById("userNameInput"),"name");
// autocomplete(document.getElementById("userSearch"), customers);

function removeAdditional(pos){
  var removed = additionals.splice(pos,1);
  generateAdditional();
}

function createBrowserWindow() {
  const remote = require('electron').remote;
  const BrowserWindow = remote.BrowserWindow;
  const win = new BrowserWindow({
    height: 595,
    width: 420
  });
  return win;
}

function printDiv(divName) {
  // var printContents = document.getElementById(divName).innerHTML;
  // var originalContents = document.documentElement.innerHTML;

  // window.document.write(printContents);

  // window.print();

  // document.location.reload();
  
  console.log("PLEASE PRINT");

$.get( "/generatePDF" )
  .done(function( data ) {
      alert("Success");
  })
  .fail(function( data ) {
      alert(data.responseText);
  });

  // console.log("Done");
  
  // doc.fromHTML($('#content').html(), 15, 15, {
  //   'width': 170,
  //         'elementHandlers': specialElementHandlers
  // });
  // doc.save('sample-file.pdf');

  // console.log("PDF Saved");
  

  // var divContents = $("#"+divName).html();
  // var printWindow = createBrowserWindow();
  // printWindow.document.write('<html><head><title></title>');
  // printWindow.document.write('</head><body >');
  // printWindow.document.write(divContents);
  // printWindow.document.write('</body></html>');
  // printWindow.document.close();
  // printWindow.print();

}

function generateAdditional(){
  $("#tableContainer").empty();
  var content = "<table>";
  for(i=0; i<additionals.length; i++){
      content += `<tr>`;
      content += `<td>`+additionals[i].col1+`</td>`;
      content += `<td>`+additionals[i].col2+`</td>`;
      content += `<td>`+additionals[i].col3+`</td>`;
      content += `<td><button class="btn btn-danger" id="addAdditional" onclick="removeAdditional(`+i+`)"><i class="fas fa-times-circle"></i></button></td>`;
      content +=`<tr>`;
  }
  content+=`</table>`;
  $('#tableContainer').append(content);
}

function fetchUserData(){
  $.get( "/listUsers")
  .done(function( data ) {
      console.log(data);
      fullUserList = data;
      for(var i = 0; i < data.length; i++){
        customers.push(data[i].name);
        nicList.push(data[i].nic);
      }
  })
  .fail(function( data ) {
      alert(data.responseText);
  });
}

$( document ).ready(function() {

  fetchUserData();

  $('#trdate').val(moment().format('YYYY-MM-DD'));

  var d_def = new Date();
  var year_def = d_def.getFullYear();
  var month_def = (d_def.getMonth())+1;

  $( "select#rep_year" ).val(year_def.toString());
  $( "select#rep_month" ).val(month_def.toString());

  $.get( "/getRates",{
    year: $('#rep_year').val(),
    month: $('#rep_month').val()
  })
  .done(function( data ) {
    if(data){
      $('#repPrice').val(data.price);
      $('#repStamp').val(data.stamp);
      $('#repTransport').val(data.transport);
    }
  })
  .fail(function( data ) {
      alert(data.responseText);
  });

  $( "#additionalTypes" ).change(function() {
    
    switch(parseInt($( this ).val())){
      case 0:
        $('#additional1').attr("placeholder", "Amount(Rs.)");
        $('#additional2').attr("placeholder", "");
        $('#additional2').attr('disabled','disabled');
        break;
      case 1:
        $('#additional1').attr("placeholder", "Unit Price");
        $('#additional2').attr("placeholder", "Units");
        $('#additional2').removeAttr('disabled');
        break;
      case 2:
        $('#additional1').attr("placeholder", "Unit Price");
        $('#additional2').attr("placeholder", "Units");
        $('#additional2').removeAttr('disabled');
        break;
      case 3:
        $('#additional1').attr("placeholder", "Unit Price");
        $('#additional2').attr("placeholder", "Units");
        $('#additional2').removeAttr('disabled');
        break;
      case 4:
        $('#additional1').attr("placeholder", "Unit Price");
        $('#additional2').attr("placeholder", "Units");
        $('#additional2').removeAttr('disabled');
        break;
      case 5:
        $('#additional1').attr("placeholder", "Amount (Rs.)");
        $('#additional2').attr("placeholder", "Comments");
        $('#additional2').removeAttr('disabled');
        break;
      default:
        $('#additional1').attr("placeholder", "Amount(Rs.)");
        $('#additional2').attr("placeholder", "");
        $('#additional2').attr('disabled','disabled');
    }
  });

  $('#closeButton').click(function(){
    if (confirm("Do you want to close the application?")) {
      window.close();
    } else {
      
    }
  });

  $('#addAdditional').click(function(){
    var exist = false;
    for(var i = 0; i < additionals.length; i++){
      if(additionals[i].index === $( "#additionalTypes" ).val()){
        exist = true;
      }
    }

    if(!exist){
      additionals.push({index: $( "#additionalTypes" ).val(), col1: $( "#additionalTypes option:selected" ).html(), col2: $('#additional1').val(), col3: $('#additional2').val()});
      generateAdditional();
    } else {
      alert("Record Exist");
    }
  });

  $('#createUser').click(function(){
    
    $.get( "/addUser",{nic: $('#userNIC').val(),name: $('#userNameField').val(),mobile: $('#userMobile').val(),account: $('#userAccount').val(),address: $('#userAddress').val()})
    .done(function( data ) {
        alert("Success");
    })
    .fail(function( data ) {
        alert(data.responseText);
    });
    
  });

  $('#addTransaction').click(function(){

    $.get( "/addTransaction",{
      date: $('#trdate').val(),
      nic: $('#userID').val(),
      username: $('#userNameInput').val(),
      grossweight: $('#grossWeight').val(),
      additionals: additionals
    })
    .done(function( data ) {
        alert("Success");
    })
    .fail(function( data ) {
        alert(data.responseText);
    });
    
  });

  $('#repRateSave').click(function(){
    $.get( "/saveRates",{
      year: $('#rep_year').val(),
      month: $('#rep_month').val(),
      price: $('#repPrice').val(),
      stamp: $('#repStamp').val(),
      transport: $('#repTransport').val()
    })
    .done(function( data ) {
        alert("Success");
    })
    .fail(function( data ) {
        alert(data.responseText);
    });
  });

  $('#rep_year').change(function(){
    var d = new Date();
    var year = d.getFullYear();
    var month = (d.getMonth())+1;
    if(year.toString() === $('#rep_year').val().toString()  &&  month.toString() === $('#rep_month').val().toString()){
      $('#repPrice').prop('disabled', false);
      $('#repStamp').prop('disabled', false);
      $('#repTransport').prop('disabled', false);
      $('#repRateSave').prop('disabled', false);
    } else {
      $('#repPrice').prop('disabled', true);
      $('#repStamp').prop('disabled', true);
      $('#repTransport').prop('disabled', true);
      $('#repRateSave').prop('disabled', true);
    }
    $('#repPrice').val("");
    $('#repStamp').val("");
    $('#repTransport').val("");

    $.get( "/getRates",{
      year: $('#rep_year').val(),
      month: $('#rep_month').val()
    })
    .done(function( data ) {
      if(data){
        $('#repPrice').val(data.price);
        $('#repStamp').val(data.stamp);
        $('#repTransport').val(data.transport);
      }
    })
    .fail(function( data ) {
        alert(data.responseText);
    });

  });

  $('#rep_month').change(function(){
    var d = new Date();
    var year = d.getFullYear();
    var month = (d.getMonth())+1;
    if(year.toString() === $('#rep_year').val().toString()  &&  month.toString() === $('#rep_month').val().toString()){
      $('#repPrice').prop('disabled', false);
      $('#repStamp').prop('disabled', false);
      $('#repTransport').prop('disabled', false);
      $('#repRateSave').prop('disabled', false);
    } else {
      $('#repPrice').prop('disabled', true);
      $('#repStamp').prop('disabled', true);
      $('#repTransport').prop('disabled', true);
      $('#repRateSave').prop('disabled', true);
    }
    $('#repPrice').val("");
    $('#repStamp').val("");
    $('#repTransport').val("");
    $.get( "/getRates",{
      year: $('#rep_year').val(),
      month: $('#rep_month').val()
    })
    .done(function( data ) {
      if(data){
        $('#repPrice').val(data.price);
        $('#repStamp').val(data.stamp);
        $('#repTransport').val(data.transport);
      }
    })
    .fail(function( data ) {
        alert(data.responseText);
    });

  });

});