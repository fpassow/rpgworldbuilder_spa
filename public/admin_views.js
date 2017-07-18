

function AdminViews() {

    this.standardView = function(model, controller) {
        _drawUserList(model, controller);
        _drawCampaignList(model, controller);
    };

    function _drawUserList(model, controller) {
        var parent = $("#admin-camplist");
    }

    function _drawCampaignList(model, controller) {
        var parent = $("#admin-camplist");
	    var camps = model.campaignList;
	    parent.empty();
	    parent.append('<h2>Campaigns</h2>');
	    camps.forEach(function(aCamp) {
	        var campy = $('<div class="camp"></div>');
            var delButt = $('<button>DELETE</button>');
	        if (!aCamp.title) {
	            aCamp.title = '[nameless]';
	        }
	        campy.html(escapeHtml(aCamp.title) + '[' + escapeHtml(aCamp.username) + ']');
	        var un = aCamp.username;
            var id = aCamp.campaignId;
            delButt.on('click',function() {
	        	controller.eventCampaignDelete(un, id);
	        });
            campy.append(delButt);
	        parent.append(campy); 
	    });
    }



    //UTILS
    function escapeHtml(unsafe) {
        if (!unsafe) {
            return "";
        }
        return unsafe
             .replace(/&/g, "&amp;")
             .replace(/</g, "&lt;")
             .replace(/>/g, "&gt;")
             .replace(/"/g, "&quot;")
             .replace(/'/g, "&#039;");
     }

}