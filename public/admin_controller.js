/*
  This admin controller has references to the model and the views, but keeps no other state of its own,
  and the model is just data. (And server access details are hidden in clientlib.sj.)

  The admin controller receives very simple UI events, basically just clicks. The event processing code
  has utility methods to pull user inputs from the UI, and clientlib.js functions to talk to the server.

  views argument should be an AdminViews.

  Admin users are managed directly in the database.

  No admin functionality is included in any file in the primary spa. So the admin spa also has an 
  extra set of functions in admin_clientlib.js
*/

function AdminController(model, views) {

	this.model = model;
	this.views = views
	thiz = this;

    //Utility function to pull data from the user section INPUT elements
    function _readUserInputs() {
    	var uin = {};
    	uin.login = {};
        uin.login.username = $("#user-username").val();
        uin.login.password = $("#user-password").val( );
        return uin;
    }

    this.eventUserLogin = function() {
    	var uin = _readUserInputs();
    	var n = uin.login.username;
    	var p = uin.login.password;
        checkAdminUser(n, p, function(err) {
            if (err) {
                model.user.username = n;
                model.user.password = null;
                model.user.loggedIn = false;
                model.userMessage = "Login failed:" + JSON.stringify(err);
            } else {
                model.user.username = n;
                model.user.password = p;
                model.user.loggedIn = true;
                model.userMessage = "Logged in as <b>" + n + "</b>";
            }
            views.standardView(model, thiz);
        });
    };

    this.eventUserLogout = function() {
    	//The server has no concept of "logged in". So we're just dropping local state.
    	model.user.username = null;
        model.user.password = null;
        model.user.loggedIn = false;
        views.standardView(model, thiz);
    };

    this.eventDeleteuser = function() {alert('FUNCTION NOT WRITTEN YET');};


    // Called when user clicks a campaign in the campaign list.
    this.selectCampaign = function(campMeta) {
        loadCampaign(campMeta.username, campMeta.campaignId, function(err, camp) {
            if (err) {
                alert(JSON.stringify(err));
            } else {
                model.campaign = camp;
                views.standardView(model, thiz);
            }
        });
    };
    
    this.eventCampaignDelete = function() {
        if (confirm('Delete this campaign?')) {
            adminDeleteCampaign(model.user.username, model.user.password, USERNAME, model.campaign.campaignId, function(err) {
                if (err) {
                    alert(JSON.stringify(err));
                } else {
                	model.campaign = null;
                    findCampaignsMetadata({}, function(err, campsMeta) {
                	    if (err) {
                            alert(JSON>stringify(err));
                	        views.standardView(model, thiz);
                        } else {
                    	    model.campaignList = campsMeta;
                	        views.standardView(model, thiz);
                        }
                    });
                }
            });
        }
    };

    
    //Wire events from the static html

    $("#user-login-button").on('click', this.eventUserLogin); 
	$("#user-password").on('keyup', function(e) {
	    if (e.keyCode === 13) {//return key
	        thiz.eventUserLogin();
	    }
	});
    $("#user-logout-button").on('click', this.eventUserLogout);
	$("#campaign-delete").on('click', this.eventCampaignDelete);

	//Events from dynamically generated HTML:
    //  Clicking a campaign in the CamplaignList calls controller.selectCampaign(campMeta);
    //  Clicking [Delete] on a user deletes the user. (User's campaigns are deleted on the server side)
}