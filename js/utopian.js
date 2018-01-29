'use strict';

const getChromeVersion = () => {
    var raw = navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./);
    return raw ? parseInt(raw[2], 10) : false;
}

const logit = (msg) => {
    let d = new Date();
    let n = d.toLocaleTimeString();
    let dom = $('textarea#about');
    let s = dom.val();
    dom.val(s + "\n" + n + ": " + msg);
}

function updateStats(api) {
    logit("calling " + api);
    $.ajax({
        type: "GET",
        url: api,
        success: function(result) {
          var data = [];
          var categories = result.stats.categories;
          data.push({"category":"Development","posts":categories.development.total_posts})
          data.push({"category":"Bug Hunting","posts":categories["bug-hunting"].total_posts})
          data.push({"category":"Sub Projects","posts":categories["sub-projects"].total_posts})
          data.push({"category":"Documentation","posts":categories.documentation.total_posts})
          data.push({"category":"Translations","posts":categories.translations.total_posts})
          data.push({"category":"Analysis","posts":categories.analysis.total_posts})
          data.push({"category":"Suggestions","posts":categories.ideas.total_posts})
          data.push({"category":"Graphics","posts":categories.graphics.total_posts})
          data.push({"category":"Tutorials","posts":categories.tutorials.total_posts})
          data.push({"category":"Video Tutorials","posts":categories["video-tutorials"].total_posts})
          data.push({"category":"Blog","posts":categories.blog.total_posts})
          data.push({"category":"Task Requests","posts":categories["task-ideas"].total_posts})
          data.push({"category":"Visibility","posts":categories.social.total_posts})
          data.push({"category":"Copywriting","posts":categories.copywriting.total_posts})
          var chart = AmCharts.makeChart( "chartdiv", {
            "type": "pie",
            "theme": "light",
            "dataProvider": data,
            "startDuration":0,
            "valueField": "posts",
            "titleField": "category",
            "balloon":{
              "fixedPosition": true
            },
            "export": {
              "enabled": false
            }
          });          
        },
        error: function(request, status, error) {
            logit('Response: ' + request.responseText);
            logit('Error: ' + error );
            logit('Status: ' + status);
        },
        complete: function(data) {
            logit("API Finished.");
            $('img#loading').hide();
        }             
    });    
}

function getVP(id) {
    let api = 'https://helloacm.com/api/steemit/account/vp/?id=' + id;
    logit("calling " + api);
    $.ajax({
        type: "GET",
        url: api,
        success: function(result) {
            let dom = $('div#account_vp');
            dom.html("<i>Your Voting Power is</i> <B>" + result + "%</B>");
            if (result < 30) {
                dom.css("background-color", "red");
            } else if (result < 60) {
                dom.css("background-color", "orange");
            } else {
                dom.css("background-color", "green");
            }
            dom.css("width", result + "%");
        },
        error: function(request, status, error) {
            logit('Response: ' + request.responseText);
            logit('Error: ' + error );
            logit('Status: ' + status);
        },
        complete: function(data) {
            logit("API Finished.");
            $('img#loading').hide();
        }             
    });    
}

function getRep(id) {
    let api = 'https://helloacm.com/api/steemit/account/reputation/?id=' + id;
    logit("calling " + api);
    $.ajax({
        type: "GET",
        url: api,
        success: function(result) {
            let dom = $('div#account_rep');
            dom.html("<i>Your Reputation is</i> <B>" + result + "</B>");
        },
        error: function(request, status, error) {
            logit('Response: ' + request.responseText);
            logit('Error: ' + error );
            logit('Status: ' + status);
        },
        complete: function(data) {
            logit("API Finished.");
            $('img#loading').hide();
        }             
    });    
}

document.addEventListener('DOMContentLoaded', function() {
    // init tabs
    $(function() {
        $( "#tabs" ).tabs();
    });
    // load steem id
    chrome.storage.sync.get('steemit_id', function(data) {
        if (data != null) {
            if ((data.steemit_id != null)) {
                let id = data.steemit_id.trim();
                $('input#steemit_id').val(id);  
                if (id != '') {
                    getVP(id);
                    getRep(id);
                }
            }
        }
    });
    $('button#save_id_btn').click(function() {
        let id = $('input#steemit_id').val().trim();
        chrome.storage.sync.set({ 
            steemit_id: id
        });
        if (id != '') {
            alert('ID Saved.');
        }
    });  
    // about
    let manifest = chrome.runtime.getManifest();    
    let app_name = manifest.name + " v" + manifest.version;
    $('textarea#about').val('Application: ' + app_name + '\n' + 'Chrome Version: ' + getChromeVersion());
    // general
    updateStats("https://api.utopian.io/api/stats");
}, false);