var customers = [];
var nicList = [];
var fullUserList = [];
var additionals = [];
var selectedUser = {};
var transactionList = [];

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

autocomplete(document.getElementById("repNIC"), nicList, document.getElementById("repName"),"name");
autocomplete(document.getElementById("repName"), customers, document.getElementById("repNIC"),"nic");
// autocomplete(document.getElementById("userSearch"), customers);

async function printDiv(nic) {
  var obj = await getTransactionData(nic);
  console.log(obj,"getTransactionData");
  
  $.get( "/generatePDF",obj )
  .done(function( data ) {
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: data.responseText
      });
  })
  .fail(function( data ) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: data.responseText
    });
  });
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

function getUser(nic){
  var out = {};
  $.ajax({
    url: "/getUser",
    data: {nic},
    type: 'GET',
    async: false,
    cache: false,
    timeout: 30000,
    error: function(){
        return false;
    },
    success: function(data){ 
      console.log(data);
      out = data;
      return data;
    }
});
console.log(out),"Returning";

return out;
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
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: data.responseText
    });
  });
}

function fetchTransaction(year,month){
  $.get( "/listTransactions",{
    year,
    month
  })
  .done(function( data ) {
    transactionList = data;
  })
  .fail(function( data ) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: data.responseText
    });
  });
}

function getTransactionData(nicID){
    var nic = nicID;
    var gross = 0;
    var loss = 0;
    var adv = 0;
    var tea = 0;
    var fer = 0;
    var dol = 0;
    var ded = 0;
    var poi = 0;
    var total = 0;

    var user = {};
    user = getUser(nicID);
    console.log(user);
    
    var d_def = new Date();
    var year_def = d_def.getFullYear();
    var month_def = (d_def.getMonth())+1;

    fetchTransaction(year_def,month_def);

    transactionList.forEach(transaction => {
      if(transaction.nic === nic){
        gross += parseFloat(transaction.grossWeight);
        adv += parseFloat(transaction.add0_amount);
        tea += parseFloat(transaction.add4_amount);
        fer += parseFloat(transaction.add1_amount);
        dol += parseFloat(transaction.add3_amount);
        ded += parseFloat(transaction.add5_amount);
        poi += parseFloat(transaction.add2_amount);
      }
    });
    var gross_amount = gross * parseFloat($('#repPrice').val());
    var deduct = loss+adv+tea+fer+dol+ded+poi+parseFloat($('#repStamp').val())+parseFloat($('#repTransport').val());
    total = gross_amount - deduct;

    return {
      month_string: $( "#rep_year").val() +" - "+$( "#rep_month option:selected" ).html(),
      grossweight: gross,
      rupees: total,
      cents: total,
      name: user.name,
      address: user.address,
      uid: user.nic,
      price: $('#repPrice').val(),
      total_amount: gross_amount,
      addi0: adv,
      transport: $('#repTransport').val(),
      addi1: fer,
      addi5: ded,
      addi4: tea,
      stamps: $('#repStamp').val(),
      addi3: dol,
      total_deduct: deduct,
      total_pay: total,
      month: $("#rep_month").val(),
      year: $( "#rep_year").val()
    };
}

$( document ).ready(function() {

  fetchUserData();

  $('#trdate').val(moment().format('YYYY-MM-DD'));

  var d_def = new Date();
  var year_def = d_def.getFullYear();
  var month_def = (d_def.getMonth())+1;

  $( "select#rep_year" ).val(year_def.toString());
  $( "select#rep_month" ).val(month_def.toString());

  fetchTransaction(year_def,month_def);

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
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: data.responseText
    });
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
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: "Record Exist"
      });
    }
  });

  $('#createUser').click(function(){
    
    $.get( "/addUser",{nic: $('#userNIC').val(),name: $('#userNameField').val(),mobile: $('#userMobile').val(),account: $('#userAccount').val(),address: $('#userAddress').val()})
    .done(function( data ) {
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: "done"
      });
    })
    .fail(function( data ) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: data.responseText
      });
    });
    
  });

  $('#addTransaction').click(function(){
    var dateSplitted = ($('#trdate').val()).split("-");
    console.log(dateSplitted);
    
    $.get( "/addTransaction",{
      month: dateSplitted[1],
      date: dateSplitted[2],
      year: dateSplitted[0],
      nic: $('#userID').val(),
      username: $('#userNameInput').val(),
      grossweight: $('#grossWeight').val(),
      additionals: additionals
    })
    .done(function( data ) {
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: "done"
      });
    })
    .fail(function( data ) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: data.responseText
      });
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
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Done'
        });
    })
    .fail(function( data ) {
      Swal.fire({
        icon: 'Error',
        title: 'Error occured',
        text: 'Done'
      });
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
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: data.responseText
      });
    });

    fetchTransaction($('#rep_year').val(),$('#rep_month').val());

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
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: data.responseText
        });
    });

    fetchTransaction($('#rep_year').val(),$('#rep_month').val());

  });

  $('#repNIC').focusout(function(){
    var nic = $('#repNIC').val();
    var gross = 0;
    var loss = 0;
    var adv = 0;
    var tea = 0;
    var fer = 0;
    var dol = 0;
    var ded = 0;
    var poi = 0;
    var total = 0;
    transactionList.forEach(transaction => {
      
      if(transaction.nic === nic){
        gross += parseFloat(transaction.grossWeight);
        adv += parseFloat(transaction.add0_amount);
        tea += parseFloat(transaction.add4_amount);
        fer += parseFloat(transaction.add1_amount);
        dol += parseFloat(transaction.add3_amount);
        ded += parseFloat(transaction.add5_amount);
        poi += parseFloat(transaction.add2_amount);
      }
    });
    $('#repGross').html(gross);
    $('#repLoss').html(loss);
    $('#repAdv').html(adv);
    $('#repTea').html(tea);
    $('#repFer').html(fer);
    $('#repDol').html(dol);
    $('#repOther').html(ded);
    $('#repPoi').html(poi);
    var gross_amount = gross * parseFloat($('#repPrice').val());
    var deduct = loss+adv+tea+fer+dol+ded+poi+parseFloat($('#repStamp').val())+parseFloat($('#repTransport').val());
    $('#repDed').html(deduct);
    $('#repTotal').html(gross_amount-deduct);
  });

  $('#repGenerate').click(function(){
    printDiv($('#repNIC').val());
  });

  $('#repGenerateAll').click(function(){
    fetchUserData();
    nicList.forEach(nic => {
      printDiv(nic);
    });
  });

  $('#repPrintAll').click(function(){
    $.get( "/printAllPDF",{ folder: $( "#rep_year").val() +" - "+$( "#rep_month option:selected" ).html() } )
    .done(function( data ) {
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: "Done"
      });
    })
    .fail(function( data ) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: data.responseText
      });
    });
  });

});