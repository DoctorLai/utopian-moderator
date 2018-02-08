'use strict';

// default node
const default_node = "https://api.steemit.com";
steem.api.setOptions({ url: default_node });

// get Node
const getNode = () => {
    return $('select#nodes').val();
}

// check if valid steem id
const validId = (id) => {
    id = id.trim();
    let pat = /^[a-z0-9\-\.]+$/g;
    return id && pat.test(id);
}

// dots can't be used as a valid HTML div identifier
const getIdForDiv = (id) => {
    return id.replace(".", "");
}

// try best to return a valid steem id
const prepareId = (id) => {
    return id.replace("@", "").trim().toLowerCase();
}

// button click when press enter in text
const textPressEnterButtonClick = (text, button) => {
    text.keydown(function(e) {
        if (e.keyCode == 13) {
            button.click();
        }
    });        
}

// get steem profile url given id
const getSteemUrl = (id) => {
    return "<a target=_blank href='https://steemit.com/@" + id + "'>@" + id + "</a>";
}

// get chrome version
const getChromeVersion = () => {
    var raw = navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./);
    return raw ? parseInt(raw[2], 10) : false;
}

// read as text
const readResponseAsText = (response) => {
    return response.text();
}

// read as json
const readResponseAsJSON = (response) => { 
    return response.json(); 
} 

// check if valid response
const validateResponse = (response) => { 
    if (!response.ok) { 
        throw Error(response.statusText); 
    } 
    return response; 
}

// write msg in the log
const logit = (msg) => {
    let d = new Date();
    let n = d.toLocaleTimeString();
    let dom = $('textarea#about');
    let s = dom.val();
    dom.val(s + "\n" + n + ": " + msg);
}

// return the total number for status posts
const getModeratedCount = (id, status) => {
    return new Promise((resolve, reject) => {
        let api = "https://api.utopian.io/api/posts/?moderator=" + id + "&status=" + status + "&skip=0&limit=1";    
        fetch(api, {mode: 'cors'}).then(validateResponse).then(readResponseAsJSON).then(function(result) {
            resolve(result.total);
        });        
    });
}

// async get two numbers
const getRatio = async(id) => {
    let accepted = await getModeratedCount(id, "reviewed");
    let rejected = await getModeratedCount(id, "flagged");
    return accepted / (accepted + rejected) * 100;
}

function updateUnreviewed(api) {
    logit("calling " + api);
    $.ajax({
        type: "GET",
        url: api,
        success: function(result) {
            let data = [];
            let categories = result.posts.pending.categories;
            let total = result.posts.pending._total;
            let s = "<h5>Total: <B>" + total + "</B></h5>";
            data.push({"name": "development", "category": "Development", "posts":categories.development});
            data.push({"name": "bug-hunting", "category": "Bug Hunting", "posts":categories.bug_hunting});
            data.push({"name": "sub-projects", "category": "Sub Projects", "posts":categories.sub_projects});
            data.push({"name": "documentation", "category": "Documentation", "posts":categories.documentation});
            data.push({"name": "translations", "category": "Translations", "posts":categories.translations});
            data.push({"name": "analysis", "category": "Analysis", "posts":categories.analysis});
            data.push({"name": "ideas", "category": "Suggestions", "posts":categories.ideas});
            data.push({"name": "graphics", "category": "Graphics", "posts":categories.graphics});
            data.push({"name": "tutorials", "category": "Tutorials", "posts":categories.tutorials});
            data.push({"name": "video-tutorials", "category": "Video Tutorials", "posts":categories.video_tutorials});
            data.push({"name": "blog", "category": "Blog", "posts":categories.blog});
            data.push({"name": "tasks", "category": "Task Requests", "posts":categories.tasks});
            data.push({"name": "social", "category": "Visibility", "posts":categories.visibility});
            data.push({"name": "copywriting", "category": "Copywriting", "posts":categories.copywriting});
            let datalen = data.length;
            data.sort(function(a, b) {
                return b['posts'] - a['posts'];
            })
            s += "<ul>";
            for (let i = 0; i < datalen; ++ i) {
                s += "<li><a target=_blank href='https://utopian.io/" + data[i]['name'] + "/review'>" + data[i]['category'] + ' (' + data[i]['posts'] + ')</a></li>';
            }
            s += "</ul>";            
            $('div#unreviewed_cnt').html(s);
            let chart = AmCharts.makeChart( "chart_unreviewed", {
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
            logit("API Finished: unreviewed.");
            $('img#loading-unreviewed').hide();
        }             
    });    
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

function getStats(api, dom) {
    logit("calling " + api);
    $.ajax({
        type: "GET",
        url: api,
        success: function(result) {
            let s = "<ul>";
            let stats = result.stats;
            s += "<li>Bot is Voting: <B>" + stats['bot_is_voting'] + "</B></li>";
            s += "<li>Total Paid Rewards: " + stats['total_paid_rewards'] + " STEEM</li>";
            s += "<li>Total Pending Rewards: " + stats['total_pending_rewards'] + " STEEM</li>";
            s += "<li>Total Paid Authors: " + stats['total_paid_authors'] + " STEEM</li>";
            s += "<li>Total Paid Curators: " + stats['total_paid_curators'] + " STEEM</li>";            
            s += "<li>Last Limit Comment Benefactor: " + stats['last_limit_comment_benefactor'] + "</li>";
            s += "<li>Total Pending Last Post Date: " + stats['stats_total_pending_last_post_date'] + "</li>";
            s += "<li>Total Paid Last Post Date: " + stats['stats_total_paid_last_post_date'] + "</li>";
            s += "<li>Status Total Moderated: " + stats['stats_total_moderated'] + "</li>";
            s += "</ul>";
            s += "<h4>Categories</h4>";
            s += "<ul>";
            let cats = stats.categories;
            let keys = Object.keys(cats);
            let keylen = keys.length;
            for (let i = 0; i < keylen; i ++) {
                s += "<li>";
                s += "<h5>" + keys[i] + "</h5>";
                let cat = cats[keys[i]];
                let catkeys = Object.keys(cat);
                let catkeylen = catkeys.length;
                s += "<ul>";
                for (let j = 0; j < catkeylen; j ++) {
                    let att = cat[catkeys[j]];
                    s += "<li><i>" + catkeys[j] + "</i>: " + att + "</li>";
                }
                s += "</ul>";
                s +="</li>";
            }
            s += "</ul>";
            dom.html(s);
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
                    if ((row["supermoderator"]) || (row["referrer"] == undefined)) {
                        s += "<li>You are a Supervisor.</li>";                        
                    } else {
                        s += "<li>Your supervisor is <B>" + getSteemUrl(row["referrer"]) + "</B>.</a></li>";
                    }                        
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

function getModeratorStats(api, dom_approved, dom_rejected, dom_stats, div_of_chart) {
    let api_approved = api + "&status=reviewed";
    let api_rejected = api + "&status=flagged";
    logit("calling " + api_approved);
    $.ajax({
        type: "GET",
        url: api_approved,
        success: function(result) {
            let approved_cnt = result.total;
            let approved_s = "<h4>Latest Approved Posts</h4>";
            approved_s += "<ul>";
            let approved_len = result.results.length;
            for (let i = 0; i < approved_len; ++ i) {
                let post = result.results[i];
                approved_s += "<li><a target=_blank href='https://utopian.io/utopian-io/@" + post['author'] + '/' + post['permlink'] + "'>" + post['title'] + "</a> by <I>@" + post['author'] + "</I></li>";
            }
            approved_s += "</ul>";
            dom_approved.html(approved_s);
            logit("calling " + api_rejected);
            $.ajax({
                type: "GET",
                url: api_rejected,
                success: function(result) {
                    let rejected_s = "<h4>Latest Rejected Posts</h4>";
                    rejected_s += "<ul>";
                    let rejected_len = result.results.length;
                    for (let i = 0; i < rejected_len; ++ i) {
                        let post = result.results[i];
                        rejected_s += "<li><a target=_blank href='https://utopian.io/utopian-io/@" + post['author'] + '/' + post['permlink'] + "'>" + post['title'] + "</a> by <I>@" + post['author'] + "</I></li>";
                    }
                    rejected_s += "</ul>";
                    dom_rejected.html(rejected_s);                    
                    let rejected_cnt = result.total;                    
                    let s = "<h4>Approved/Rejected Stats</h4>";
                    s += "<ul>";
                    s += "<li>Approved: <B>" + approved_cnt + "</B></li>";
                    s += "<li>Rejected: <B>" + rejected_cnt + "</B></li>";
                    s += "</ul>";
                    dom_stats.html(s);
                    let data = [];
                    data.push({"status": "approved", "count": approved_cnt});
                    data.push({"status": "rejected", "count": rejected_cnt});
                    let chart = AmCharts.makeChart(div_of_chart, {
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

function getVP(id, dom, server) {
    server = server || default_node;
    steem.api.setOptions({ url: server });

	steem.api.getAccounts([id], function(err, response) {
    	if (!err) {
    		let result = (response[0].voting_power) / 100;
    		dom.html("<i>@" + id + "'s Voting Power is</i> <B>" + result + "%</B>");
            if (result < 30) {
                dom.css("background-color", "red");
            } else if (result < 60) {
                dom.css("background-color", "orange");
            } else {
                dom.css("background-color", "green");
            }
            dom.css("color", "white");
            dom.css("width", result + "%");
    		logit("API Finished: VP- " + id);
		} else {
			logit("API error: " + err);
		}
	});   
}

function getRep(id, dom, server) {
    server = server || default_node;
    steem.api.setOptions({ url: server });

	steem.api.getAccounts([id], function(err, response) {
		if (!err){
			let result = steem.formatter.reputation(response[0].reputation);
			let av = steem.formatter.estimateAccountValue(response[0]);
		    av.then(value => {
                dom.html("<i>@" + id + "'s Reputation is</i> <B>" + result + "</B><br><i>@" + id + "'s Total Account Value is</i> <B>$" + value + "</B>");
            });
            logit("API Finished: Reputation/Account Value - " + id);
		} else {
            logit("API error: " + err);
        }
	});
}

function updateModeratorsById(id, api, dom) {
    logit("calling " + api);
    $.ajax({
        type: "GET",
        url: api,
        success: function(result) {
            let arr = result.results;      
            let s = "";
            for (let i = arr.length - 1; i --; ) {
                let row = arr[i];
                if (row["account"] == id) {
                    s + "<ul>";
                    if ((row["supermoderator"]) || (row["referrer"] == undefined)) {
                        s += "<li>" + getSteemUrl(id) + " is a Supervisor.</li>";
                    } else {                        
                        s += "<li>" + getSteemUrl(id) + "'s supervisor is <B>" + getSteemUrl(row["referrer"]) + "</B>.</li>";
                    }                        
                    s += "<li>He/She has moderated <B>" + row["total_moderated"] + "</B> posts.</li>";
                    s += "<li>He/She should receive rewards: <B>" + (row["should_receive_rewards"].toFixed(3)) + "</B> STEEM.</li>";
                    s += "<li>Total paid rewards: <B>" + (row["total_paid_rewards_steem"].toFixed(3)) + "</B> STEEM.</li>";
                    s += "<li>Percentage of Total Moderator Rewards: <B>" + (row["percentage_total_rewards_moderators"].toFixed(2)) + "</B>% .</li>";
                    s += "</ul>";                    
                }
            }           
            dom.html(s);
        },
        error: function(request, status, error) {
            logit('Response: ' + request.responseText);
            logit('Error: ' + error );
            logit('Status: ' + status);
        },
        complete: function(data) {
            logit("API Finished: Moderators: " + id + ".");
        }             
    });    
}

function getTeamMembers(id, api, dom, div_of_chart) {
    logit("calling " + api);
    $.ajax({
        type: "GET",
        url: api,
        success: function(result) {
            let arr = result.results;                  
            let referrer = "";
            for (let i = arr.length - 1; i --; ) {
                let row = arr[i];
                if (row["account"] == id) {
                    referrer = row["referrer"];
                    if ((!referrer) || (row["supermoderator"])) {
                        referrer = id;
                    }
                    break;
                }
            }
            if (referrer != "") {
                let s = "<table style='width:100%'>";
                s += "<thead>";
                s += "<tr><th>Team Member</th><th>Total Moderated</th><th>Approve Ratio %<th>Paid</th><th>Should Receive</th><th>Percentage of Rewards</th></tr>";
                s += "</thead>";
                let cnt1 = 0;
                let cnt2 = 0;
                let sum_total_paid = 0;
                let sum_total_should = 0;
                let arrlen = arr.length;
                let data = [];                  
                for (let i = 0; i < arrlen; ++ i) {
                    let row = arr[i];
                    if ((row["referrer"] == referrer) || (row["account"] == referrer)) {
                        let tid = row["account"];
                        let total_paid_rewards_steem = row["total_paid_rewards_steem"] ? row["total_paid_rewards_steem"] : 0;
                        let should_receive_rewards = row["should_receive_rewards"] ? row["should_receive_rewards"] : 0;
                        s + "<tr>";
                        let _tid  = tid.split('.')[0];
                        s += "<td>" + getSteemUrl(tid) + "</td>";
                        s += "<td>" + row["total_moderated"] + "</td>";
                        s += "<td><div id='approved_ratio_" + _tid + "'> </div></td>";
                        getRatio(tid).then(r => {
                            if (r <= 60) {
                                $('div#approved_ratio_' + _tid).html("<B><font color=green>" + r.toFixed(2) + "</font></B>");
                            } else if (r <= 80) {
                                $('div#approved_ratio_' + _tid).html("<B><font color=orange>" + r.toFixed(2) + "</font></B>");
                            } else {
                                $('div#approved_ratio_' + _tid).html("<B><font color=red>" + r.toFixed(2) + "</font></B>");
                            }
                        });
                        s += "<td>" + (total_paid_rewards_steem.toFixed(2)) + "</td>";
                        s += "<td>" + (should_receive_rewards.toFixed(2)) + "</td>";
                        s += "<td>" + (row["percentage_total_rewards_moderators"].toFixed(2)) + "%</td>";
                        s += "</tr>";                    
                        cnt1 += row["total_moderated"];
                        cnt2 += row["percentage_total_rewards_moderators"];
                        sum_total_paid += total_paid_rewards_steem;
                        sum_total_should += should_receive_rewards;
                        data.push({"account": tid, "moderated": row["total_moderated"]});
                    }
                }
                s += "<tfoot>";
                s += "<tr>";
                s += "<td><I>Total</I></td><td><I>" + cnt1 + "</I></td>"; 
                s += "<td></td>";
                s += "<td><I>" + sum_total_paid.toFixed(2) + "</I></td>";
                s += "<td><I>" + sum_total_should.toFixed(2) + "</I></td>";
                s += "<td><I>" + cnt2.toFixed(2) + "</I></td></tr>";
                s += "</tr>";
                s += "</tfoot>";
                s += "</table>";
                let chart = AmCharts.makeChart(div_of_chart, {
                    "type": "pie",
                    "theme": "light",
                    "dataProvider": data,
                    "startDuration": 0,
                    "valueField": "moderated",
                    "titleField": "account",
                    "balloon":{
                      "fixedPosition": true
                    },
                    "export": {
                      "enabled": false
                    }
                });                 
                dom.html(s);
            }            
        },
        error: function(request, status, error) {
            logit('Response: ' + request.responseText);
            logit('Error: ' + error );
            logit('Status: ' + status);
        },
        complete: function(data) {
            logit("API Finished: Team Members: " + id + ".");
        }             
    });    
}

const getPosts = (id, dom, server, num = 10) => {
    server = server || default_node;
    steem.api.setOptions({ url: server });

    var query = {
        tag: id,
        limit: num
    };

    steem.api.getDiscussionsByBlog(query, function (err, discussions) {
        console.log(err, discussions);
        if (!err) {
            discussions.map(function (discussion) {
                var li = document.createElement('li');
                li.innerHTML = "<font color=gray><I>" + discussion.created + "</I></font>: <a target=_blank href='https://steemit.com/@" + discussion.author + "/" + discussion.permlink + "'>" + discussion.title + "</a>" + " @" + discussion.author;
                dom.append(li);
            });
        }
    });
}

const getData = (id, dom, item, server) => {
    server = server || default_node;
    steem.api.setOptions({ url: server });

    steem.api.getAccounts([id], function(err, result) {
        let s = "<ul>";
        console.log(result);
        $.each(item, function(index, value) {
            s += "<li><i>" + value + "</i>: " + result[0][value] + "</li>";
        });
        s += "</ul>";
        dom.html(s);
    });
}

document.addEventListener('DOMContentLoaded', function() {
    // init tabs
    $(function() {
        $( "#tabs" ).tabs();
    });
    // set default node
    $('select#nodes').val(default_node);
    // load steem id
    chrome.storage.sync.get('utopian_settings', function(data) {
        if (data && data.utopian_settings) {
            let utopian = data.utopian_settings;
            if (utopian["steemit_id"]) {
                let id = prepareId(utopian["steemit_id"]);
                $('input#steemit_id').val(id);  
                if (validId(id)) {
                    $('input#contributor_id').val(id);  
                    getVP(id, $("div#account_vp"), utopian['nodes']);
                    getRep(id, $("div#account_rep"), utopian['nodes']);
                    getModeratorStats("https://api.utopian.io/api/posts?moderator=" + id + "&skip=0&limit=8", $("div#moderators_approved"), $("div#moderators_rejected"), $('div#moderators_stats'), "chart_moderators");
                    getTeamMembers(id, "https://api.utopian.io/api/moderators", $("div#search_team_result"), search_result_chart_members);
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
                    let id = prepareId(friends[i]);
                    if (validId(id)) {
                        let tid = getIdForDiv(id);
                        $("div#friends_vp_rep").append("<div id='account_vp_100_" + tid + "' class='vpbar'><div id='account_vp_" + tid + "' class='vp'> </div> </div><div id='account_rep_" + tid + "'> </div>");
                        getRep(id, $('div#account_rep_' + tid), utopian['nodes']);
                        getVP(id, $('div#account_vp_' + tid), utopian['nodes']);
                    }
                }                
            }
            // get node infor
            $('select#nodes').val(utopian['nodes']);            
        }
    });
    $('button#save_id_btn').click(function() {
        let id = $('input#steemit_id').val().trim();
        let website = $('select#steemit_website').val();
        let friends = $('textarea#friends').val();
        let nodes = $('select#nodes').val();
        let utopian = {};
        utopian['steemit_id'] = id;
        utopian['steemit_website'] = website;
        utopian['friends'] = friends;
        utopian['nodes'] = nodes;
        chrome.storage.sync.set({ 
            utopian_settings: utopian
        }, function() {
            alert('Settings Saved (Required: Reload Extension)');
        });
    });  
    // utopian-io
    getVP("utopian-io", $("div#account_utopian_vp"), getNode());
    getRep("utopian-io", $("div#account_utopian_rep"), getNode());    
    // about
    let manifest = chrome.runtime.getManifest();    
    let app_name = manifest.name + " v" + manifest.version;
    $('textarea#about').val('Application: ' + app_name + '\n' + 'Chrome Version: ' + getChromeVersion());
    // general
    updateStats("https://api.utopian.io/api/stats");
    // load moderator data
    updateModerators("https://api.utopian.io/api/moderators");
    // load unreviewed contributions
    updateUnreviewed("https://utopian.plus/unreviewedPosts.json");
    // search a id when press Enter
    textPressEnterButtonClick($('input#mod_id'), $('button#search_id'));
    // find user's details.
    $('button#search_id').click(function() {
        let id = prepareId($('input#mod_id').val());
        if (!validId(id)) {
            alert("Doesn't seem a valid Steem ID.");
        } else {
            $("div#search_result_rep").html("<img id='loading' src='images/loading.gif' />");
            getVP(id, $("div#search_result_vp"), getNode());
            getRep(id, $("div#search_result_rep"), getNode());
            getModeratorStats("https://api.utopian.io/api/posts?moderator=" + id + "&skip=0&limit=8", $("div#search_result_approved"), $("div#search_result_rejected"), $('div#search_result_stats'), "search_result_chart");
            updateModeratorsById(id, "https://api.utopian.io/api/moderators", $("div#search_result_stats2"));            
        }        
    });
    // get latest utopian posts
    getPosts("utopian-io", $("ul#posts"), getNode(), 20);   
    // get basic information
    getData("utopian-io", $("div#info"), [
        "name",
        "balance",
        "sbd_balance",
        "last_vote_time",
        "post_count",
        "delegated_vesting_shares",
        "voting_power",
        "reputation"    
    ], getNode());
    // rep calculator
    $('button#btn_rep').click(function() {
        let rep = parseInt($('input#steemit_reputation').val());
        let reputation = steem.formatter.reputation(rep);
        $('div#rep_result').html("Reputation of " + rep + " = <B>" + reputation + "</B>");
    });
    getStats("https://api.utopian.io/api/stats", $("div#stats"));        
}, false);
