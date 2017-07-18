/*
     Public methods:
         eventUserDelete(username)
         eventCampaignDelete(username, campaignId)
         eventInit //loads data and draws the starndard view

     model has adminUser, adminPassword, userList, campaignList
 */

function AdminController(views) {

	this.model = {};
	this.views = views;
	thiz = this;

    this.eventInit = function() {
        _updateFromServer(function() {
            views.standardView(thiz.model, thiz);
        });
    };


    this.eventUserDelete = function(username) {

    };

    this.eventCampaignDelete = function(username, campaignId) {
        if (confirm('Delete a campaign?')) {
            adminDeleteCampaign(thiz.model.adminUser, thiz.model.adminPassword, username, campaignId, function(err) {
                if (err) {
                    alert(JSON.stringify(err));
                } else {
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

    //Utility function to pull data from the user section INPUT elements
    function _readUI() {
        thiz.model.adminUser = $("#admin1").val();
        thiz.model.adminPassword = $("#admin2").val();
    }

    function _updateFromServer(done) {
        findCampaignsMetadata({}, function(err, campsMeta) {
            if (err) {
                alert(JSON>stringify(err));
                views.standardView(model, thiz);
            } else {
                thiz.model.campaignList = campsMeta;
                listUsers(function(err, users) {
                    if (err) {
                        alert(JSON.stringify(err));
                    } else {
                        thiz.model.userList = users;
                        done();
                    }

                });
            }
        });
    }


/*
    this.eventUserChangepw = function() {
        var uin = _readUserInputs();
        var oldPw = uin.changepw.old;
        var newPw1 = uin.changepw.new1;
        var newPw2 = uin.changepw.new2;
        if (!(oldPw && newPw1 && newPw2 && oldPw.length && newPw1.length && newPw2.length)) {
            alert('All three fields are required.');
            return;//no need to redraw
        }
        if (newPw1 !== newPw2) {
            alert('New password fields must match.');
            return;//no need to redraw
        }
        changePassword(thiz.model.user.username, oldPw, newPw1, function(err) {
            if (err) {
                alert(JSON.stringify(err));
                //No need to redraw
            } else {
                thiz.model.user.password = newPw1;
                alert('Password changed.');
                thiz.views.standardView(model, thiz);
            }
        });
    };
*/

}