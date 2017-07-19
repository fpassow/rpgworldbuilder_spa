/*
 * callback(err)
 */
function checkAdminUser(name, password, callback) {

}

//callback(err)
function adminDeleteCampaign(adminUsername, adminPassword, campaignUsername, campaignId) {
  $.ajax({
        type: 'DELETE',
        url: '/api/admin/campaign/' + '/' + campaignUsername + '/' + campaignId,
        success: function(data) {if (callback) {callback(null);}},
        error:function(jqXHR ) {if (callback) {callback(jqXHR.responseText);}},
        contentType: "application/json",
        dataType: 'json',
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Authorization', 'Basic ' + btoa(adminUsername + ':' + adminPassword));  
        }
    });
}

