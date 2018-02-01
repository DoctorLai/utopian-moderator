'use strict';

const validId = (id) => {
    id = id.trim();
    let pat = /^[a-z0-9\-\.]+$/g;
    return id && pat.test(id);
}

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
            const showtop_paid = 20;
            data_cnt.sort(function(a, b) {
                return b['total_moderated'] - a['total_moderated'];
            });
            data_total_paid.sort(function(a, b) {
                return b['total_paid_rewards_steem'] - a['total_paid_rewards_steem'];
            });            
            // keep the top list
            data_cnt = data_cnt.slice(0, showtop); 
            data_total_paid = data_total_paid.slice(0, showtop_paid); 
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
            data_total_paid.push({"moderator": "others", "total_paid_rewards_steem": total_paid_steem - top_paid});
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
            s += "<h4>Overall</h4>";
            s += "<ul>"                   
            s += "<li>Total Moderated: <B>" + total_moderated + "</B>.</li>";
            s += "<li>Total Paid: <B>" + total_paid_steem.toFixed(3) + "</B> STEEM.</li>";
            s += "</ul>";
            $('div#moderators').html(s);
        },
        error: function(request, status, error) {
            logit('Response: ' + request.responseText);
            logit('Error: ' + error );
            logit('Status: ' + status);
        },
        complete: function(data) {
            logit("API Finished: Moderators.");
            $('img#loading-chart').hide();
            $('img#loading-moderators').hide();
        }             
    });    
}

function getModeratorStats(api) {
    let api_approved = api + "&status=reviewed";
    let api_rejected = api + "&status=flagged";
    logit("calling " + api_approved);
    $.ajax({
        type: "GET",
        url: api_approved,
        success: function(result) {
            let approved_cnt = result.total;
            logit("calling " + api_rejected);
            $.ajax({
                type: "GET",
                url: api_rejected,
                success: function(result) {
                    let rejected_cnt = result.total;
                    let s = "<h4>Your Approved/Rejected Stats</h4>";
                    s += "<ul>";
                    s += "<li>Approved: <B>" + approved_cnt + "</B></li>";
                    s += "<li>Rejected: <B>" + rejected_cnt + "</B></li>";
                    s += "</ul>";
                    $('div#moderators_stats').html(s);
                    let data = [];
                    data.push({"status": "approved", "count": approved_cnt});
                    data.push({"status": "rejected", "count": rejected_cnt});
                    let chart = AmCharts.makeChart( "chart_moderators", {
                        "type": "pie",
                        "theme": "light",
                        "dataProvider": data,
                        "startDuration": 0,
                        "valueField": "count",
                        "titleField": "status",
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
                    logit("API Finished: Get Rejected Number.");
                }             
            });             
        },
        error: function(request, status, error) {
            logit('Response: ' + request.responseText);
            logit('Error: ' + error );
            logit('Status: ' + status);
        },
        complete: function(data) {
            logit("API Finished: Get Approved Number.");
        }             
    });    
}

function getVP(id, dom) {
    let api = 'https://helloacm.com/api/steemit/account/vp/?id=' + id;
    logit("calling " + api);
    $.ajax({
        type: "GET",
        url: api,
        success: function(result) {
            dom.html("<i>@" + id + "'s Voting Power is</i> <B>" + result + "%</B>");
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
            logit("API Finished: VP + " + id);
        }             
    });    
}

function getRep(id, dom) {
    let api = 'https://helloacm.com/api/steemit/account/reputation/?id=' + id;
    logit("calling " + api);
    $.ajax({
        type: "GET",
        url: api,
        success: function(result) {
            dom.html("<i>@" + id + "'s Reputation is</i> <B>" + result + "</B>");
        },
        error: function(request, status, error) {
            logit('Response: ' + request.responseText);
            logit('Error: ' + error );
            logit('Status: ' + status);
        },
        complete: function(data) {
            logit("API Finished: Reputation - " + id);
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
                if (validId(id)) {
                    getVP(id, $("div#account_vp"));
                    getRep(id, $("div#account_rep"));
                    getModeratorStats("https://api.utopian.io/api/posts?moderator=" + id + "&skip=0&limit=1");
                }
            }
            if (utopian["steemit_website"]) {
                let website = utopian["steemit_website"].trim();
                $('select#steemit_website').val(website);
            }
            if (utopian["friends"]) {
                let friends = utopian["friends"].trim();
                $('textarea#friends').val(friends);
                friends = friends.split("\n");
                let len = friends.length;
                for (let i = 0; i < len; ++ i) {
                    let id = friends[i];
                    if (validId(id)) {
                        $("div#friends_vp_rep").append("<div id='account_vp_100_" + id + "' class='vpbar'><div id='account_vp_" + id + "' class='vp'> </div> </div><div id='account_rep_" + id + "'> </div>");
                        getRep(id, $('div#account_rep_' + id));
                        getVP(id, $('div#account_vp_' + id));
                    }
                }                
            }
        }
    });
    $('button#save_id_btn').click(function() {
        let id = $('input#steemit_id').val().trim();
        let website = $('select#steemit_website').val();
        let friends = $('textarea#friends').val();
        let utopian = {};
        utopian['steemit_id'] = id;
        utopian['steemit_website'] = website;
        utopian['friends'] = friends;
        chrome.storage.sync.set({ 
            utopian_settings: utopian
        }, function() {
            alert('Saved.');
        });
    });  
    // utopian-io
    getVP("utopian-io", $("div#account_utopian_vp"));
    getRep("utopian-io", $("div#account_utopian_rep"));    
    // about
    let manifest = chrome.runtime.getManifest();    
    let app_name = manifest.name + " v" + manifest.version;
    $('textarea#about').val('Application: ' + app_name + '\n' + 'Chrome Version: ' + getChromeVersion());
    // general
    updateStats("https://api.utopian.io/api/stats");
    // load moderator data
    updateModerators("https://api.utopian.io/api/moderators");
}, false);