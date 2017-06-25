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

        //Wire up the buttons that just change the UI
        $("#user-gotochangepw-button").on('click', function() {controller.showChangePassword();});
        $("#user-changepw-cancel").on('click', function() {controller.cancelChangePassword();});
        $("#user-new-button").on('click', function() {controller.showNewUser();});
        $("#user-createnew-cancel").on('click', function() {controller.cancelNewUser();});
    
        //Wire up the buttons that do stuff

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
	    
	    //After wiring up user buttons, show the ones the user should see first.
        _showNotLoggedIn();

        //Init the campaign list
        _drawCampaignList(model, controller);
        //Init the campaign area

        thiz.standardView(model, controller);

    };


    this.standardView = function(model, controller) {




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

    

}