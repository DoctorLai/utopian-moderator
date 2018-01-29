'use strict';

function getChromeVersion() {     
  var raw = navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./);
  return raw ? parseInt(raw[2], 10) : false;
}

function callServer(server, loc) {
    $.ajax({
        type: "GET",
        url: api,
        success: function(data) {
            $('#ip').append(data + "\n");
            current_ip = data;
        },
        error: function(request, status, error) {
            logit('Response: ' + request.responseText);
            logit('Error: ' + error );
            logit('Status: ' + status);
        },
        complete: function(data) {
            logit('API Finished: ' + loc + " Server!");
        }             
    });    
}

document.addEventListener('DOMContentLoaded', function() {

}, false);