$(document).ready(function () {
    var url = window.location.href
    var arr = url.split("/");
    var result = arr[0] + "//" + arr[2]
    $("#invite-code").val(result + "/invite/" + $("#invite-code").val());

    function copy_else(selector) {
        var $temp = $("<div>");
        $("body").append($temp);
        $temp.attr("contenteditable", true)
            .html($(selector).val()).select()
            .on("focus", function () { document.execCommand('selectAll', false, null); })
            .focus();
        document.execCommand("copy");
        $temp.remove();
    }

    function copy_saf(id) {
        var configId = document.querySelector(id);
        var range = document.createRange();
        range.selectNode(configId);
        var selection = window.getSelection()
        selection.removeAllRanges();
        selection.addRange(range);

        try {
            var successful = document.execCommand('copy');
            var msg = successful ? 'successful' : 'unsuccessful';
            console.log('Copy command was ' + msg);
        } catch (err) {
            console.log('Oops, unable to copy');
        }

        selection.removeAllRanges();
    }

    $("#copy-button").on("click", function () {
        copy_else("#invite-code");
        copy_saf("#invite-code");
        alert("Invite Copied!");
    });


    $("#logout-button").on("click", function (e) {
        $.ajax({
            type: "POST",
            url: "./logout",
            dataType: "json",
            contentType: "application/json",
        });

        window.location.replace("./");

    });

    $('#datepicker').datepicker();

    function prepare_msa_submit() {
        console.log("Preparing msa submit!");
        if (check_msa_inputs()) {
            submit_msa();
        }
    }

    $("#msa-submit").on("click", prepare_msa_submit);

    function check_msa_inputs() {
        var jsDate = $('#datepicker').datepicker('getDate');

        if (jsDate !== null) {
            jsDate instanceof Date;
            jsDate.getDate();
            jsDate.getMonth();
            jsDate.getFullYear();
            console.log("Date is " + jsDate);
        } else {
            $("#msa-w-alert").text("No Date Entered!");
            $("#msa-w-alert").show();
            return false;
        }

        let time = $("#start-time").val();

        jsDate.setHours(time, 0, 0, 0);

        console.log("hour > " + time);
        console.log("Datetime > " + jsDate);

        let duration = parseInt($("#duration").val());

        let quantity = parseInt($("#Quantity").val());

        console.log([jsDate, duration, quantity]);

        return true;
    }

    function submit_msa() {
        var jsDate = $('#datepicker').datepicker('getDate');
        let time = $("#start-time").val();
        jsDate.setHours(time, 0, 0, 0);
        let duration = parseInt($("#duration").val());
        let quantity = parseInt($("#Quantity").val());

        data = {
            "start": jsDate,
            "duration": duration,
            "quantity": quantity
        };

        console.log(data);

        $.ajax({
            type: "POST",
            url: "./slots",
            dataType: "json",
            contentType: "application/json",
            data: JSON.stringify(data),
            success: function (result, status) {
                if (!result.successful) {
                    alert(result.message);
                } else {
                    window.location.replace("./dashboard");
                }
            },
            error: function (xhr, status, error) {
                alert("Request Failed!")
            }
        });

    }

    function getDateString(date) {
        var dd = date.getDate();
        var mm = date.getMonth() + 1; //January is 0!

        var yyyy = date.getFullYear();
        if (dd < 10) {
            dd = '0' + dd;
        }
        if (mm < 10) {
            mm = '0' + mm;
        }
        var today = dd + '/' + mm + '/' + yyyy;
        return today;
    }

    function getTimeString(date) {
        datetext = date.toTimeString();
        return datetext.split(' ')[0];
    }

    function Delete_Slot(id) {
        console.log("Deleting " + id);
        $("#ds-title").text(id);
    }

    function confirm_delete() {
        let id = parseInt($("#ds-title").text());

        $.ajax({
            type: "POST",
            url: "./delete_slot",
            dataType: "json",
            contentType: "application/json",
            data: JSON.stringify({
                "slot_id": id
            }),
            success: function (result, status) {
                if (!result.successful) {
                    alert(result.message);
                } else {
                    window.location.replace("./dashboard");
                }
            },
            error: function (xhr, status, error) {
                alert("Request Failed!")
            }
        });
    }

    function getAppointments() {
        $.ajax({
            type: "POST",
            url: "./get_slots",
            dataType: "json",
            contentType: "application/json",
            success: function (result, status) {
                if (!result.successful) {
                    alert(result.message);
                } else {
                    console.log(result.message);

                    for (res of result.data) {
                        let d = new Date(res.start);
                        $("#times-table-body").append(`<tr class="trow">
                        <td class="tcol">${getDateString(d)}</td>
                        <td class="tcol">${getTimeString(d)}</td>
                        <td class="tcol">${res.duration}</td>
                        <td class="tcol">${res.booked == 0 ? "Not Booked" : "Booked"}</td>
                        <td class="tcol"><button type="button" class="btn btn-outline-danger" id="bd-${res.id}" data-toggle="modal"
                        data-target="#DeleteSlotsModal">Delete</button></td>
                        </tr>`);
                        $("#bd-" + res.id).on("click", function() {
                            let id = parseInt($(this).attr('id').split("-")[1]);
                            Delete_Slot(id);
                        });
                    }

                }
            },
            error: function (xhr, status, error) {
                alert("Request Failed!")
            }
        });
    }

    $("#ds-submit").on("click", confirm_delete);

    getAppointments();

});