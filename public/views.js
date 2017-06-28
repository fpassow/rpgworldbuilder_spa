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

        _drawCampaignList(model, controller);
	    
	    //Set up buttons in the campaign area
        $("#campaign-save").on('click', function() {
            controller.saveInputs(_collectInputs());
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

        $("#hintbox-close").on('click', _hideHint);
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

        //cases from X of loggedIn, haveCampaign, campaignIsMine
        
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

    function _collectInputs() {
        //INPUT fields have ID's campedit-<name>-input
        inputs = {};
        var name;
        for (var i = 0; i < rwbDef.fields.length; i++) {
            name = rwbDef.fields[i].name;
            inputs[name] = $("#campedit-" + name + "-input").val();
        }
        return inputs;
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
    function _hideHint() {
        $("#hintbox").css("display", "none");
    }




function _drawCampaignEditor(rwbDef, model, controller) {
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
        instructoid.append(_createHints(this.hints));
        target.append(instructoid);
        var dataDiv = $('<div class="rwb-field-data"></div>');
        if (arr.length) {
            arr.forEach(function(x, index) {
                var item = $('<div></div>').addClass('rwb-field-data-arrayitem').html(escapeHtml(x));
                var deleteItem = $("<span></span>");
                deleteItem.addClass('rwb-field-data-arrayitem-delete').html('[x]');
                deleteItem.on('click',function() {
                    controller.deleteArrayFieldItem(def.name, index, _collectInputs());
                });
                item.append(deleteItem);
                dataDiv.append(item);
            });
        }
        var field = $('<input>').attr('id', 'campedit-' + def.name + '-input');;
        dataDiv.append(field);
        var butt = $('<button type="button">Add</button>');
        butt.on('click', function() {
            controller.saveInputs(_collectInputs());
        });
        //You can add an item by hitting return in the input.
        field.on('keyup', function(e) {
            if (e.keyCode === 13) {
                controller.saveInputs(_collectInputs());
            }
        });
        dataDiv.append(butt);
        target.append(dataDiv);
    }

}