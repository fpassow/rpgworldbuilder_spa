/*
    On change, calls changed(username, password), 
    which will be null after a bad login attempt.
 */

function UserWidget(changed) {
    var thiz = this;
    this.currentUsername = '';
    this.currentPassword = '';
    this.getUsername = function() {return this.currentUsername;};
    this.getPassword = function() {return this.currentPassword;};
    this.loggedIn = false;
    this.isLoggedIn = function() {return this.loggedIn;};
    
    //Buttons that just change the UI
    $("#user-gotochangepw-button").on('click', showChangingPw);
    $("#user-changepw-cancel").on('click', showLoggedIn);
    $("#user-new-button").on('click', showCreateNew);
    $("#user-createnew-cancel").on('click', function() {if (thiz.loggedIn) {showLoggedIn();}else{showNotLoggedIn();}});
    
    //Buttons that do stuff
    
    $("#user-loginbutton").on('click', userLogin);
    $("#user-createnew-button").on('click', userNew);
    $("#user-logout-button").on('click', userLogout);
    $("#user-deleteuser").on('click', userDelete);
    $("#user-changepw-button").on('click', userChangePassword);
    
    //Functions to swap what's shown in user area. 
    //Used by some buttons, and after login, logout, etc.
    function showNotLoggedIn() {
        $("#user-state-loggedin").hide();
        $("#user-state-changingpw").hide();
        $("#user-state-notloggedin").show();
        $("#user-state-createnew").hide();
    }
    function showLoggedIn() {
        $("#user-state-notloggedin").hide();
        $("#user-state-changingpw").hide();
        $("#user-state-loggedin").show();
        $("#user-state-createnew").hide();
    }
    function showChangingPw() {
        $("#user-state-notloggedin").hide();
        $("#user-state-loggedin").hide();
        $("#user-state-changingpw").show();
        $("#user-state-createnew").hide();
    }
    function showCreateNew() {
        $("#user-state-createnew").show();
        $("#user-state-notloggedin").hide();
        $("#user-state-loggedin").hide();
        $("#user-state-changingpw").hide();
    }
    //start as not logged in.
    showNotLoggedIn();
    
    //Functions that perform actual operations
    
    function userLogin() {
        checkUser($("#user-username").val(), $("#user-password").val(), function(err) {
            if (err) {
                thiz.currentUsername = null;
                thiz.currentPassword = null;
                thiz.loggedIn = false;
                $("#user-notloggedin-message1").html("Not logged in.");
                $("#user-notloggedin-message2").html("Login failed:" + JSON.stringify(err));
            } else {
                thiz.currentUsername = $("#user-username").val();
                thiz.currentPassword = $("#user-password").val();
                thiz.loggedIn = true;
                $("#user-loggedin-message1").html("Logged in as " + thiz.currentUsername);
                $("#user-loggedin-message2").html("");
                showLoggedIn();
                if (changed) {
                    changed(thiz.currentUsername, thiz.currentPassword);
                }
            }
        });
    }
    function userNew() {
        if (!$("#user-createnew-username").val().length || !$("#user-createnew-password1").val().length || ($("#user-createnew-password1").val() !== $("#user-createnew-password2").val())) {
            alert("Please enter a username and a password. And passwords must match.");
            return;
        }
        createUser($("#user-createnew-username").val(), $("#user-createnew-password1").val(), function(err) {
            if (err) {
                alert(JSON.stringify(err));
            } else {
                thiz.currentUsername = $("#user-createnew-username").val();
                thiz.currentPassword = $("#user-createnew-password1").val();
                thiz.loggedIn = true;
                $("#user-loggedin-message1").html("Logged in as " + thiz.currentUsername);
                $("#user-loggedin-message2").html("");
                showLoggedIn();
                if (changed) {
                    changed(thiz.currentUsername, thiz.currentPassword);
                }
            }
        });
    }
    function  userLogout() {
        thiz.currentUsername = '';
        thiz.currentPassword = '';
        thiz.loggedIn = false;
        $("#user-notloggedin-message1").html("Not logged in.");
        $("#user-notloggedin-message2").html("");
        showNotLoggedIn();
        if (changed) {
            changed();
        }
    }
    function  userDelete() {
        alert('FUNCTION NOT WRITTEN YET');
        //call delete
        //show err
        
        //clear fields, 
        //set logged out. 
        //go to login page
        //changed
    }
    function  userChangePassword() {
        if (!thiz.currentUsername.trim().length) {
            alert('Please log in.');
            return;
        }
        var oldPw = $("#user-changepw-old").val().trim();
        var newPw1 = $("#user-changepw-new1").val().trim();
        var newPw2 = $("#user-changepw-new2").val().trim();
        if (!(oldPw.length && newPw1.length && newPw2.length)) {
            alert('All three fields are required.');
            return;
        }
        if (newPw1 !== newPw2) {
            alert('Both new password fields must match.');
            return;
        }
        changePassword(thiz.currentUsername, oldPw, newPw1, function(err) {
            if (err) {
                alert(JSON.stringify(err));
            } else {
                alert('Password changed.');
                showLoggedIn();
            }
        });            
    }

}

