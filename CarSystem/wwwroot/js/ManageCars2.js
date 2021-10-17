var table = null;
var editor;
var input_filter_timeout = [];
var isFirstLoad = true;
var Operators = null;

function GetTableColumnsDefinition() {
    var columns = [
        { // checkbox column
            title: 'select',
            data: null,
            orderable: false,
            searchable: false,
            defaultContent: '',
            className: 'dt-body-center select-checkbox'
        },
        { // edit button column
            title: 'edit',
            data: null,
            orderable: false,
            searchable: false,
            defaultContent: '<a class="edit text-primary" title="Edit Row"> \
                                <span class="fa fa-wrench" aria-hidden="true"></span> \
                            </a>'
        },
        {
            'data': 'Id',
            title: 'DB key',
            visible: false
        },
        {
            'data': 'Name',
            title: 'Car Name',
            className: 'editable inline',
            editable: true
        },
        {
            'data': 'PlateNumber',
            title: 'Plate Number',
            className: 'editable inline',
            editable: true
        },
        {
            'data': 'LicanceId',
            title: 'Licance Id',
            className: 'editable inline',
            editable: true
        }
    ];
    return columns;
}// end function GetTableColumnsDefinition

function createSearchTable() {
    if (table !== null) {
        $('.tblReport').dataTable().fnDestroy();
        $('.tblReport').empty();
        table = null;
    }
    else {
        // Add event listener for columns visibility
        $('.tblReport').on('column-visibility.dt', function (e, settings, column, state) {
            // when using fix header, the table header is copied to another table on the bottom of the html
            var $columns = $('.dataTable thead tr.table_filters').find('th:eq(' + column + ')');
            console.log('Column ' + column + ' has changed to ' + (state ? 'visible' : 'hidden'));
            if (state)
                $columns.show();
            else
                $columns.hide();
        });

        // Add event listener for select all CheckBox
        $('body').on('click', '.checkAll', function (e) {
            if (this.checked) {
                table.rows({ page: 'current' }).select();
            }
            else {
                table.rows({ selected: true }).deselect();
            }
            $('.checkAll').prop('checked', this.checked);
        });// end $('#btnReportCheckBox').on('click'
    }
    var columns = GetTableColumnsDefinition();

    table = $('.tblReport')
        .DataTable({
            //dom: 'Bfrtip',
            dom: '<"dom_wrapper fh-fixedHeader"Bf>tip',
            select: {
                style: 'os',
                selector: 'td:first-child'
            },
            ajax: {
                type: "GET",
                url: "/Home/GetCars",
                contentType: "application/json;",
                dataType: "json",
                dataSrc: function (json) {
                    return json;
                },
                error: function (xhr, textStatus, error) {
                    console.log(' AJAX ERROR');
                    if ($.trim(xhr.responseText) !== '') {
                        var msg = xhr.responseText;
                        if (msg.hasOwnProperty('d') && msg.d.startsWith('Error:'))
                            console.log(msg.d);
                        else
                            console.log(msg);
                    }
                    console.log(xhr.responseText);
                }
            },
            searchDelay: 500,
            'columns': columns,
            deferRender: true,
            lengthMenu: [ // page sizes
                [10, 25, 50, 100, 200, 500, 1000, 2000], // values (-1 = - all)
                [10, 25, 50, 100, 200, 500, 1000, 2000] // text
            ],
            iDisplayLength: 50,
            buttons: [
                'pageLength', // 'excel',
                'colvis',
                'csv',
                {
                    text: '<span class="fa fa-plus" aria-hidden="true"></span> Add new Car',
                    titleAttr: 'Add a new Car',
                    action: function (e, dt, node, config) {
                        resetModalFeilds();
                        $('#NewCarModal').modal('show');
                        // $('.select2-dropdown').select2();
                    }
                },
                {
                    text: '<span class="fa fa-refresh"></span> Refresh',
                    action: function (e, dt, node, config) {
                        table.ajax.url("/Home/GetCars").load();
                    }
                },
            ],
            initComplete: function (settings, json) {

            }
        });// end DataTable

    $.fn.dataTable.ext.errMode = function (settings, helpPage, message) {
        var error_message = message.replace('DataTables warning: table id=' + settings.nTable.id + ' - ', '');
        console.error(error_message);
        TopAlert(error_message, 'danger', 5);
    };

    $('.dataTable thead th:first').width('50px');

    // create row to add the search boxes
    var $tr = $('<tr />', {
        'class': 'table_filters'
    });
    $('.dataTable thead').append($tr);

    // Apply the search
    table.columns().every(function (i) {
        var that = this;
        var title = $(that.header()).text();
        var searchable = that.settings()[0].aoColumns[i].bSearchable;
        // console.log(i, title);
        var $th = $('<th />');
        if (i === 0) {
            var checkAll = '<div class="custom-control custom-checkbox ml-3"> \
                                <input type="checkbox" class="custom-control-input checkAll" name="checkAll" title="Check / Uncheck all rows" data-title="' + title + '" id="headerList' + i + '" list="headerList' + i + '" /> \
                                <label class="custom-control-label" for="headerList' + i + '"></label> \
                            </div>';
            $th.append(checkAll);
        }
        else if ((title != null) && (title != '') && searchable) {
            $th.append('<input type="text" class="form-control" placeholder="" data-title="' + title + '" list="headerList' + i + '" />');
        }
        $tr.append($th);

        if (!this.visible()) {
            $th.hide();
        }// end if (that.visible())
        if (i != 0) {
            $('input', $th).on('keyup', function () {
                let colIndex = that[0][0];
                let searchDelay = that.table().context[0].searchDelay | 0;
                let searchValue = this.value;
                clearTimeout(input_filter_timeout[colIndex]);

                input_filter_timeout[colIndex] = setTimeout(function () {
                    if (that.search() !== searchValue) {
                        console.log('Search Start', input_filter_timeout[colIndex], searchDelay, searchValue);
                        // search( input [, regex[ , smart[ , caseInsen ]]] ) - enable the regex to use the or operator
                        that.search(searchValue, true);
                        if (!isFirstLoad)
                            that.draw();
                    }
                }, searchDelay);
            })// end input keyup
                .keypress(function (event) {
                    var keycode = (event.keyCode ? event.keyCode : event.which);
                    if (keycode === 13) {
                        console.log('Disabled enter key press for: ' + $(this).attr('data-title'));
                        event.preventDefault();
                    }
                });
        }
    }); // end table.columns().every

    table.on('search.dt', function () {
        //console.log('Search End', Date.now());
        // remove the check mark from the checkbox
        $('.checkAll').prop('checked', false);
    });

    // Add event listener for CheckBox - mark the checkAll if all checkboxes are marked
    table
        .on('select', function (e, dt, type, indexes) {
            if (table.rows({ page: 'current', selected: true }).count() === table.rows({ page: 'current' }).count())
                $('.checkAll').prop('checked', true);
        })
        .on('deselect', function (e, dt, type, indexes) {
            $('.checkAll').prop('checked', false);
        });

    createEditor(GetTableColumnsDefinition());
    table.button().add(2, { extend: "edit", editor: editor });
    table.button().add(3, { extend: "remove", editor: editor });

    if (isFirstLoad) {
        isFirstLoad = false;
    }
}// end function createSearchTable

function createEditor(columns) {
    var arrfields = [];
    for (var i in columns) {
        column = columns[i];
        if (column.editable) {
            var obj = {
                label: column.title,
                name: column.data
            };
            if (typeof column.editType !== 'undefined')
                obj.type = column.editType;
            if (typeof column.editOptions !== 'undefined')
                obj.options = column.editOptions;
            if (typeof column.editSeparator !== 'undefined')
                obj.separator = column.editSeparator;
            if (typeof column.editDefault !== 'undefined')
                obj.default = column.editDefault;
            if (typeof column.multiple !== 'undefined')
                obj.multiple = column.multiple;
            if (typeof column.editAttr !== 'undefined')
                obj.attr = column.editAttr;
            arrfields.push(obj);
        }// end if 
    }// end for loop

    // handler for the edit button above the table and on each line
    $('body').on('click', '.tblReport a.edit', function (e) {
        e.preventDefault();
        editor.edit(
            $(this).closest('tr'),
            {
                title: 'Edit record',
                buttons: 'Update'
            }
        );
    });

    // inline table edit for each field that is editable
    $('body').on('click', '.tblReport tbody tr td.editable.inline', function (e) {
        try {
            var cell = editor.inline(this, {
                //submit: 'allIfChanged',//  Submit the values of all fields if one or more have changed. If none have changed, nothing will be submitted
                //onBlur: false,
                buttons: [
                    {
                        label: '<span class="fa fa-check"></span>', //'&gt;',
                        fn: function () {
                            this.submit();
                        }
                    }
                ]
            });
        } catch (e) {
            showAlert(e, true);
            console.error(e);
        }
    });

    editor = new $.fn.dataTable.Editor({
        ajax: {
            type: "PATCH",
            url: "/Home/PatchCars",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            data: function (d) {
                console.log('send data', d);
                return JSON.stringify(d);

            },
            success: function (result, textStatus, c) {
                table.ajax.url("/Home/GetCars").load();
            },
            error: function (jqXHR, textStatus, errorThrown) {
                // alert('There was an error while saving the data');
                console.log("jqXHR", jqXHR);
                console.log("textStatus", textStatus);
                console.log("errorThrown", errorThrown);
                console.log("errorThrown", jqXHR.responseText);
            },
            dataFilter: function (data, dataType) {
                // data manipulation before returning the data to the editor
                try {
                    var msg = JSON.parse(data);
                    if (!msg.IsSuccess) {
                        if (msg.Message !== 'Validation error(s)') {
                            TopAlert(msg.Message.replace('Error: ', ''), 'danger', 5);
                            return null;
                        }
                    }
                    return JSON.stringify(msg.ResponseData);
                }
                catch (err) {
                    console.log('dataFilter', err, data);
                }
                return data;
            }
        },

        table: ".tblReport",
        idSrc: 'Id',
        fields: arrfields
    });
}// end function createEditor

function resetModalFeilds() {
    $('#NewCarModal .has-error').removeClass('has-error');
    $('#txtCarName').val('');
    $('#txtPlateNumber').val('');
    $('#txtLicanceId').val('');
    
}// end function resetModalFeilds

function addNewCar() {
    // Getting the values from form
    var txtCarName = $('#txtCarName').val();
    var txtPlateNumber = $.trim($('#txtPlateNumber').val());
    var txtLicanceId = $.trim($('#txtLicanceId').val());

    if (txtPlateNumber == null || txtPlateNumber == "") {
        showAlert('Please Enter Car Number', true);
        return;
    }

    var SendData = {
        "Name": txtCarName,
        "PlateNumber": txtPlateNumber,
        "LicanceId": txtLicanceId
    };

    console.log(SendData);

    var JSON_SendData = JSON.stringify(SendData);
 //   $('form').addClass('sk-loading');
    $.ajax({
        type: "POST",
        url: "/Home/AddCar",
        data: JSON_SendData,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function () {
            table.ajax.url("/Home/GetCars").load();
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log("jqXHR", jqXHR);
            console.log("textStatus", textStatus);
            console.log("errorThrown", errorThrown);
            console.log("responseText", jqXHR.responseText);
            console.log("responseJSON", jqXHR.responseJSON);
            alert('Failed to receive data.', true);
        },
        complete: function (jqXHR, textStatus) {
            $('#NewCarModal').modal('hide');
           // $('form').removeClass('sk-loading');
        }
    });
}// end function addNewCar

$(document).ready(function () {
    $('#btnAddCar').on("click", function () {
        addNewCar();
    });

    createSearchTable();
   
});// end $(document).ready

