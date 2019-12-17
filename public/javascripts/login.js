$(document).ready( function () {

    function redirect(path) {
        window.location.replace(path);
    }

    $("#create-account-button").on("click", () => {
        redirect("./register");
    });

    $("#show-rubric-button").on("click", () => {
        redirect("./rubric");
    });

    function check_inputs() {
        let email = $("#inputEmail").val();
        let pass = $("#inputPassword").val();

        return email.length >= 5 && pass != "";
    }

    function get_inputs() {
        let email = $("#inputEmail").val();
        let pass = $("#inputPassword").val();

        data = {
            "email": email,
            "password": pass
        }

        return data;
    }

    function prepare_submit(e) {
        e.preventDefault();
        ready = check_inputs();

        if (ready) {
            submit();
        } else {
            alert("Error: invalid inputs!");
        }

    }

    function hide_alerts() {
        $("#regis-error").hide();
        $("#regis-successr").hide();
    }

    function alert(text) {
        $("#regis-error").text(text);
        $("#regis-error").show();
    }

    function inform(text) {
        $("#regis-success").text(text);
        $("#regis-success").show();
    }

    function submit() {
        data = get_inputs();

        $.ajax({
            type: "POST",
            url: "./",
            dataType: "json",
            contentType: "application/json",
            data: JSON.stringify(data),
            success: function(result, status) {
                hide_alerts();
                if (!result.successful) {
                    alert(result.message);
                } else {
                    inform("Success!")
                    window.location.replace("./dashboard");
                }
            },
            error: function(xhr, status, error) {
                alert("Request Failed!")
            }
        });
    }

    $("#signin").submit(prepare_submit);
    

});