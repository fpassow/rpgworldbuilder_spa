var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var url = 'mongodb://127.0.0.1:27017/rpgworldbuilder';

MongoClient.connect(url, function (err, db) {
    if (err) {
      console.log('Unable to connect to the mongoDB server. Error:', err);
    } else {
        console.log('Connection established to', url);
        db.createCollection("users", function(err, users){
            if (err) {
                console.log('Error accessing users collection. Error:', err);
            } else {
                db.createCollection("campaigns", function(err, campaigns) {
                    if (err) {
                        console.log('Error accessing campaigns collection. Error:', err);
                    } else {
                        serveSomeWebs(users, campaigns);
                    }
                });
            }
        });
    }
});

function serveSomeWebs(users, campaigns) {
    var express = require("express");
    var app = express();
    var bodyParser = require('body-parser')
    app.use(bodyParser.json());
    var basicAuth = require('basic-auth');

    app.use('/public', express.static('public'));
    
    /* Utility function.
     * Calls ifAuth(userObjectFromDatabase) if credentials are good.
     * Sends a status 401 if credentials are bad.
     */
    function authCheck(req, res, users, ifAuth) {
        var reqUser = basicAuth(req);//has name and pass 
        console.log("reqUser:" + JSON.stringify(reqUser));
        if (reqUser && reqUser.name && reqUser.pass) {
            users.findOne({"username":reqUser.name}, function (err, storedUser) {
                console.log("stored:" + JSON.stringify(storedUser));
                if (storedUser && reqUser.pass === storedUser.password) {
                    ifAuth(reqUser, storedUser);
                } else {
                    res.status(401).send("Bad username/password");
                }
            });
        } else {
            res.status(401).send("Missing username/password");
        }
    }
        
    //Create a new user, just post {username: --, password: --}
    //Update a user, post as above with new password, and include HTTP basic auth with old password.
    app.post('/api/user', function(req, res) {
        var reqUser = basicAuth(req);//has name and pass
        var postedUser = req.body;
        if (postedUser && postedUser.username && postedUser.password) {
            users.findOne({"username":postedUser.username}, function (err, storedUser) {
                if (!storedUser) {
                    users.insert(postedUser); console.log("INSERTING");
                } else if (reqUser && reqUser.name && (reqUser.name == storedUser.username)) {
                    storedUser.password = postedUser.password;
                    users.update(storedUser); console.log("UPDATING");
                } else {
                    res.status(401).send("Failed auth while updating user.");
                }
            });
        } else {
            res.status(400).send("Body must contain post {username: --, password: --}");
        }
    });
    
    //Include HTTP basic auth. Returns {"exists":bool, "passwordOk":bool}
    app.get('/api/user', function(req, res) {
        authCheck(req, res, users, function(){
            res.send("User OK");
         });
    });
    
    //Include HTTP basic auth. Campaign is json body. Create or update. Return new campaign with _id.
    app.post('/api/campaign', function(req, res) {
        authCheck(req, res, users, function(reqUser, storedUser) {
            var reqCampaign = req.body;
            if (reqCampaign.id) {
                campaigns.findOne({_id:reqCampaign._id}, function(err, storedCampaign) {
                    if (reqCampaign.username === storedCampaign.username) {
                        //Updating my own campaign
                        campaigns.update(reqCampaign); //magically adds _id to arg object
                        res.json(reqCampaign);
                    } else {
                        //Copying someone else's campaign.
                        delete reqCampaign._id;
                        reqCampaign.username = reqUser.username;
                        campaigns.insert(reqCampaign); //magically adds _id to arg object
                        res.json(reqCampaign);
                    }
                });
            } else {
                reqCampaign.username = reqUser.username;
                campaigns.insert(reqCampaign);
                res.json(reqCampaign);
            }
        });
    });
    
    app.get('/api/campaign/:id', function(req, res) {
        if (req.params.id) {
            campaigns.findOne({_id:req.params.id}, function(err, campaign) {
                if (campaign) {
                    res.json(campaign);
                } else {
                    res.status(404).send("No campaign with id " + req.params.id);
                }
            });
        } else {
            res.status(400).send("Expected id in path");
        }
    });
    
    //To search, POST a mongodb search object.
    app.post('/api/search', function(req, res) {
        if (req.body) {
            campaigns.find(req.body).toArray(function(err, camapigns) {
                if (err) {
                    console.log(err);
                } else {
                    res.json(campaigns);
                }
            });
        } else {
            res.status(400).send("No search criteria.");
        }
    });
    
    //Include HTTP basic auth. Campaign ID is next thing in path.
    app.delete('/api/campaign/:id', function(req, res) {
        authCheck(req, res, users, function(reqUser, storedUser) {
            if (reqCampaign.id) {
                campaigns.findOne({_id:reqCampaign._id}, function(err, storedCampaign) {
                    if (storedCampaign.username === storedUser.username) {
                        //Deleting my own campaign
                        campaigns.delete({_id:reqCampaign._id});
                        res.end();
                    } else {
                        res.status(401).send("Cannot delete campaign owned by another user.");
                    }
                });
            } else {
                res.status(404).send("No campaign with this id.");
            }
        });
    });


    app.listen(8080);
}

/*
$.ajax({
    type: 'POST',
    url: 'http://localhost:8080/user',
    data: '{"username":"bob", "password":"secretbob"}', // or JSON.stringify ({name: 'jonas'}),
    success: function(data) { alert('data: ' + data); },
    contentType: "application/json",
    dataType: 'json'
});
*/
