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
        //load it
        //set as thiz.model.campaign

    };

    this.saveCampaign
    this.cloneCampaign
    this.newCampaign
    this.importCampaign
    this.deleteCampaign

}