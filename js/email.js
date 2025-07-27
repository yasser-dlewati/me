
const txtName = $('#txtName')
const txtEmail = $('#txtEmail')
const txtMessage = $('#txtMessage')
const successClass = 'success-snackbar';
const successMessage = 'Your message is on its way, Thanks!';
const failClass = 'fail-snackbar';
const failMessage = 'Something went wrong, please try again later!';
const alertClass = 'alert-snackbar';
const alertMessage = 'Please make sure to fill all fields.';

function invalidatedInput(input) {
    var invalid = false;
    if (input === txtName || input == txtMessage) {
        invalid = $(input).val() === '' || $(input).val() === ' ' || $(input).val().length < 2
    }
    else if (input === txtEmail) {
        invalid = !tryVerifyEmailAddress($(input).val())
    }

    if (invalid) {
        $(input.addClass('required'))
    }
    else {
        $(input.removeClass('required'))
    }

    return invalid;

}

function tryVerifyEmailAddress(email) {
    const regex = "^([A-Z|a-z|0-9](\.|_){0,1})+[A-Z|a-z|0-9]\@([A-Z|a-z|0-9])+((\.){0,1}[A-Z|a-z|0-9]){2}\.[a-z]{2,3}$"
    return (new RegExp(regex).test(email));
}

function showSnackbar(snackbarClass, snackbarMessage) {
    var snackbar = $('#snackbar');
    $('#snackbar-text').html(snackbarMessage);
    snackbar.addClass('show ' + snackbarClass);
    var width = snackbar.width()
    setTimeout(() => {
        snackbar.removeClass('show');
        snackbar.removeClass(snackbar)
    }, 3000);
}

function validateInputsOnFocusout(input) {
    $(input).focusout(() => {
        invalidatedInput(txtEmail)
        invalidatedInput(txtName)
        invalidatedInput(txtMessage)
    })
}


$('#btnSubmit').click(function () {
    const senderEmail = "yasdle@outlook.com";
    var isEmailVerified = tryVerifyEmailAddress(txtEmail.val());
    var isAnyInputInValid = invalidatedInput(txtEmail) || invalidatedInput(txtName) || invalidatedInput(txtMessage)
    if (isAnyInputInValid) {
        showSnackbar(alertClass, alertMessage)
        return;
    }

    if (isEmailVerified) {
        Email.send({
            SecureToken: "8c1ba5c8-5c06-4fba-9abb-cb57b4168999",
            To: 'yasdle@outlook.com',
            From: senderEmail,
            Subject: "New Message from " + txtName.val() + " (" + txtEmail.val() + ")",
            Body: txtMessage.val().replace(/\n/g, "<br />")
        }).then(() => showSnackbar(successClass, successMessage))
            .catch(err => showSnackbar(failClass, failMessage + '\n ' + err))

    }
})

$(document).ready(() => {
    validateInputsOnFocusout(txtName)
    validateInputsOnFocusout(txtEmail)
    validateInputsOnFocusout(txtMessage)

    $('i#close').click(() => $('#snackbar').removeClass('show'))
})