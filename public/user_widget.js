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
    this.currentUsername = '';
    this.currentPassword = '';
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
    
    //Open and close dropdown containing extra controls
    $("#user-drowdown-content").hide();
    $("#user-dropdown-more").on('click', function() {
        $("#user-drowdown-content").show();
    });
    $("#user-dropdown-less").on('click', function() {
        $("#user-drowdown-content").hide();
    });
    
   
    //Create new user
    //THIS IS STARTING TO WANT A MODEL, A VIEW, AND AN UPDATEVIEW METHOD...
    $("#user-new-button").on('click', function() {
        var n = $("#user-new-username").val().trim();
        var p1 = $("#user-new-password1").val().trim();
        var p2 = $("#user-new-password2").val().trim();
        if (n.length && p1.length && p2.length &&  p1 === p2) {
            createUser(n,p1,function(err) {
                if (err) {
                    alert(JSON.stringify(err));
                } else {
                    thiz.currentUsername = n;
                    this.currentPassword = p1;
                    $("#user-username").val(n);
                    $("#user-password").val(p1);
                    thiz.loggedIn = true;
                    $("#user-new-username").val('');
                    $("#user-new-password1").val('');
                    $("#user-new-password2").val('');
                }
            });
            
        } else {
            alert('All fields are required and passwords must match.');
        }
    });
    
    $("#user-changepw-button").on('click', function() {
        if (!thiz.currentUsername.trim().length) {
            alert('Please log in.');
            return;
        }
        var oldPw = $("user-changepw-old").val().trim();
        var newPw1 = $("user-changepw-new1").val().trim();
        var newPw2 = $("user-changepw-new2").val().trim();
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
                alert(JONS.stringify(err));
            } else {
                alert('Password changed.');
            }
        });            
    });

}

