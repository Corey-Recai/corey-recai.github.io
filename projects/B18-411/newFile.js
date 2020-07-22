/******************************************************************************
 * This tutorial is based on the work of Martin Hawksey twitter.com/mhawksey  *
 * But has been simplified and cleaned up to make it more beginner friendly   *
 * All credit still goes to Martin and any issues/complaints/questions to me. *
 ******************************************************************************/

// if you want to store your email server-side (hidden), uncomment the next line
var TO_ADDRESS = "crecai@itcservices.com";

// spit out all the keys/values from the form in HTML for email
// uses an array of keys if provided or the object to determine field order
function formatMailBody(obj, order) {
    var result = "";
    if (!order) {
        order = Object.keys(obj);
    }

    // loop over all keys in the ordered form data
    for (var idx in order) {
        var key = order[idx];
        result += "<h4 style='text-transform: capitalize; margin-bottom: 0'>" + key + "</h4><div>" + sanitizeInput(obj[key]) + "</div>";
        // for every key, concatenate an `<h4 />`/`<div />` pairing of the key name and its value, 
        // and append it to the `result` string created at the start.
    }
    return result; // once the looping is done, `result` will be one long string to put in the email body
}

// sanitize content from the user - trust no one 
// ref: https://developers.google.com/apps-script/reference/html/html-output#appendUntrusted(String)
function sanitizeInput(rawInput) {
    var placeholder = HtmlService.createHtmlOutput(" ");
    placeholder.appendUntrusted(rawInput);

    return placeholder.getContent();
}

function createPDF(e) {
  try {
    Logger.log(JSON.stringify(e));

    function pad(num, padlen, padchar) {
        var pad_char = typeof padchar !== 'undefined' ? padchar : '0';
        var pad = new Array(1 + padlen).join(pad_char);
        return (pad + num).slice(-pad.length);
    }

    function ordinalSuffix(i) {
        var j = i % 10,
            k = i % 100;
        if (j == 1 && k != 11) {
            return i + "st";
        }
        if (j == 2 && k != 12) {
            return i + "nd";
        }
        if (j == 3 && k != 13) {
            return i + "rd";
        }
        return i + "th";
    }

    var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    var now = new Date(e.parameters.date);
    var stringDate = months[now.getMonth()] + ' ' + now.getDate() + ', ' + now.getFullYear();

    var shortDate = e.parameters.date;
    var longDate = stringDate;
    var deliveryMethod = e.parameters.delivery_method;
    var toLocation = e.parameters.to_location;
    var toContact = e.parameters.contact_name;
    var numCopies = e.parameters.num_copies;
    var type = e.parameters.type;
    var specSec = e.parameters.spec_sec + "-" + pad(e.parameters.rev_num, 3) + "-" + pad(e.parameters.sub_num, 3);
    var subName = e.parameters.sub_name;
    var subcontractor = e.parameters.subcontractor;
    var signedBy = e.parameters.signed_by;
    var subNum = ordinalSuffix(e.parameters.sub_num);
    var submittalFileName = "SPEC#" + specSec + "-" + subName;

    const docFile = DriveApp.getFileById("1tGRvCKUtcsXGrpC35R_JYuDqKb0J7tzQQrKkc-0SqHY");
    const docFolder = DriveApp.getFolderById("1JxdiAgETWTUjkzMTHfKE-Rb4Lrk2vm8Y");
    const pdfFolder = DriveApp.getFolderById("1uWBMD_BNWeRR-rBdoqHYq0wWcSMTjRj9");

    var submittalFile = docFile.makeCopy(docFolder).setName(submittalFileName);
    var submittalDocFile = DocumentApp.openById(submittalFile.getId());

    var body = submittalDocFile.getBody();
    body.replaceText("{to_company}", toLocation);
    body.replaceText("{to_contact}", toContact);
    body.replaceText("{date}", longDate);
    body.replaceText("{delivery_method}", deliveryMethod);
    body.replaceText("{num_copies}", numCopies);
    body.replaceText("{type}", type);
    body.replaceText("{spec_and_rev_num}", specSec);
    body.replaceText("{submittal_name}", subName);
    body.replaceText("{subcontractor}", subcontractor);
    body.replaceText("{signed_by}", signedBy);
    body.replaceText("{submission_number}", subNum);
    body.replaceText("{short_date}", shortDate);
    submittalDocFile.saveAndClose();


    var pdfFileBlob = submittalDocFile.getAs('application/pdf');
    var submittalPdfFile = pdfFolder.createFile(pdfFileBlob);
    submittalPdfFile.setName(submittalFileName);
    var pdfUrl = submittalPdfFile.getUrl();
    var docUrl = submittalFile.getUrl();
    
    var pdfList = [pdfUrl, docUrl, submittalFileName];
    
    return pdfList;
  }catch (error) { // if error return this
        Logger.log(error);
        return ContentService
            .createTextOutput(JSON.stringify({
                "result": "error",
                "error": error
            }))
            .setMimeType(ContentService.MimeType.JSON);
    } 
}

function doPost(e) {

    try {
        Logger.log(e); // the Google Script version of console.log see: Class Logger
        record_data(e);
        //createPDF(e);
        
        var createPDFList = createPDF(e);
        var pdfUrl = createPDFList[0];
        var docUrl = createPDFList[1];
        var submittalFileName = createPDFList[2];


        // shorter name for form data
        var mailData = e.parameters;

        // names and order of form elements (if set)
        var orderParameter = e.parameters.formDataNameOrder;
        var dataOrder;
        if (orderParameter) {
            dataOrder = JSON.parse(orderParameter);
        }

        // determine recepient of the email
        // if you have your email uncommented above, it uses that `TO_ADDRESS`
        // otherwise, it defaults to the email provided by the form's data attribute
        var sendEmailTo = (typeof TO_ADDRESS !== "undefined") ? TO_ADDRESS : mailData.formGoogleSendEmail;

        // send email if to address is set
        if (sendEmailTo) {
            var html =
                '<body>' +
                '<h4>Links to your Cover Sheets:</h4>' +
                '<p>' + 'PDF: ' + '<a href="' + pdfUrl + '">' + submittalFileName + '</a>' + '</p>' +
                '<p>' + 'Doc: ' + '<a href="' + docUrl + '">' + submittalFileName + '</a>' + '</p>' +
                '</body>';
            MailApp.sendEmail(TO_ADDRESS, "New Submittal Cover Sheet Generated", "New Submittal Cover Sheet Generated", {
                htmlBody: html
            });
        }
        // return json success results
        return HtmlService.createHtmlOutput(
            "<script>window.top.location.href='http://127.0.0.1:5500/projects/B18-411/B18411-submittal-cover.html';</script>"
        );
    } catch (error) { // if error return this
        Logger.log(error);
        return ContentService
            .createTextOutput(JSON.stringify({
                "result": "error",
                "error": error
            }))
            .setMimeType(ContentService.MimeType.JSON);
    }
}

/**
 * record_data inserts the data received from the html form submission
 * e is the data received from the POST
 */
function record_data(e) {
    var lock = LockService.getDocumentLock();
    lock.waitLock(30000); // hold off up to 30 sec to avoid concurrent writing

    try {
        Logger.log(JSON.stringify(e)); // log the POST data in case we need to debug it

        // select the 'responses' sheet by default
        var doc = SpreadsheetApp.getActiveSpreadsheet();
        var sheetName = e.parameters.formGoogleSheetName || "responses";
        var sheet = doc.getSheetByName(sheetName);

        var oldHeader = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
        var newHeader = oldHeader.slice();
        var fieldsFromForm = getDataColumns(e.parameters);
        var row = [new Date()]; // first element in the row should always be a timestamp

        // loop through the header columns
        for (var i = 1; i < oldHeader.length; i++) { // start at 1 to avoid Timestamp column
            var field = oldHeader[i];
            var output = getFieldFromData(field, e.parameters);
            row.push(output);

            // mark as stored by removing from form fields
            var formIndex = fieldsFromForm.indexOf(field);
            if (formIndex > -1) {
                fieldsFromForm.splice(formIndex, 1);
            }
        }

        // set any new fields in our form
        for (var i = 0; i < fieldsFromForm.length; i++) {
            var field = fieldsFromForm[i];
            var output = getFieldFromData(field, e.parameters);
            row.push(output);
            newHeader.push(field);
        }

        // more efficient to set values as [][] array than individually
        var nextRow = sheet.getLastRow() + 1; // get next row
        sheet.getRange(nextRow, 1, 1, row.length).setValues([row]);

        // update header row with any new data
        if (newHeader.length > oldHeader.length) {
            sheet.getRange(1, 1, 1, newHeader.length).setValues([newHeader]);
        }
    } catch (error) {
        Logger.log(error);
    } finally {
        lock.releaseLock();
        return;
    }

}

function getDataColumns(data) {
    return Object.keys(data).filter(function (column) {
        return !(column === 'formDataNameOrder' || column === 'formGoogleSheetName' || column === 'formGoogleSendEmail' || column === 'honeypot');
    });
}

function getFieldFromData(field, data) {
    var values = data[field] || '';
    var output = values.join ? values.join(', ') : values;
    return output;
}