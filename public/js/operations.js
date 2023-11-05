var customers = [];
var memIdList = [];
var fullUserList = [];
var additionals = [];
var selectedUser = {};
var transactionList = [];
let transactionViewList = [];
var debtUsers = [];
var bankUsers = [];

function autocomplete(inp, arr, ext, prop) {
  /*the autocomplete function takes two arguments,
  the text field element and an array of possible autocompleted values:*/
  var currentFocus;
  /*execute a function when someone writes in the text field:*/
  inp.addEventListener("input", function (e) {
    var a, b, i, val = this.value;
    /*close any already open lists of autocompleted values*/
    closeAllLists();
    if (!val) { return false; }
    currentFocus = -1;
    /*create a DIV element that will contain the items (values):*/
    a = document.createElement("DIV");
    a.setAttribute("id", this.id + "autocomplete-list");
    a.setAttribute("class", "autocomplete-items");
    /*append the DIV element as a child of the autocomplete container:*/
    this.parentNode.appendChild(a);
    /*for each item in the array...*/
    // console.log("ARRAY", arr);

    for (i = 0; i < arr.length; i++) {
      /*check if the item starts with the same letters as the text field value:*/
      if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
        /*create a DIV element for each matching element:*/
        b = document.createElement("DIV");
        /*make the matching letters bold:*/
        b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
        b.innerHTML += arr[i].substr(val.length);
        /*insert a input field that will hold the current array item's value:*/
        b.innerHTML += "<input type='hidden' value='" + arr[i] + "|" + i + "'>";
        /*execute a function when someone clicks on the item value (DIV element):*/
        b.addEventListener("click", function (e) {
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
  inp.addEventListener("keydown", function (e) {
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

autocomplete(document.getElementById("userNameInput"), customers, document.getElementById("memID"), "id");
autocomplete(document.getElementById("memID"), memIdList, document.getElementById("userNameInput"), "name");

autocomplete(document.getElementById("repNIC"), memIdList, document.getElementById("repName"), "name");
autocomplete(document.getElementById("repName"), customers, document.getElementById("repNIC"), "id");
// autocomplete(document.getElementById("userSearch"), customers);

async function printDiv(nic) {
  var obj = await getTransactionData(nic);
  console.log(obj, "getTransactionData");
  // obj.uid = document.getElementById("repNIC").value;
  // obj.name = document.getElementById("repName").value;
  $.get("/generatePDF", obj)
    .done(function (data) {
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: data.responseText
      });
    })
    .fail(function (data) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: data.responseText
      });
    });
}

async function printDebts(debt_arr,month_string){
  console.log("Printing Debts",debt_arr);
  $.get("/generateDebts", {debtArr: debt_arr, month_string: month_string})
  .done(function (data) {
    Swal.fire({
      icon: 'success',
      title: 'Success',
      text: data.responseText
    });
  })
  .fail(function (data) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: data.responseText
    });
  });
}

async function printBanks(bankArr, bank, month_string){
  console.log("Printing Banks",bankArr);
  $.get("/generateBanks", {bankArr: bankArr, bank: bank, month_string: month_string})
  .done(function (data) {
    Swal.fire({
      icon: 'success',
      title: 'Success',
      text: data.responseText
    });
  })
  .fail(function (data) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: data.responseText
    });
  });
}

function generateAdditional() {
  $("#tableContainer").empty();
  var content = "<table>";
  for (i = 0; i < additionals.length; i++) {
    content += `<tr>`;
    content += `<td>` + additionals[i].col1 + `</td>`;
    content += `<td>` + additionals[i].col2 + `</td>`;
    content += `<td>` + additionals[i].col3 + `</td>`;
    content += `<td><button class="btn btn-danger" id="addAdditional" onclick="removeAdditional(` + i + `)"><i class="fas fa-times-circle"></i></button></td>`;
    content += `<tr>`;
  }
  content += `</table>`;
  $('#tableContainer').append(content);
}

function editTransctionModal(pos){
  console.log("TRANS",pos,transactionViewList[pos]);
  $('#viewDate').html(transactionViewList[pos].date);
  $('#viewGrossWeight').val(transactionViewList[pos].grossWeight);
  $('#viewAdd0UnitPrice').val(transactionViewList[pos].add0_amount);
  
  $('#viewAdd1Units').val(transactionViewList[pos].add1_units);
  $('#viewAdd1UnitPrice').val(transactionViewList[pos].add1_unit_price);
  $('#viewAdd1Amount').val(transactionViewList[pos].add1_amount);

  $('#viewAdd2Units').val(transactionViewList[pos].add2_units);
  $('#viewAdd2UnitPrice').val(transactionViewList[pos].add2_unit_price);
  $('#viewAdd2Amount').val(transactionViewList[pos].add2_amount);

  $('#viewAdd3Units').val(transactionViewList[pos].add3_units);
  $('#viewAdd3UnitPrice').val(transactionViewList[pos].add3_unit_price);
  $('#viewAdd3Amount').val(transactionViewList[pos].add3_amount);

  $('#viewAdd4Units').val(transactionViewList[pos].add4_units);
  $('#viewAdd4UnitPrice').val(transactionViewList[pos].add4_unit_price);
  $('#viewAdd4Amount').val(transactionViewList[pos].add4_amount);
  
  $('#viewAdd5Amount').val(transactionViewList[pos].add5_amount);
  $('#viewAdd5Comments').val(transactionViewList[pos].add5_comments);

  document.getElementById("myDialog").showModal(); 
}

function deleteTransaction(){
  $.get("/deleteTransaction", {
    year: $('#rep_year_rep').val(),
    month: $('#rep_month_rep').val(),
    id: $('#viewMemID').val(),
    date: $('#viewDate').html(),
  })
    .done(function (data) {
      document.getElementById("myDialog").close();
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Done'
      });
      location.reload();
    })
    .fail(function (data) {
      document.getElementById("myDialog").close();
      Swal.fire({
        icon: 'Error',
        title: 'Error occured',
        text: 'Done'
      });
    });
}

function updateTransaction(){
  $.get("/updateTransaction", {
    year: $('#rep_year_rep').val(),
    month: $('#rep_month_rep').val(),
    id: $('#viewMemID').val(),
    date: $('#viewDate').html(),
    grossWeight: $('#viewGrossWeight').val(),
    add0_amount: $('#viewAdd0UnitPrice').val(),
    add1_units: $('#viewAdd1Units').val(),
    add1_unit_price: $('#viewAdd1UnitPrice').val(),
    add1_amount: $('#viewAdd1Amount').val(),
    add2_units: $('#viewAdd2Units').val(),
    add2_unit_price: $('#viewAdd2UnitPrice').val(),
    add2_amount: $('#viewAdd2Amount').val(),
    add3_units: $('#viewAdd3Units').val(),
    add3_unit_price: $('#viewAdd3UnitPrice').val(),
    add3_amount: $('#viewAdd3Amount').val(),
    add4_units: $('#viewAdd4Units').val(),
    add4_unit_price: $('#viewAdd4UnitPrice').val(),
    add4_amount: $('#viewAdd4Amount').val(),
    add5_amount: $('#viewAdd5Amount').val(),
    add5_comments: $('#viewAdd5Comments').val(),
  })
    .done(function (data) {
      document.getElementById("myDialog").close();
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Done'
      });
    })
    .fail(function (data) {
      document.getElementById("myDialog").close();
      Swal.fire({
        icon: 'Error',
        title: 'Error occured',
        text: 'Done'
      });
    });
}

function getUser(nic) {
  return $.ajax({
    url: "/getUser",
    data: { nic },
    type: 'GET'
  });
}

function listTransactionsPerUser(month, year, id) {
  return $.ajax({
    url: "/listTransactionsPerUser",
    data: { month, year, id },
    type: 'GET'
  });
}

function fetchUserData() {
  $.get("/listUsers")
    .done(function (data) {
      console.log(data);
      fullUserList = data;
      for (var i = 0; i < data.length; i++) {
        customers.push(data[i].name);
        memIdList.push((data[i].id).toString());
      }
    })
    .fail(function (data) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: data.responseText
      });
    });
}

function fetchTransaction(year, month) {
  return $.get("/listTransactions", {
    year,
    month
  });
    // .done(function (data) {
    //   console.log("FETHED TRANSACTION",data);
      
    //   transactionList = data;
    // })
    // .fail(function (data) {
    //   Swal.fire({
    //     icon: 'error',
    //     title: 'Error',
    //     text: data.responseText
    //   });
    // });
}

async function getTransactionData(memID) {
  var id = memID;
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
  user = await getUser(memID);

  var d_def = new Date();
  var year_def = d_def.getFullYear();
  var month_def = (d_def.getMonth()) + 1;

  transactionList = await fetchTransaction(year_def, month_def);
  let transDebtName = null;
  transactionList.forEach(transaction => {
    if ((transaction.id).toString() === (id).toString()) {
      transDebtName = transaction.username;
      if(transaction.grossWeight !== ""){
        gross += parseFloat(transaction.grossWeight);
      }
      adv += parseFloat(transaction.add0_amount);
      tea += parseFloat(transaction.add4_amount);
      fer += parseFloat(transaction.add1_amount);
      dol += parseFloat(transaction.add3_amount);
      ded += parseFloat(transaction.add5_amount);
      poi += parseFloat(transaction.add2_amount);
    }
  });
  var gross_amount = gross * parseFloat($('#repPrice').val());
  var ded_amount = parseFloat($('#repPrice').val()) * Math.round(gross * (parseInt($('#repPercent').val())*0.01));
  var ded_kilos = Math.round(gross * (parseInt($('#repPercent').val())*0.01));
  var net_kilo = gross - ded_kilos;
  var deduct = ded_amount + loss + adv + tea + fer + dol + ded + poi +(net_kilo * parseFloat($('#repTransport').val()));
  total = gross_amount - deduct;

  if(total < 0){
    debtUsers.push(
      {
        id: memID,
        name: transDebtName,
        debt: total
      }
    );
  }

  if(user.bank !== null){
    let bank = parseInt(user.bank);
    console.log("UserBank",bank);
    // bankUsers[bank].push({ user: user, total: total });
  }

  $.ajax({
    url: "/saveSummary",
    data: { year: parseInt($("#rep_year").val()),month: parseInt($("#rep_month").val()),uid: user.id,name: user.name,kilos: net_kilo,amount: total },
    type: 'GET'
  });

  let objReturn = {
    month_string: $("#rep_year").val() + " - " + $("#rep_month option:selected").html(),
    grossweight: (gross - (Math.round(gross * (parseInt($('#repPercent').val())*0.01)))),
    rupees: total,
    cents: "00",
    name: user.name,
    address: user.address,
    uid: user.id,
    price: $('#repPrice').val(),
    total_amount: (gross_amount - ded_amount),
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
    year: $("#rep_year").val()
  };

  return objReturn;
}

$(document).ready(function () {

  fetchUserData();

  $('#trdate').val(moment().format('YYYY-MM-DD'));

  var d_def = new Date();
  var year_def = d_def.getFullYear();
  var month_def = (d_def.getMonth()) + 1;

  $("select#rep_year").val(year_def.toString());
  $("select#rep_month").val(month_def.toString());

  fetchTransaction(year_def, month_def);

  $.get("/getRates", {
    year: $('#rep_year').val(),
    month: $('#rep_month').val()
  })
    .done(function (data) {
      if (data) {
        $('#repPrice').val(data.price);
        $('#repStamp').val(data.stamp);
        $('#repTransport').val(data.transport);
      }
    })
    .fail(function (data) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: data.responseText
      });
    });

  $("#additionalTypes").change(function () {

    switch (parseInt($(this).val())) {
      case 0:
        $('#additional1').attr("placeholder", "Amount(Rs.)");
        $('#additional2').attr("placeholder", "");
        $('#additional2').attr('disabled', 'disabled');
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
        $('#additional2').attr('disabled', 'disabled');
    }
  });

  $('#closeButton').click(function () {
    if (confirm("Do you want to close the application?")) {
      window.close();
    } else {

    }
  });

  $('#repGenerateBanks').click(function (){
    let bankNames = ["Sampath Bank","BOC", "Peoples' Bank", "Rural Bank", "RDB", "NSB", "SDB"];
    for(var i = 0; i < bankUsers.length; i++){
      if(bankUsers[i].length > 0){
        printBanks(bankUsers[i], bankNames[i], $("#rep_year").val() + " - " + $("#rep_month option:selected").html());
      }
    }
  });

  $('#addAdditional').click(function () {
    var exist = false;
    for (var i = 0; i < additionals.length; i++) {
      if (additionals[i].index === $("#additionalTypes").val()) {
        exist = true;
      }
    }

    if (!exist) {
      additionals.push({ index: $("#additionalTypes").val(), col1: $("#additionalTypes option:selected").html(), col2: $('#additional1').val(), col3: $('#additional2').val() });
      generateAdditional();
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: "Record Exist"
      });
    }
  });

  $('#memberID').on('input', async function(event) {
    let user = await getUser(event.target.value);
    console.log("MemberID",event.target.value,user,(user===""));
    if(user!==""){
      $('#userNIC').val(user.nic);
      $('#userNameField').val(user.name);
      $('#userMobile').val(user.mobile);
      $('#userAddress').val(user.address);
      if(user.account !== null){
        $('#userAccount').val(user.account);
      }
      if(user.bank !== null){
        $('#userBank').val(user.bank);
      }
    } else {
      $('#userNIC').val("");
      $('#userNameField').val("");
      $('#userMobile').val("");
      $('#userAddress').val("");
      $('#userAccount').val("");
      $('#userBank').val("");
    }
  });

  $('#viewMemID').on('input', async function(event) {
    let user = await getUser(event.target.value);
    if(user!==""){
      $('#viewTbl').html("");
      transactionViewList = await listTransactionsPerUser($('#rep_month_rep').val(),$('#rep_year_rep').val(),event.target.value);
      $('#viewMemName').val(user.name);
      if(transactionViewList.length > 0){
        for(let i = 0; i < transactionViewList.length; i++){
          $('#viewTbl').append(`<tr onclick="editTransctionModal(`+i+`)"><td>`+transactionViewList[i].date+`</td>`+
          `<td>`+transactionViewList[i].grossWeight+`</td>`+
          `<td>`+transactionViewList[i].add0_amount+`</td>`+
          `<td>`+transactionViewList[i].add1_units+`|`+transactionViewList[i].add1_unit_price+`|`+transactionViewList[i].add1_amount+`</td>`+
          `<td>`+transactionViewList[i].add2_units+`|`+transactionViewList[i].add2_unit_price+`|`+transactionViewList[i].add2_amount+`</td>`+
          `<td>`+transactionViewList[i].add3_units+`|`+transactionViewList[i].add3_unit_price+`|`+transactionViewList[i].add3_amount+`</td>`+
          `<td>`+transactionViewList[i].add4_units+`|`+transactionViewList[i].add4_unit_price+`|`+transactionViewList[i].add4_amount+`</td>`+
          `<td>`+transactionViewList[i].add5_amount+`|`+transactionViewList[i].add5_comments+`</td>`+
          `</tr>`);
        }
      }
    } else {
      $('#viewTbl').html("");
    }
  });

  $('#createUser').click(function () {
    if ($('#memberID').val() === "" || $('#userNameField').val() === "") {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: "Username and member ID required"
      });
    } else {
      $.get("/addUser", { id: $('#memberID').val(), nic: $('#userNIC').val(), name: $('#userNameField').val(), mobile: $('#userMobile').val(), bank: $('#userBank').val(), account: $('#userAccount').val(), address: $('#userAddress').val() })
        .done(function (data) {
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: "done"
          });
        })
        .fail(function (data) {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: data.responseText
          });
        });
    }
  });

  function addTransaction(dateSplitted) {
    $.get("/addTransaction", {
      month: dateSplitted[1],
      date: dateSplitted[2],
      year: dateSplitted[0],
      memberId: $('#memID').val(),
      username: $('#userNameInput').val(),
      grossweight: $('#grossWeight').val(),
      additionals: additionals
    })
      .done(function (data) {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: "done"
        });
        $('#grossWeight').val("0");
        $('#memID').val("");
        $('#userNameInput').val("");
        $('#additionalTypes').val(0);
        $('#additional1').val("");
        $('#additional2').val("");
        $('#tableContainer').html("");
      })
      .fail(function (data) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: data.responseText
        });
        $('#grossWeight').val("0");
        $('#memID').val("");
        $('#userNameInput').val("");
        $('#additionalTypes').val(0);
        $('#additional1').val("");
        $('#additional2').val("");
        $('#tableContainer').html("");
      });
  }

  $('#addTransaction').click(function () {
    var dateSplitted = ($('#trdate').val()).split("-");
    console.log("MemVal",$('#memID').val());
    if ($('#memID').val() === "" || $('#userNameInput').val() === "") {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: "Member ID and Username is required"
      });
      $('#grossWeight').val("0");
    } else {
      if ($('#grossWeight').val() === "0") {
        Swal.fire({
          title: 'Are you sure?',
          text: "Gross weight is '0'. Do you want to save!",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Yes, save it!'
        }).then((result) => {
          if(result.value === true){
            addTransaction(dateSplitted);
          }
        })
      } else {
        addTransaction(dateSplitted);
      }
    }
  });

  $('#repRateSave').click(function () {
    $.get("/saveRates", {
      year: $('#rep_year').val(),
      month: $('#rep_month').val(),
      price: $('#repPrice').val(),
      stamp: $('#repStamp').val(),
      transport: $('#repTransport').val()
    })
      .done(function (data) {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Done'
        });
      })
      .fail(function (data) {
        Swal.fire({
          icon: 'Error',
          title: 'Error occured',
          text: 'Done'
        });
      });
  });

  $('#rep_year').change(function () {
    var d = new Date();
    var year = d.getFullYear();
    var month = (d.getMonth()) + 1;
    // if (year.toString() === $('#rep_year').val().toString() && month.toString() === $('#rep_month').val().toString()) {
    //   $('#repPrice').prop('disabled', false);
    //   $('#repStamp').prop('disabled', false);
    //   $('#repTransport').prop('disabled', false);
    //   $('#repRateSave').prop('disabled', false);
    // } else {
    //   $('#repPrice').prop('disabled', true);
    //   $('#repStamp').prop('disabled', true);
    //   $('#repTransport').prop('disabled', true);
    //   $('#repRateSave').prop('disabled', true);
    // }
    $('#repPrice').prop('disabled', false);
    $('#repStamp').prop('disabled', false);
    $('#repTransport').prop('disabled', false);
    $('#repRateSave').prop('disabled', false);
    $('#repPrice').val("");
    $('#repStamp').val("");
    $('#repTransport').val("");

    $.get("/getRates", {
      year: $('#rep_year').val(),
      month: $('#rep_month').val()
    })
      .done(function (data) {
        if (data) {
          $('#repPrice').val(data.price);
          $('#repStamp').val(data.stamp);
          $('#repTransport').val(data.transport);
        }
      })
      .fail(function (data) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: data.responseText
        });
      });

    fetchTransaction($('#rep_year').val(), $('#rep_month').val());

  });

  $('#rep_month').change(function () {
    var d = new Date();
    var year = d.getFullYear();
    var month = (d.getMonth()) + 1;
    // if (year.toString() === $('#rep_year').val().toString() && month.toString() === $('#rep_month').val().toString()) {
    //   $('#repPrice').prop('disabled', false);
    //   $('#repStamp').prop('disabled', false);
    //   $('#repTransport').prop('disabled', false);
    //   $('#repRateSave').prop('disabled', false);
    // } else {
    //   $('#repPrice').prop('disabled', true);
    //   $('#repStamp').prop('disabled', true);
    //   $('#repTransport').prop('disabled', true);
    //   $('#repRateSave').prop('disabled', true);
    // }

    $('#repPrice').prop('disabled', false);
    $('#repStamp').prop('disabled', false);
    $('#repTransport').prop('disabled', false);
    $('#repRateSave').prop('disabled', false);

    $('#repPrice').val("");
    $('#repStamp').val("");
    $('#repTransport').val("");
    $.get("/getRates", {
      year: $('#rep_year').val(),
      month: $('#rep_month').val()
    })
      .done(function (data) {
        if (data) {
          console.log("DATA1",data);
          $('#repPrice').val(data.price);
          $('#repStamp').val(data.stamp);
          $('#repTransport').val(data.transport);
        }
      })
      .fail(function (data) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: data.responseText
        });
      });

    fetchTransaction($('#rep_year').val(), $('#rep_month').val());

  });

  $('#repNIC').on('input', async function(event) {
    var id = $('#repNIC').val();
    var gross = 0;
    var loss = 0;
    var adv = 0;
    var tea = 0;
    var fer = 0;
    var dol = 0;
    var ded = 0;
    var poi = 0;
    var total = 0;
    transactionList = await fetchTransaction($('#rep_year').val(), $('#rep_month').val());
    console.log("TransactionList",transactionList);
    transactionList.forEach(transaction => {
      if ((transaction.id).toString() === (id).toString()) {
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
    var ded_amount = parseFloat($('#repPrice').val()) * Math.round(gross * (parseInt($('#repPercent').val())*0.01));
    var ded_kilos = Math.round(gross * (parseInt($('#repPercent').val())*0.01));
    var net_kilo = gross - ded_kilos;
    var deduct = ded_amount + loss + adv + tea + fer + dol + ded + poi +(net_kilo * parseFloat($('#repTransport').val()));
    total = gross_amount - deduct;

    $('#repGross').html(gross);
    $('#repLoss').html(loss);
    $('#repAdv').html(adv);
    $('#repTea').html(tea);
    $('#repFer').html(fer);
    $('#repDol').html(dol);
    $('#repOther').html(ded);
    $('#repPoi').html(poi);
    $('#repDed').html(deduct);
    $('#repTotal').html(gross_amount - deduct);
  });

  $('#repGenerate').click(function () {
    printDiv($('#repNIC').val());
  });

  function fetchTransactionPerUser(year, month, id) {
    return $.get("/getTransactionPerUser", {
      year,
      month,
      id
    });
  }

  function fetchOtherExpenses(year, month, id) {
    return $.get("/getOtherExpenses", {
      year,
      month,
      id
    });
  }

  async function generateAllReports(pos){
    console.log("Generating For",pos);
    if(pos < memIdList.length){
      console.log("POS",pos);
      var obj = await fetchTransactionPerUser(parseInt($("#rep_year").val()),parseInt($("#rep_month").val()),memIdList[pos].id);
      if(obj.weight !== null){
        let other_expenses = await fetchOtherExpenses(parseInt($("#rep_year").val()),parseInt($("#rep_month").val()),memIdList[pos].id);
        let netWeight = parseFloat(obj.weight - (Math.round(obj.weight * (parseInt($('#repPercent').val())*0.01))));
        let total_deduct = parseFloat(obj.advance)+parseFloat(obj.fertilizer)+parseFloat(obj.poison)+parseFloat(obj.dolomite)+parseFloat(obj.tea)+parseFloat(obj.other)+parseFloat((netWeight * parseFloat($('#repTransport').val())))+parseFloat(obj.past);
        console.log("OtherEx",other_expenses,other_expenses[0],other_expenses[1]);
        let repOutput = await genReport({
                          month_string: $("#rep_year").val() + " - " + $("#rep_month option:selected").html(),
                          grossweight: netWeight,
                          rupees: ((netWeight * parseFloat($('#repPrice').val())) - total_deduct),
                          cents: "00",
                          name: memIdList[pos].name,
                          address: memIdList[pos].address,
                          uid: memIdList[pos].id,
                          price: $('#repPrice').val(),
                          total_amount: (netWeight * parseFloat($('#repPrice').val())),
                          addi0: obj.advance,
                          transport: (netWeight * parseFloat($('#repTransport').val())),
                          addi1: obj.fertilizer,
                          addi5: obj.other,
                          addi4: obj.tea,
                          addi2: obj.poison,
                          stamps: $('#repStamp').val(),
                          addi3: obj.dolomite,
                          total_deduct: total_deduct,
                          total_pay: ((netWeight * parseFloat($('#repPrice').val())) - total_deduct),
                          month: $("#rep_month").val(),
                          year: $("#rep_year").val(),
                          total_debt: obj.past,
                          other_expense1: (other_expenses.length > 0) ? (other_expenses[0].add5_amount+" ("+other_expenses[0].add5_comments+")"):null,
                          other_expense2: (other_expenses.length > 1) ? (other_expenses[1].add5_amount+" ("+other_expenses[1].add5_comments+")"):null,
                        },pos);
      } else {
        generateAllReports((pos+1));
      }
    } else {
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: "Report Generation Successful"
      });
    }
  }

  function genReport(obj,pos){
    $.get("/generatePDF", obj)
    .done(function(val){
      generateAllReports((pos+1));
    })
    .fail(function (data) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: "Error occured"
      });
    }); 
  }

  async function userData(){
    return $.get("/listUsers")
  }

  $( "#repOtherAddSave" ).click(function() {
    $.get("/updatePast", {past: parseFloat($('#repOtherAdd').val()), month: $("#rep_month").val(), year: $("#rep_year").val(), id : $("#repNIC").val(), date: 1})
    .done(function (out) {
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: "User debt updated"
      });
    })
  });

  $('#repGenerateAll').click(async function () {
    // fetchUserData();
    // debtUsers = [];
    // bankUsers = [[],[],[],[],[],[],[]];
    // memIdList.forEach(id => {
    //   printDiv(id);
    // });
    // console.log("Debt Users",debtUsers);
    // printDebts(debtUsers,$("#rep_year").val() + " - " + $("#rep_month option:selected").html());
    memIdList = await userData();
    console.log("MEMList",memIdList);
    generateAllReports(0);
  });

  $('#repPrintSummary').click(function(){
    $.get("/getSummary", {
      year: $('#rep_year_rep').val(),
      month: $('#rep_month_rep').val()
    })
    .done(function (summary) {
      $.get("/printSummary", {
        summary: summary,
        year: $('#rep_year_rep').val(),
        month: $('#rep_month_rep').val()
      })
    })
    .fail(function (data) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: data.responseText
      });
    });  
  });

  $('#repPrintAll').click(function () {
    $.get("/printAllPDF", { folder: $("#rep_year").val() + " - " + $("#rep_month option:selected").html() })
      .done(function (data) {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: "Done"
        });
      })
      .fail(function (data) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: data.responseText
        });
      });
  });

  $('#repPrintOne').click(function () {
    $.get("/printPDF", { folder: $("#rep_year").val() + " - " + $("#rep_month option:selected").html(), file: $("#repNIC").val() + "_" + $("#repName").val() + ".pdf" })
      .done(function (data) {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: "Done"
        });
      })
      .fail(function (data) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: data.responseText
        });
      });
  });

});