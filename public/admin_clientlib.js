/*
 * callback(err)
 */
function checkAdminUser(name, password, callback) {

}

//callback(err)
function adminDeleteCampaign(adminUsername, adminPassword, campaignUsername, campaignId, callback) {
  $.ajax({
        type: 'DELETE',
        url: '/api/admin/campaign/' + campaignUsername + '/' + campaignId,
        success: function(data) {if (callback) {callback(null);}},
        error:function(jqXHR ) {if (callback) {callback(jqXHR.responseText);}},
        contentType: "application/json",
        dataType: 'json',
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Authorization', 'Basic ' + btoa(adminUsername + ':' + adminPassword));  
        }
    });
}

/*
 * Delete this user and all of their campaigns
 *
 *callback(err)
 */
function adminDeleteUser(adminUsername, adminPassword, deleteThisUser, callback) {
  $.ajax({
        type: 'DELETE',
        url: '/api/admin/user/' + deleteThisUser,
        success: function(data) {if (callback) {callback(null);}},
        error:function(jqXHR ) {if (callback) {callback(jqXHR.responseText);}},
        contentType: "application/json",
        dataType: 'json',
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Authorization', 'Basic ' + btoa(adminUsername + ':' + adminPassword));  
        }
    });
}

//callback(err, userObj)
function adminGetUser(adminUsername, adminPassword, username, callback) {
  $.ajax({
        type: 'GET',
        url: '/api/admin/user/' + username,
        success: function(data) {if (callback) {callback(null, data);}},
        error:function(jqXHR ) {if (callback) {callback(jqXHR.responseText);}},
        contentType: "application/json",
        dataType: 'json',
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Authorization', 'Basic ' + btoa(adminUsername + ':' + adminPassword));  
        }
    });
}

function adminWriteUser(adminUsername, adminPassword, userObject, callback) {
alert('write admin_clientlib adminGEtUser');
}