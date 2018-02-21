'use strict';

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

// escape html
const escapeHtml = (unsafe) => {
    return unsafe
		.replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
 }

// correct format of reputation with 3 decimal places
// PR not merged yet: https://github.com/steemit/steem-js/pull/345
const formatReputation = function(reputation, decimal_places = 3) {
	if (reputation == null) return reputation;
	let neg = reputation < 0;
	let rep = String(reputation);
	rep = neg ? rep.substring(1) : rep;
	let v = (Math.log10((rep > 0 ? rep : -rep) - 10) - 9);
	v =  neg ? -v : v;
	let vv = v * 9 + 25;
	return +(Math.round(vv + "e+" + decimal_places)  + "e-" + decimal_places);
}

// get last week
const getLastWeek = () => {
    let today = new Date();
    let lastWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
    return lastWeek;
}