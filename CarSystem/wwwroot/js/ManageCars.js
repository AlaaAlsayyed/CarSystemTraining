function AddNewCar() {
    var carData = {
       // "id": 16,
        "Name": "Juki",
        "PlateNumber": "454545",
        "LicanceId": "321321"
    };

    //console.log(carData);

    var jsonSendData = JSON.stringify(carData);
   // console.log(jsonSendData);

    $.ajax({
        type: "POST",
        url: "/Home/AddCar",
        data: jsonSendData,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (result) {
           // console.log(result);
        },
        error: function () {
            alert('Failed to receive data', true);
        }
    });
}// end function addNewCar

function GetAllCars() {
    $.ajax({
        type: "GET",
        url: "/Home/GetCars",
        dataType: "json",
        success: function (result) {
            console.log("result from Get All Cars:");
            console.log(result);
        },
        error: function () {
            alert('Failed to receive data', true);
        }
    });
}


$(document).ready(function () {
    GetAllCars();

    $("#btnAddCar").on("click", function () {
        AddNewCar();
    });

    $("#btnGetAllCars").on("click", function () {
        GetAllCars();
    });
})

