var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var mongoUrl = 'mongodb://127.0.0.1:27017/rpgworldbuilder';

/*
 * callback(storeObjectWithConnectionsAndMethods)
 */
function connect(callback) {
    
    var store = {};
    
    MongoClient.connect(mongoUrl, function (err, db) {
        if (err) {
          console.log('Unable to connect to the mongoDB server. Error:', err);
        } else {
            console.log('Connection established to', mongoUrl);
            db.createCollection("users", function(err, users){
                if (err) {
                    console.log('Error accessing users collection. Error:', err);
                } else {
                    db.createCollection("campaigns", function(err, campaigns) {
                        if (err) {
                            console.log('Error accessing campaigns collection. Error:', err);
                        } else {
                            //collections
                            store.users = users;
                            store.campaigns = campaigns;
                            //functions
                            store.loadUser = loadUser;
                            store.storeUser = storeUser;
                            store.deleteUser = deleteUser;
                            store.listUsers = listUsers;
                            store.loadCampaign = loadCampaign;
                            store.storeCampaign = storeCampaign;
                            store.deleteCampaign = deleteCampaign;
                            store.findCampaigns = findCampaigns;
                            callback(store);
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
        console.log('store.loadUser err: ' + JSON.stringify(err));
        console.log('store.loadUser storedUser: ' + JSON.stringify(storedUser));
        callback(err, storedUser);
    });
}
/*
 * callback(err)
 */
function deleteUser(username, callback) {
    if (username && username.length) {
        this.users.remove({username:username}, function(err) {
            callback(err);
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
 * campaignId + username is the key. A username is required. A campaignId will be added if necessary.
 *
 * callback(err, campaign)
 */
function storeCampaign(campaign, callback) {
    if (!campaign.username || !campaign.username.length) {
        callback("Missing username on campaign", campaign);
    } else {
        if (!campaign.campaignId) {
            campaign.campaignId = mongodb.ObjectID().toString();
        }
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
 * callback(err)
 */
function deleteCampaign(username, campaignId, callback) {
    if (campaignId && campaignId.length) {
        this.campaigns.remove({username:username, campaignId:campaignId}, function(err) {
            callback(err);
        });
    }
}

module.exports = connect;

