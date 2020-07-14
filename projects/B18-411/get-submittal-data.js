$.getJSON("https://spreadsheets.google.com/feeds/list/18rnRrTB8W1N4UwIPq55zU1ziZU7sZmu0t7p0cS-Nkd0/od6/public/values?alt=json", function (data) {

    var sheetData = data.feed.entry;

    var i;
    for (i = 0; i < sheetData.length; i++) {

        var dateUploaded = data.feed.entry[i]['gsx$timestamp']['$t'];
        var specSec = data.feed.entry[i]['gsx$specsec']['$t'];
        var revNumber = data.feed.entry[i]['gsx$revnum']['$t'];
        var vendSub = data.feed.entry[i]['gsx$vendsub']['$t'];
        var dateSub = data.feed.entry[i]['gsx$datesub']['$t'];
        var dateRet = data.feed.entry[i]['gsx$dateret']['$t'];
        var appStat = data.feed.entry[i]['gsx$approvalstatus']['$t'];
        var fileLink = data.feed.entry[i]['gsx$attachment']['$t'];


        document.getElementById('sheet-data').innerHTML += ('<tr>' + '<td>' + dateUploaded + '</td>' + '<td>' + specSec + '</td>' + '<td>' + revNumber + '</td>' + '<td>' + vendSub + '</td>' + '<td>' + dateSub + '</td>' + '<td>' + dateRet + '</td>' + '<td>' + appStat + '</td>' + '<td>' + fileLink + '</td>' + '</tr>');

    }
});