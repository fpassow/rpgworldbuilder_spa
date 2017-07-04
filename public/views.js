/*
 * Stateless bag of functions. Each takes the model and controller, draws a different sort of view, 
 * These functions NEVER change the model. And they never communicate with the server.
 * They (mostly) use references to zero-argument functions off the controller to dynamically
 *   set event handlers when necessary.
 *
 * Internal utility functions are prefixed with _anUnerbar.
 */

function Views() {

    this.standardView = function(model, controller) {
    	$("#user-message").html(model.userMessage);
        $("#user-username").val(model.user.username);
        $("#user-password").val('');
    	$("#user-createnew-username").val(model.user.username);
        $("#user-createnew-password1").val('');
        $("#user-createnew-password2").val('');
        $("#user-changepw-old").val('');
        $("#user-changepw-new1").val('');
        $("#user-changepw-new2").val('')

    	if (model.creatingUser) {
    		$("#user-state-notloggedin").hide();
    		$("#user-state-loggedin").hide();
    		$("#user-state-changingpw").hide();
    		$("#user-state-createnew").show();
        } else if (model.changingPassword) {
            $("#user-state-notloggedin").hide();
    		$("#user-state-loggedin").hide();
    		$("#user-state-changingpw").show();
    		$("#user-state-createnew").hide();
        } else if (model.user.loggedIn) {
    		$("#user-state-notloggedin").hide();
    		$("#user-state-loggedin").show();
    		$("#user-state-changingpw").hide();
    		$("#user-state-createnew").hide();
        } else {
    		$("#user-state-notloggedin").show();
    		$("#user-state-loggedin").hide();
    		$("#user-state-changingpw").hide();
    		$("#user-state-createnew").hide();
        }
        _drawCampaignList(model, controller);

        //Some useful logic for deciding what to show
        var loggedIn = model.user.loggedIn;
        var haveCampaign = !!model.campaign;
        //Note: If I am not logged in and create a new campaign (with no user name), it's mine.
        var campIsMine = haveCampaign && model.user.username === model.campaign.username;

        $("#campaign-new").toggle(true);
        $("#campaign-save").toggle(campIsMine);
        $("#campaign-import").toggle(campIsMine);
        $("#campaign-clone").toggle(loggedIn && haveCampaign);
        $("#campaign-delete").toggle(loggedIn && campIsMine);

        //Populate the campaign editing/display area
        $("#campaign-thecampaign").empty();
        if (haveCampaign) {
            if (campIsMine) {
            	_drawCampaignEditor(model, controller)
            } else {
            	_drawStaticCampaignView("campaign-thecampaign", model);
            }
        }
    };


    this.printView = function(model, controller) {
        $("#savebox").show();
        _drawStaticCampaignView("savebox-content", model);
    };

    this.importView = function(model, controller) {


    };


    function _drawCampaignList(model, controller) {
        var parent = $("#camplist-container");
	    var camps = model.campaignList;
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

    function _drawStaticCampaignView(targetId, model) {
    	var data = model.campaign;
    	rwbDef = model.def;
        var parent = $("#" + targetId);
        var titleElement = $("<h2></h2>");
        titleElement.html(escapeHtml(data['title']));
        parent.append(titleElement);
        var authorCredit = $('<div class="campaign-author-credit"></div>');
        authorCredit.html('By ' + escapeHtml(data.username));
        parent.append(authorCredit);
    
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


    //Build and return a hints table as a jQuery element. (Don't dispay it in this function.)
    function _createHints(hints) {
        var element = $('<div class="rwb-field-docblock-hints"></div>');
        var table = $('<table></table>');
        element.append(table);
        var tr = $('<tr></tr>');
        var rowCount = 0;
        var ROW_MAX = 3;
        var td, hintLink;
        for (var i = 0; i < hints.length; i++) {
            td = $('<td></td>');
            if (hints[i].description && hints[i].description.length) {
                hintLink = $('<a class="hintlink">' + hints[i].label + '</a>');
                (function() {
                    var hintIndex = i;
                    hintLink.on('click', function() {
                        _showHint(hints[hintIndex].label, hints[hintIndex].description);
                    });
                })();
                td.append(hintLink);
            } else {
                td.append(hints[i].label);
            }
            tr.append(td);
            if (rowCount++ >= ROW_MAX) {
                table.append(tr);
                tr = $('<tr></tr>');
                rowCount = 0;
            }
        }
        if (rowCount != 0) {
            table.append(tr);
        }
        return element;
    }


    function _showHint(hintlabel, hintcontent) {
        $("#hintbox-label").text(hintlabel);
        $("#hintbox-content").html(hintcontent);
        $("#hintbox").css("display", "block");
    }
 

	function _drawCampaignEditor(model, controller) {
		var rwbDef = model.def;
	    var data = model.campaign;
	    var parent = $("#campaign-thecampaign");
	    parent.append('<h2 class="rwb-title">' + rwbDef.label + '</h2>');
	    parent.append('<div class="rwb-top-instructions">' + rwbDef.instructions + '</div>');
	    
	    //Loop over the def's fields array, creating and populating our field objects
	    for (i = 0; i < rwbDef.fields.length; i++) {
	        if (rwbDef.fields[i].isarrayfield) {
	            drawArrayField(parent, rwbDef.fields[i], data[rwbDef.fields[i].name]);
	        } else {
	            drawSimpleField(parent, rwbDef.fields[i], data[rwbDef.fields[i].name]);
	        }
	    }

	    //Text inputs and textarea's
	    function drawSimpleField(parentElement, def, data) {
	        var name = def.name;
	        var target = $('<div class="rwb-field"></div>');
	        parentElement.append(target);
	        target.append('<div class="rwb-field-label">' + def.label + '</div>');
	        target.append('<div class="rwb-field-docblock"><div class="rwb-field-docblock-instructions">' + def.instructions + '</div></div>');
	        var thingData = $('<div class="rwb-field-data"></div>');
	        var item;
	        if (def.longtext) {
	            item = $('<textarea></textarea>').attr('id', 'campedit-' + name + '-field');
	        } else {
	            item = $('<input>').attr('id', 'campedit-' + name + '-input');
	        }
	        item.val(data);
	        thingData.append(item);
	        target.append(thingData);
	    }

	    function drawArrayField(parentElement, def, arr) {
	        var target = $('<div class="rwb-arrayfield"></div>');
	        parentElement.append(target);
	        target.append('<div class="rwb-field-label">' + def.label + '</div>');
	        var instructoid = $('<div class="rwb-field-docblock"></div>');
	        instructoid.append('<div class="rwb-field-docblock-instructions">' + def.instructions + '</div>');
	        instructoid.append(_createHints(def.hints));
	        target.append(instructoid);
	        var dataDiv = $('<div class="rwb-field-data"></div>');
	        if (arr.length) {
	            arr.forEach(function(x, index) {
	                var item = $('<div></div>').addClass('rwb-field-data-arrayitem').html(escapeHtml(x));
	                var deleteItem = $("<span></span>");
	                deleteItem.addClass('rwb-field-data-arrayitem-delete').html('[x]');
	                deleteItem.on('click',function() {
	                    controller.deleteArrayFieldItem(def.name, index);
	                });
	                item.append(deleteItem);
	                dataDiv.append(item);
	            });
	        }
	        var field = $('<input>').attr('id', 'campedit-' + def.name + '-input');;
	        dataDiv.append(field);
	        var butt = $('<button type="button">Add</button>');
	        butt.on('click', function() {
	            controller.saveInputs();
	        });
	        //You can add an item by hitting return in the input.
	        field.on('keyup', function(e) {
	            if (e.keyCode === 13) {
	                controller.saveInputs();
	            }
	        });
	        dataDiv.append(butt);
	        target.append(dataDiv);
	    }
	}

}