/*
 *  Uses these IDs:
        user-state
        user-message
        user-username
        user-password
        user-loginbutton
        
    On change, calls changed(username, password), 
    which will be null after a bad login attempt.
 */

function UserWidget(changed) {
    var thiz = this;
    this.currentUsername = null;
    this.currentPassword = null;
    this.getUsername = function() {return this.currentUsername;}
    this.getPassword = function() {return this.currentPassword;}
    this.loggedIn = false;
    this.isLoggedIn = function() {return this.loggedIn;}
    $("#user-loginbutton").click(function() {
        checkUser($("#user-username").val(), $("#user-password").val(), function(err) {
            if (err) {
                thiz.currentUsername = null;
                thiz.currentPassword = null;
                thiz.loggedIn = false;
                $("#user-state").html("Not logged in.");
                $("#user-message").html("Login failed:" + JSON.stringify(err));
            } else {
                thiz.currentUsername = $("#user-username").val();
                thiz.currentPassword = $("#user-password").val();
                thiz.loggedIn = true;
                $("#user-state").html("Logged in as " + thiz.currentUsername + ".");
                $("#user-message").html("");
            }
            if (changed) {
                changed(thiz.currentUsername, thiz.currentPassword);
            }
        })
    });
}

