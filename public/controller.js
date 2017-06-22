/*  API:
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
        	alert("Please enter a username and a password. And passwords must match.");
        	//No need to redraw
        }
    };


    this.deleteUser
    this.changePassword
    this.selectCampaign
    this.saveCampaign
    this.cloneCampaign
    this.newCampaign
    this.importCampaign
    this.deleteCampaign

}