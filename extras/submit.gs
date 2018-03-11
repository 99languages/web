// https://medium.com/@dmccoy/how-to-submit-an-html-form-to-google-sheets-without-google-forms-b833952cc175
//   - Tools > Script editor
//       + File > Save
//       + Run > Run function > Setup > Review permissions
//       + Publish > Deploy as webapp

function doGet(e) {
  return handleResponse(e);
}

var SHEET_NAME = 'submissions';
var RECIPIENTS = 'info@99languages.es';

var SCRIPT_PROP = PropertiesService.getScriptProperties();

function handleResponse(e) {
  var lock = LockService.getPublicLock();
  lock.waitLock(30000);

  try {
    var doc = SpreadsheetApp.openById(SCRIPT_PROP.getProperty('key'));
    var sheet = doc.getSheetByName(SHEET_NAME);

    var head_row = e.parameter.header_row || 1;
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    var next_row = sheet.getLastRow() + 1;
    var row = [];

    for (i in headers) {
      if (headers[i] == 'timestamp') {
        row.push(new Date());
      } else {
        row.push(e.parameter[headers[i]]);
      }
    }
    sheet.getRange(next_row, 1, 1, row.length).setValues([row]);

    var quota = MailApp.getRemainingDailyQuota();
    var subject = '[99languages] New form submission by '+ e.parameter['email'];
    var body = 'A contact form has been submitted. Check ' + doc.getUrl() + ' for details.';
    MailApp.sendEmail(RECIPIENTS, subject, body);

    return ContentService
          .createTextOutput(JSON.stringify({'result':'success', 'row': next_row, 'quota': quota}))
          .setMimeType(ContentService.MimeType.JSON);
  } catch(e) {
    return ContentService
          .createTextOutput(JSON.stringify({'result':'error', 'error': e}))
          .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function setup() {
    var doc = SpreadsheetApp.getActiveSpreadsheet();
    SCRIPT_PROP.setProperty('key', doc.getId());
}
