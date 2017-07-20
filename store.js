//Expects MongoDB connection string in environement variable RPGWORLDBUILDER_DB

var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var mongoUrl = process.env.RPGWORLDBUILDER_DB;

/*
 * callback(err, storeObjectWithConnectionsAndMethods)
 */
function connect(callback) {
    
    var store = {};
    
    MongoClient.connect(mongoUrl, function (err, db) {
        if (err) {
          callback(err, null);
        } else {
            db.createCollection("users", function(err, users){
                if (err) {
                    callback(err, null);
                } else {
                    db.createCollection("campaigns", function(err, campaigns) {
                        if (err) {
                            callback(err, null);
                        } else {
                            db.createCollection("admins", function(err, admins) {
                                if (err) {
                                    callback(err, null);
                                } else {

                                    //collections
                                    store.users = users;
                                    store.campaigns = campaigns;
                                    store.admins = admins;
                                    //functions
                                    store.loadUser = loadUser;
                                    store.storeUser = storeUser;
                                    store.deleteUser = deleteUser;
                                    store.listUsers = listUsers;
                                    store.loadCampaign = loadCampaign;
                                    store.storeCampaign = storeCampaign;
                                    store.deleteCampaign = deleteCampaign;
                                    store.findCampaigns = findCampaigns;
                                    store.findCampaignsMetadata = findCampaignsMetadata;
                                    store.loadAdminUser = loadAdminUser
                                    callback(null, store);
                                }
                            });
                        }
                    });
                }
            });
        }
    });
}

/////////////////////////////////////////////////////////////
/// protect from mongo injection attacks!!!!!!!!!!!!!!!!!!!!!!
/////////////////////////////////////////////////////////////

/*
 * Store a new or existing user. 
 * user must have username and password.
 * username is the key. We don't care about returning the _id.
 *
 * callback(err)
 */
function storeUser(user, callback) {
    this.users.update({username:user.username}, user, {upsert:true}, function(err, count, status) {
        callback(err);
    });
}

/*
 * callback(err, user)
 */
function loadUser(username, callback) {
    var crit = {username:username};
    this.users.findOne(crit, function (err, storedUser) {
        callback(err, storedUser);
    });
}
/*
 * Delete the user and all their campaigns.
 *
 * callback(err)
 */
function deleteUser(username, callback) {
    if (username && username.length) {
        var camps = this.campaigns;
        this.users.remove({username:username}, function(err) {
            if (err) {
                callback(err);
            } else {
                camps.remove({username:username}, function(err) {
                    callback(err);
                });
            }
        });
    }
}

/*
 * callback(err, arrayOfUsers)
 */
function listUsers(callback) {    
    this.users.find({}).toArray(function(err, arrayOfUsers) {
        var i;
        var nameArray = [];
        if (!err) {
            for (i = 0; i < arrayOfUsers.length; i++) {
                nameArray.push(arrayOfUsers[i].username);
            }
        }
        callback(err, nameArray);
    });
}

/*
 * campaignId + username is the key. Both are required.
 *
 * callback(err, campaign)
 */
function storeCampaign(campaign, callback) {
    //We identify campaigns by username and campaignId, only. So strip mongo's _id
    delete campaign._id;

    if (!campaign.username || !campaign.username.length || !campaign.campaignId || !campaign.campaignId.length) {
        callback("store.storeCampaign: Missing username or campaignId on campaign", null);
    } else {
        this.campaigns.update({username:campaign.username, campaignId:campaign.campaignId}, campaign, {upsert:true}, function(err, count, status) {
            callback(err, campaign);
        });
    }
}

/*
 * Requires username and campaignId (a string).
 *
 * callback(err, campaign)
 */
function loadCampaign(username, campaignId, callback) {
    this.campaigns.findOne({username:username, campaignId: campaignId}, function(err, campaign) {
        callback(err, campaign);
    });
}
/*
 * Takes a mongodb search object.
 * callback(err, arrayOfCampaigns)
 */
function findCampaigns(searchCrit, callback) {   
    this.campaigns.find(searchCrit).toArray(function(err, campaigns) {
        callback(err, campaigns);
    });
}

/*
 * Takes a mongodb search object.
 * callback(err, arrayOfCampaignsMetadata)
 */
function findCampaignsMetadata(searchCrit, callback) {   
    this.campaigns.find(searchCrit,{campaignId:true,title:true,username:true}).sort({username:1,title:1}).toArray(function(err, campaigns) {
        callback(err, campaigns);
    });
}

/*
 * callback(err)
 */
function deleteCampaign(username, campaignId, callback) {
    if (campaignId && campaignId.length) {
        this.campaigns.remove({username:username, campaignId:campaignId}, function(err) {
            callback(err);
        });
    }
}

/*
 * callback(err, user)
 */
function loadAdminUser(adminUsername, callback) {
    var crit = {adminUsername:adminUsername};
    this.admins.findOne(crit, function (err, storedUser) {
        callback(err, storedUser);
    });
}


module.exports = connect;

