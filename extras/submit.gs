// https://medium.com/@dmccoy/how-to-submit-an-html-form-to-google-sheets-without-google-forms-b833952cc175
//   - Header: timestamp, uuid, name, email, phone, message, filename, file
//   - Tools > Script editor
//       + File > Save
//       + Run > Run function > Setup > Review permissions
//       + Publish > Deploy as webapp
//   - File > Manage versions > Save New Version
//       + Run > Run function > Setup > Review permissions
//       + Publish > Deploy as webapp

var SHEET_NAME = 'submissions';
var RECIPIENTS = 'info@99languages.es';
var FOLDER_ID = '10sUeJJJ7xIP0qZFpEVHgU9ietLHEKpSm';

function doPost(e) {
  return handleResponse(e);
}

var SCRIPT_PROP = PropertiesService.getScriptProperties();

function handleResponse(e) {
  var lock = LockService.getPublicLock();
  lock.waitLock(30000);

  try {
    var doc = SpreadsheetApp.openById(SCRIPT_PROP.getProperty('key'));
    var sheet = doc.getSheetByName(SHEET_NAME);

    var now = new Date();
    var uuid = Utilities.getUuid();

    var file = null;
    if (e.parameters.file && e.parameters.filename) {
      try {
        var data = Utilities.base64Decode(e.parameters.file, Utilities.Charset.UTF_8);
        var blob = Utilities.newBlob(data);
        blob.setName(now.toISOString() + ' - ' + uuid + ' - ' + e.parameters.filename);
        var folder = DriveApp.getFolderById(FOLDER_ID);
        file = folder.createFile(blob);
      } catch (exc) { }
    }

    var head_row = e.parameter.header_row || 1;
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    var next_row = sheet.getLastRow() + 1;
    var row = [];

    var i;
    for (i in headers) {
      if (headers[i] == 'timestamp') {
        row.push(now);
      } else if (headers[i] == 'uuid') {
        row.push(uuid);
      } else if (headers[i] == 'file') {
        if (file) {
          row.push(file.getUrl());
        }
      } else {
        row.push(e.parameter[headers[i]]);
      }
    }
    sheet.getRange(next_row, 1, 1, row.length).setValues([row]);

    var quota = MailApp.getRemainingDailyQuota();
    if (quota > 0) {
      var subject = '[99languages] New form submission by '+ e.parameter['email'];
      var body = 'A contact form has been submitted:\n\n';
      body += '    - uuid: ' + uuid + '\n';
      body += '    - name: ' + e.parameter['name'] + '\n';
      body += '    - e-mail: ' + e.parameter['email'] + '\n';
      body += '    - phone: ' + e.parameter['phone'] + '\n';
      if (file) {
        body += '    - file: ' + file.getUrl() + '\n';
      }
      body += '\n' + e.parameter['message'] + '\n';
      body += '\nCheck ' + doc.getUrl() + ' for details.\n';
      body += '\nBest,\n\n--\nYour faithful assistant';
      MailApp.sendEmail(RECIPIENTS, subject, body);
    }

    return ContentService
          .createTextOutput(JSON.stringify({'result':'success', 'row': next_row, 'quota': quota}))
          .setMimeType(ContentService.MimeType.JSON);
  } catch(exc) {
    return ContentService
          .createTextOutput(JSON.stringify({'result':'error', 'error': exc}))
          .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function setup() {
    var doc = SpreadsheetApp.getActiveSpreadsheet();
    SCRIPT_PROP.setProperty('key', doc.getId());
}
