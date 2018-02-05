(function($) {
	let id;
	let website;

	chrome.storage.sync.get('utopian_settings', function(data) {
	    if (data && data.utopian_settings) {
	        let utopian = data.utopian_settings;
	        if (utopian["steemit_id"]) {
	            id = utopian["steemit_id"].trim();
	        }
	        if (utopian["steemit_website"]) {
	            website = utopian["steemit_website"].trim();
	        }
	    }
	});
	website = website || "steemit.com";

	// short cut Alt + S to switch between utopian and steemit
	$(document).keydown(function(e) {
	    if (e.key.toLowerCase() == "s" && e.altKey) {
	    	var url = document.location.href;
	    	if (url.includes("utopian.io")) {	    		
	    		document.location.href = url.replace("utopian.io", website);
	    	} else if (url.includes("steemit.com")) {
	    		document.location.href = url.replace("steemit.com", "utopian.io");
	    	} else if (url.includes("busy.org")) {
	    		document.location.href = url.replace("busy.org", "utopian.io");
	    	}    	
	    }
	});
})(jQuery);