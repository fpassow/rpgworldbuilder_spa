/*
 * Stateless bag of functions. Each takes the model and controller, draws a different sort of view, 
 * These functions NEVER change the model. And they never communicate with the server.
 * They (mostly) use references to zero-argument functions off the controller to dynamically
 *   set event handlers when necessary.
 *
 * Internal utility functions are prefixed with _anUnerbar.
 */

function AdminViews() {

    this.standardView = function(model, controller) {
    	$("#user-message").html(model.userMessage);
        $("#user-username").val(model.user.username);
        $("#user-password").val('');

        if (model.adminLoggedIn) {
    		$("#user-state-notloggedin").hide();
    		$("#user-state-loggedin").show();
        } else {
    		$("#user-state-notloggedin").show();
    		$("#user-state-loggedin").hide();
        }
        _drawCampaignList(model, controller);

        //Populate the campaign editing/display area
        $("#campaign-thecampaign").empty();
        if (model.campaign) {
            _drawStaticCampaignView("campaign-thecampaign", model);
        }
    };

    function _drawCampaignList(model, controller) {
        var parent = $("#camplist-container");
	    var camps = model.campaignList;
        var usernameSet = new Set(model.userList);
	    parent.empty();
	    parent.append('<h2>Campaigns</h2>');
	    var currentUsername = null;
	    camps.forEach(function(aCamp) {
	        //Insert header before each user's campaigns
	        if (aCamp.username != currentUsername) {
                usernameSet.delete(aCamp.username); //Remaining users will be displayed at the end
                var userToDelete = aCamp.username; //used by button event
	            var userHead = $('<h3 class="camps-userhead"></h3>');
	            userHead.html(escapeHtml(aCamp.username));
                var userDeleteButt = $('<button class="del-user-butt">Delete User</button>');
                userDeleteButt.on('click', function() {
                    controller.eventDeleteUser(userToDelete);
                });
                parent.append(userHead);
                parent.append(userDeleteButt);
	            currentUsername = aCamp.username;
	        }
	        var campy = $('<button class="camps-camp"></button>');
	        if (!aCamp.title) {
	            aCamp.title = '[nameless]';
	        }
	        campy.html(escapeHtml(aCamp.title));
	        campy.on('click',function() {
	        	controller.selectCampaign(aCamp);
	        });
	        parent.append(campy); 
	    });
        usernameSet.forEach(function(userToDelete) {
            var userHead = $('<h3 class="camps-userhead"></h3>');
            userHead.html(escapeHtml(userToDelete));
            var userDeleteButt = $('<button class="del-user-butt">Delete User</button>');
            userDeleteButt.on('click', function() {
                controller.eventDeleteUser(userToDelete);
            });
            parent.append(userHead);
            parent.append(userDeleteButt);
        });
    }

    function _drawStaticCampaignView(targetId, model) {
    	var data = model.campaign;
    	rwbDef = model.def;
        var parent = $("#" + targetId);
        var authorCredit = $('<div class="campaign-author-credit"></div>');
        authorCredit.html('By ' + escapeHtml(data.username));
        parent.append(authorCredit);
    
        var field, i;
        var div;
        for (i = 0; i < rwbDef.fields.length; i++) {
            parent.append('<h3>' + rwbDef.fields[i].label + '</h3>');
            if (rwbDef.fields[i].isarrayfield) {
                var arr = data[rwbDef.fields[i].name];
                if (arr && arr.length) {
                    arr.forEach(function(x, index) {
                        div = $('<div class="campaign-static-view-item"></div>');
                        div.html(escapeHtml(x));
                        parent.append(div)
                    });
                }
            } else {
                div = $('<div class="campaign-static-view-item"></div>');
                div.html(escapeHtml(data[rwbDef.fields[i].name]));
                parent.append(div);
            }
        }
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