/*
 * Stateless bag of functions. Each takes the model controller, draws a different sort of view, 
 *   and wires the controller's public "action" methods into the view's events.
 *
 * initUI(model, controller)
 * standardView(model, controller)
 * importView(model, controller)
 */

function Views() {

	var thiz = this;

    //Run this once on page load. It sets up everything that doesn't change,
    // and gives everything else it's initial form.
    this.initUI = function(model, controller) {

        //Wire up the buttons that just change the user UI
        $("#user-gotochangepw-button").on('click', function() {controller.showChangePassword();});
        $("#user-changepw-cancel").on('click', function() {controller.cancelChangePassword();});
        $("#user-new-button").on('click', function() {controller.showNewUser();});
        $("#user-createnew-cancel").on('click', function() {controller.cancelNewUser();});
    
        //Wire up the buttons that do user stuff

        $("#user-loginbutton").on('click', function() {
        	controller.login($("#user-username").val(), $("#user-password").val( ));
        });

        //Also login when I hit return key in the password field
	    $("#user-password").on('keyup', function(e) {
	        if (e.keyCode === 13) {
	            controller.login($("#user-username").val(), $("#user-password").val( ));
	        }
	    });

	    $("#user-createnew-button").on('click',  function() {
            controller.newUser(
        		$("#user-createnew-username").val(), 
        		$("#user-createnew-password1").val(),
        		$("#user-createnew-password2").val()
        	);
        });
	    $("#user-logout-button").on('click', function() {
	    		controller.logout();
	    });
	    $("#user-deleteuser").on('click', function() {
	    	controller.deleteUser();
	    });
	    $("#user-changepw-button").on('click', function() {
        	controller.newUser(
        		$("#user-changepw-old").val(), 
        		$("#user-changepw-new1").val(),
        		$("#user-changepw-new2").val()
        	);
        });

        //CampaignList is drawn by standardView(...)
        //Nothing to do for it here.
	    
	    //Set up buttons in the campaign area
        $("#campaign-save").on('click', function() {
            controller.saveCampaign(GET THE STATE?????);
        });
        $("#campaign-new").on('click', function() {
            controller.newCampaign();
        });
        $("#campaign-import").on('click', function() {
        	controller.importCampaign();
        });
        $("#campaign-clone").on('click', function() {
        	controller.cloneCampaign();
        });
        $("#campaign-delete").on('click', function() {
        	controller.deleteCampaign();
        });
        $("#campaign-new").show();
        $("#campaign-save").hide();
        $("#campaign-import").hide();
        $("#campaign-clone").hide();
        $("#campaign-delete").hide();
    
        //No campaign displayed at init. 
        //  So nothing to do about that.

        thiz.standardView(model, controller);
    };


    this.standardView = function(model, controller) {
    	if (model.creatingUser) {
    		_showCreateNew();
        } else if (model.changingPassword) {
            _showChangingPw();
        } else if (modle.loggedIn) {
            _showLoggedIn(); 
        } else {
 	        _showNotLoggedIn() {
        }

        _drawCampaignList(model, controller);

        // SHOW CORRECT BUTTONS
        ??????????????????????
 NEXT::  ??? Write out the logic <<<===========<<<<
        if (model.campaign) {
        	$("#campaign-save").hide();
            $("#campaign-clone").hide();
        } else {


        }

        // IF CAMPAIGN AND USER CAN EDIT IT

            // SHOW EDITOR

        // ELSE

            _drawStaticCampaignView(model);



    };


    this.printView = function(model, controller) {

    };

    this.importView = function(model, controller) {


    };


    //Functions to swap what's shown in user area. 
    //Used by some buttons, and after login, logout, etc.
    function _showNotLoggedIn() {
        $("#user-state-loggedin").hide();
        $("#user-state-changingpw").hide();
        $("#user-state-notloggedin").show();
        $("#user-state-createnew").hide();
    }
    function _showLoggedIn() {
        $("#user-state-notloggedin").hide();
        $("#user-state-changingpw").hide();
        $("#user-state-loggedin").show();
        $("#user-state-createnew").hide();
    }
    function _showChangingPw() {
        $("#user-state-notloggedin").hide();
        $("#user-state-loggedin").hide();
        $("#user-state-changingpw").show();
        $("#user-state-createnew").hide();
    }
    function _showCreateNew() {
        $("#user-state-createnew").show();
        $("#user-state-notloggedin").hide();
        $("#user-state-loggedin").hide();
        $("#user-state-changingpw").hide();
    }



    function _drawCampaignList(model, controller) {
        var parent = $("#camplist-container");
	    var camps = model.campaigns;
	    parent.empty();
	    parent.append('<h2>Campaigns</h2>');
	    var currentUsername = null;
	    camps.forEach(function(aCamp) {
	        //Insert header before each user's campaigns
	        if (aCamp.username != currentUsername) {
	            var userHead = $('<h3 class="camps-userhead"></h3>');
	            userHead.html(escapeHtml(aCamp.username));
	            parent.append(userHead);
	            currentUsername = aCamp.username;
	        }
	        var campy = $('<div class="camps-camp"></div>');
	        if (!aCamp.title) {
	            aCamp.title = '[nameless]';
	        }
	        campy.html(escapeHtml(aCamp.title));
	        campy.on('click',function() {
	        	controller.selectCampaign(aCamp);
	        });
	        parent.append(campy); 
	    });
    }

    function _drawStaticCampaignView(model) {
    	var data = model.campaign;
    	rwbDef = model.def;
        var parent = $("#campaign-thecampaign");
        var titleElement = $("<h2></h2>");
        titleElement.html(escapeHtml(data['title']));
        parent.append(titleElement);
    
        var field, i;
        var div;
        //rwbDef.fields[0]  was the title
        for (i = 1; i < rwbDef.fields.length; i++) {
            parent.append('<h3>' + rwbDef.fields[i].label + '</h3>');
            if (rwbDef.fields[i].isarrayfield) {
                var arr = data[rwbDef.fields[i].name];
                if (arr.length) {
                    arr.forEach(function(x, index) {
                        div = $("<div></div>");
                        div.html(escapeHtml(x));
                        parent.append(div)
                    });
                }
            } else {
                div = $("<div></div>");
                div.html(escapeHtml(data[rwbDef.fields[i].name]));
                parent.append(div);
            }
        }
    }



}