//callback(err, campaignDefObject)
function getCampaignDef(callback) {
    $.getJSON('/campaign_form_def.json', function(campDef) {
        callback(null, campDef);
    });
}

//callback(err)
function createUser(username, password, callback) {
    var data = JSON.stringify({username: username, password:password});
    $.ajax({
        type: 'POST',
        url: '/api/user',
        data: data,
        success: function(data) { if (callback) {callback(null);}},
        error:function(jqXHR ) {if (callback) {callback(jqXHR.responseText);}},
        contentType: "application/json",
        dataType: 'json'
    });
}

//callback(err)  If no error, then credentials are good.
function checkUser(username, password, callback) {
  $.ajax({
        type: 'GET',
        url: '/api/user',
        success: function(data) {if (callback) {callback(null);}},
        error:function(jqXHR ) {console.log(JSON.stringify(jqXHR));if (callback) {callback(jqXHR.responseText);}},
        contentType: "application/json",
        dataType: 'json',
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Authorization', 'Basic ' + btoa(username + ':' + password));  
        }
    });
}
        
    //To create a new user, just post {username: --, password: --}
    //Tp update a user, post as above with new password, and include HTTP basic auth with old password.
    //  app.post('/api/user', function(req, res) {
function changePassword(username, oldPassword, newPassword, callback) {
    var dataObj = {username:username, password:newPassword};
     $.ajax({
        type: 'POST',
        url: '/api/user',
        data:JSON.stringify(dataObj),
        success: function(data) {if (callback) {callback(null);}},
        error:function(jqXHR ) {if (callback) {callback(jqXHR.responseText);}},
        contentType: "application/json",
        dataType: 'json',
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Authorization', 'Basic ' + btoa(username + ':' + oldPassword));  
        }
    });
}


//callback(err, useerList) 
function listUsers(callback) {
  $.ajax({
        type: 'GET',
        url: '/api/users',
        success: function(data) {if (callback) {callback(null, data);}},
        error:function(jqXHR ) {if (callback) {callback(jqXHR.responseText);}},
        contentType: "application/json",
        dataType: 'json',
    });
}

//callback(err, camp)
function storeCampaign(username, password, campaign, callback) {
     $.ajax({
        type: 'POST',
        url: '/api/campaign',
        data:JSON.stringify(campaign),
        success: function(sdata) {if (callback) {callback(null,sdata);}},
        error:function(jqXHR ) {if (callback) {callback(jqXHR.responseText);}},
        contentType: "application/json",
        dataType: 'json',
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Authorization', 'Basic ' + btoa(username + ':' + password));  
        }
    });
}
    
//Campaigns are identified by username *and* an ID.
//All campaigns are publicly readable.
//callback(err, campaign)
function loadCampaign(username, campaignId, callback) {
  $.ajax({
        type: 'GET',
        url: '/api/campaign/' + username + '/' + campaignId,
        success: function(data) {if (callback) {callback(null, data);}},
        error:function(jqXHR ) {if (callback) {callback(jqXHR.responseText, null);}},
        contentType: "application/json",
        dataType: 'json'
    });
}
    
//searchCrit is a mongoDb search criteria. TODO: SECURITY!!!!!!!!!!!!!!!!!!!!!11
//callback(err, campaignArray)
function findCampaigns(searchCrit, callback) {
  $.ajax({
        type: 'POST',
        url: '/api/search',
        data: JSON.stringify(searchCrit),
        success: function(data) {if (callback) {callback(null, data);}},
        error:function(jqXHR ) {if (callback) {callback(jqXHR.responseText);}},
        contentType: "application/json",
        dataType: 'json'
    });
}

//searchCrit is a mongoDb search criteria. TODO: SECURITY!!!!!!!!!!!!!!!!!!!!!11
//callback(err, campaignMetadataArray)
//CampaignMetadata is campaignId, title, and username
function findCampaignsMetadata(searchCrit, callback) {
  $.ajax({
        type: 'POST',
        url: '/api/search',
        data: JSON.stringify(searchCrit),
        success: function(data) {if (callback) {callback(null, data);}},
        error:function(jqXHR ) {if (callback) {callback(jqXHR.responseText);}},
        contentType: "application/json",
        dataType: 'json'
    });
}
    
//Campaign must belong to you.
//callback(err)
function deleteCampaign(username, password, campaignId, callback) {
  $.ajax({
        type: 'DELETE',
        url: '/api/campaign/' + campaignId,
        success: function(data) {if (callback) {callback(null);}},
        error:function(jqXHR ) {if (callback) {callback(jqXHR.responseText);}},
        contentType: "application/json",
        dataType: 'json',
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Authorization', 'Basic ' + btoa(username + ':' + password));  
        }
    });
}

//Deletes any campaign, as long as the admin creds are valid
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

//Deletes a user. On the server side, all their campaigns are deleted, too.
//callback(err)
function adminDeleteUser(adminUsername, adminPassword, campaignUsername, campaignId, callback) {
  $.ajax({
        type: 'DELETE',
        url: '/api/admin/user/' + username,
        success: function(data) {if (callback) {callback(null);}},
        error:function(jqXHR ) {if (callback) {callback(jqXHR.responseText);}},
        contentType: "application/json",
        dataType: 'json',
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Authorization', 'Basic ' + btoa(adminUsername + ':' + adminPassword));  
        }
    });
}

//Stub callback for testing
function cb(err, data) {
    console.log(JSON.stringify(err));
    console.log(JSON.stringify(data));
}
