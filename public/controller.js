/*
  This controller has references to the model and the views, but keeps no other state of its own,
  and the model is just data. (And server access details are hidden in clientlib.sj.)

  If these controller functions start getting large, look for code that would also make sense
  as part of a smarter model.

  API:
    login
    logout
    newUser
    deleteUser
    changePassword
    selectCampaign
    saveCampaign
    cloneCampaign
    newCampaign
    importCampaign
    deleteCampaign
 */
function Controller(model, views) {

	this.model = model;
	this.views = views
	thiz = this;

    this.login = function(n, p) {
        checkUser($(n, p, function(err) {
            if (err) {
                thiz.user.username = n;
                thiz.user.password = null;
                thiz.user.loggedIn = false;
                thiz.userMessage = "Login failed:" + JSON.stringify(err));
            } else {
                thiz.username = n;
                thiz.password = p;
                thiz.loggedIn = true;
                thiz.userMessage = "Logged in as <b>" + u + "</b>";
            }
            thiz.views.standardView(thiz.model, thiz);
        });
    };

    this.logout = function() {
    	//The server has no concept of "logged in". So we're just dropping local state.
    	thiz.model.user.username = null;
        thiz.model.user.password = null;
        thiz.model.user.loggedIn = false;
        thiz.views.standardView(thiz.model, thiz);
    };

    this.newUser = function(n, p, pp) {
        if (n && n.length && p && p.length && pp && pp.length && p === pp) {
            createUser(n, p, function(err) {
                if (err) {
                    alert(JSON.stringify(err));
                } else {
                    thiz.model.user.username = n;
                    thiz.model.user.password = p;
                    thiz.model.loggedIn = true;
                    thiz.model.usermessage = "Logged in as <b>" + n + "</b>";
                    thiz.views.standardView(thiz.model, thiz);
                }
            });
        } else {
        	alert("Please enter a username and a password. And the passwords must match.");
        	//No need to redraw
        }
    };

    this.deleteUser function() {alert('FUNCTION NOT WRITTEN YET');};

    this.changePassword = function(oldPw, newPw1, newPw2) {
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
                thiz.views.standardView(thiz.model, thiz);
            }
        });
    };

    this.selectCampaign = function(campMeta) {
        loadCampaign(campMeta.username, campMeta.campaignId, function(err, camp) {
            if (err) {
                alert(JSON.stringify(err));
            } else {
                thiz.model.campaign = camp;
                thiz.views.standardView(thiz.model, thiz);
            }
        });
    };

    this.saveCampaign = function(newCampaignState) {
    	thiz.model.campaign = newCampaignState;
    	if (!thiz.model.user.loggedIn) {
    		thiz.views.printView(thiz.model, thiz);
    	} else {
            thiz.model.campaignMessage = "Saving.....";
            newCampaignState.username = thiz.model.user.username;
            newCampaignState.campaignId = thiz.model.campaign.campaignId;
            thiz.campaign = newCampaignState;
            storeCampaign(thiz.model.user.username, thiz.model.user.password, thiz.campaign, function(err) {
                //Clear "Saving..." message. But make sure it lasts at least half a second.
                if (err) {
                    alert(JSON.stringify(err));
                    thiz.views.standardView(thiz.model, thiz);
                } else {
                    findCampaignsMetadata({}, function(err, campsMeta) {
                	    if (err) {
                            alert(JSON>stringify(err));
                            thiz.model.campaignMessage = "";
                	        thiz.views.standardView(thiz.model, thiz);
                        } else {
                    	    thiz.model.campaignList = campsMeta;----------------------
                            thiz.views.standardView(thiz.model, thiz);
                            setTimeout(function() {
                	            thiz.model.campaignMessage = "";
                	            thiz.views.standardView(thiz.model, thiz);
                            }, 500);
                        }
                    });
                }
            });            
        }
    };

    this.cloneCampaign = function() {
        if (thiz.model.campaign) {
            thiz.model.campaign.username = thiz.model.user.username;
            thiz.model.campaign.campaignId = "ID" + Math.random();
            //No new data here. Don't save until told to.
        } else {
            alert('Nothing to clone');
            thiz.views.standardView(thiz.model, thiz);
        }

    };

    this.newCampaign = function() {
        thiz.model.campaign = {};
        thiz.model.campaign.campaignId = "ID" + Math.random();
        thiz.model.campaign.username = thiz.model.user.username;
        //No point in saving an empty campaign
        thiz.views.standardView(thiz.model, thiz);
    };
    
    this.deleteCampaign = function() {
        if (confirm('Delete this campaign?')) {
            deleteCampaign(thiz.model.user.username, thiz.model.user.password, thiz.model.campaign.campaignId, function(err) {
                if (err) {
                    alert(JSON.stringify(err));
                } else {
                	thiz.model.campaign = null;
                    findCampaignsMetadata({}, function(err, campsMeta) {
                	    if (err) {
                            alert(JSON>stringify(err));
                	        thiz.views.standardView(thiz.model, thiz);
                        } else {
                    	    thiz.model.campaignList = campsMeta;----------------------
                            thiz.views.standardView(thiz.model, thiz);
                        }
                    });
                }
            });
        }
    };


    this.importCampaign = 'TODO';

}