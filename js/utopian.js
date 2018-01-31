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
            let data = [];
            let categories = result.stats.categories;
            data.push({"category":"Development", "posts":categories.development.total_posts});
            data.push({"category":"Bug Hunting", "posts":categories["bug-hunting"].total_posts});
            data.push({"category":"Sub Projects", "posts":categories["sub-projects"].total_posts});
            data.push({"category":"Documentation", "posts":categories.documentation.total_posts});
            data.push({"category":"Translations", "posts":categories.translations.total_posts});
            data.push({"category":"Analysis", "posts":categories.analysis.total_posts});
            data.push({"category":"Suggestions", "posts":categories.ideas.total_posts});
            data.push({"category":"Graphics", "posts":categories.graphics.total_posts});
            data.push({"category":"Tutorials", "posts":categories.tutorials.total_posts});
            data.push({"category":"Video Tutorials", "posts":categories["video-tutorials"].total_posts});
            data.push({"category":"Blog", "posts":categories.blog.total_posts});
            data.push({"category":"Task Requests", "posts":categories["task-ideas"].total_posts});
            data.push({"category":"Visibility", "posts":categories.social.total_posts});
            data.push({"category":"Copywriting", "posts":categories.copywriting.total_posts});
            let chart = AmCharts.makeChart( "chartdiv", {
                "type": "pie",
                "theme": "light",
                "dataProvider": data,
                "startDuration": 0,
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
            logit("API Finished: Stats.");
            $('img#loading').hide();
        }             
    });    
}

function updateModerators(api) {
    logit("calling " + api);
    $.ajax({
        type: "GET",
        url: api,
        success: function(result) {
            let data_cnt = [];
            let data_total_paid = [];
            let total = result.total;
            let arr = result.results;      
            let id = $('input#steemit_id').val().trim().toLowerCase();
            let s = "";
            let total_moderated = 0;
            let total_paid_steem = 0;
            for (let i = arr.length - 1; i --; ) {
                let row = arr[i];
                if (row["account"] == id) {
                    s += "<h3>Hello " + id + "!</h3>";
                    s + "<ul>";
                    s += "<li>Your supervisor is <B><a target=_blank href='https://steemit.com/@" + row["referrer"] + "'>@" + row["referrer"] + "</B>.</a></li>";
                    s += "<li>You have moderated <B>" + row["total_moderated"] + "</B> posts.</li>";
                    s += "<li>You should receive rewards: <B>" + (row["should_receive_rewards"].toFixed(3)) + "</B> STEEM.</li>";
                    s += "<li>Total paid rewards: <B>" + (row["total_paid_rewards_steem"].toFixed(3)) + "</B> STEEM.</li>";
                    s += "<li>Percentage of Total Moderator Rewards: <B>" + (row["percentage_total_rewards_moderators"].toFixed(2)) + "</B>% .</li>";
                    s += "</ul>";                    
                }
                data_cnt.push({"moderator": row["account"], "total_moderated": row["total_moderated"]});
                data_total_paid.push({"moderator": row["account"], "total_paid_rewards_steem": row["total_paid_rewards_steem"]});
                total_moderated += row["total_moderated"];
                total_paid_steem += row["total_paid_rewards_steem"];
            }           
            const showtop = 15;
            data_cnt.sort(function(a, b) {
                return b['total_moderated'] - a['total_moderated'];
            });
            data_cnt.sort(function(a, b) {
                return b['total_paid_rewards_steem'] - a['total_paid_rewards_steem'];
            });            
            // keep the top list
            data_cnt = data_cnt.slice(0, showtop); 
            data_total_paid = data_total_paid.slice(0, showtop); 
            // sum up the total_moderated
            let top = 0;
            let top_paid = 0;
            for (let i = data_cnt.length - 1; i --; ) {
                top += data_cnt[i]['total_moderated'];
            }
            for (let i = data_total_paid.length - 1; i --; ) {
                top_paid += data_total_paid[i]['total_paid_rewards_steem'];
            }            
            data_cnt.push({"moderator": "others", "total_moderated": total_moderated - top});
            data_total_paid.push({"moderator": "others", "total_paid_rewards_steem": data_total_paid - top_paid});
            let chart_mmoderators_count = AmCharts.makeChart( "chartdiv_moderators_count", {
                "type": "pie",
                "theme": "light",
                "dataProvider": data_cnt,
                "startDuration": 0,
                "valueField": "total_moderated",
                "titleField": "moderator",
                "balloon":{
                  "fixedPosition": true
                },
                "export": {
                  "enabled": false
                }
            });  
            let chart_mmoderators_paid = AmCharts.makeChart( "chartdiv_moderators_total_paid", {
                "type": "pie",
                "theme": "light",
                "dataProvider": data_total_paid,
                "startDuration": 0,
                "valueField": "total_paid_rewards_steem",
                "titleField": "moderator",
                "balloon":{
                  "fixedPosition": true
                },
                "export": {
                  "enabled": false
                }
            });   
            s += "<div>";
            s += "<ul>"                   
            s += "<li>Total Moderated: <B>" + total_moderated + "</B>.</li>";
            s += "<li>Total Paid: <B>" + total_paid_steem.toFixed(3) + "</B> STEEM.</li>";
            s += "</ul>";
            s += "</div>";
            $('div#moderators').html(s);
        },
        error: function(request, status, error) {
            logit('Response: ' + request.responseText);
            logit('Error: ' + error );
            logit('Status: ' + status);
        },
        complete: function(data) {
            logit("API Finished: Moderators.");
            $('img#loading-moderators').hide();
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
            logit("API Finished: VP.");
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
            logit("API Finished: Reputation.");
        }             
    });    
}

document.addEventListener('DOMContentLoaded', function() {
    // init tabs
    $(function() {
        $( "#tabs" ).tabs();
    });
    // load steem id
    chrome.storage.sync.get('utopian_settings', function(data) {
        if (data && data.utopian_settings) {
            let utopian = data.utopian_settings;
            if (utopian["steemit_id"]) {
                let id = utopian["steemit_id"].trim();
                $('input#steemit_id').val(id);  
                if (id != '') {
                    getVP(id);
                    getRep(id);
                }
            }
            if (utopian["steemit_website"]) {
                let website = utopian["steemit_website"].trim();
                $('select#steemit_website').val(website);
            }
        }
    });
    $('button#save_id_btn').click(function() {
        let id = $('input#steemit_id').val().trim();
        let website = $('select#steemit_website').val();
        let utopian = {};
        utopian['steemit_id'] = id;
        utopian['steemit_website'] = website;
        chrome.storage.sync.set({ 
            utopian_settings: utopian
        }, function() {
            alert('Saved.');
        });
    });  
    // about
    let manifest = chrome.runtime.getManifest();    
    let app_name = manifest.name + " v" + manifest.version;
    $('textarea#about').val('Application: ' + app_name + '\n' + 'Chrome Version: ' + getChromeVersion());
    // general
    updateStats("https://api.utopian.io/api/stats");
    // load moderator data
    updateModerators("https://api.utopian.io/api/moderators");
}, false);