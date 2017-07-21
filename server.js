/*
 * REST API for rpgworldbuilder spa.
 * Also serves static files.
 *
 * Expects MongoDB connection string in environement variable RPGWORLDBUILDER_DB
 */

var log = require('winston');
log.level = 'debug';

//Require my db access module
require('./store')(function(err, store) {
	if (err) {
		log.error('Error connecting to database ', err);
	} else {
		log.info('Connected to database');
		serveSomeWebs(store);
	}
});

function serveSomeWebs(store) {
    var express = require("express");
    var app = express();

    var bodyParser = require('body-parser')
    app.use(bodyParser.json());

    var basicAuth = require('basic-auth');

    var morgan = require('morgan');
    app.use(morgan('dev'));

    /* Utility function.
     * Calls ifAuth(userObjectFromDatabase) if credentials are good.
     * Sends a status 401 if credentials are bad.
     */
    function authCheck(req, res, ifAuth) {
        var authUser = basicAuth(req);//has name and pass 
        if (authUser && authUser.name && authUser.pass) {
            store.loadUser(authUser.name, function (err, storedUser) {
                if (storedUser && (authUser.pass === storedUser.password)) {
                    ifAuth(storedUser);
                } else {
                    res.status(401).send("Bad username/password");
                }
            });
        } else {
            res.status(401).send("Missing username/password");
        }
    }
        
    //To create a new user, just post {username: --, password: --}
    //Tp update a user, post as above with new password, and include HTTP basic auth with old password.
    app.post('/api/user', function(req, res) {
        var authUser = basicAuth(req);//has name and pass
        var postedUser = req.body;
        if (!postedUser.username || !postedUser.password) {
            res.status(400).send('POSTed incomplete user info.');
            return;
        }
        store.loadUser(postedUser.username, function (err, storedUser) {
            if (!storedUser || ((authUser && storedUser.username === authUser.name) && (storedUser.password === authUser.pass))) {
                store.storeUser(postedUser, function(err) {
                    if (err) {                   
                        res.status(500).json(err);//TODO MAKE BETTER AND SECURE!!!!
                    } else {
                        res.send('{}');
                    }
                });
            } else {
                res.status(401).send("Failed auth while updating user.");
            }
        });
    });
    
    //Include HTTP basic auth.
    app.get('/api/user', function(req, res) {
        authCheck(req, res, function(){
            res.json({message:"User OK"});
        });
    });
    
    //Returns an array of usernames. (Not user objects.)
    app.get('/api/users', function(req, res) {
        store.listUsers(function(err, userNames) {
            if (err) {
                res.status(500).json(err);//TODO: IMPROVE AND SECURE!!!
            } else {
                res.json(userNames);
            }
        });
    });
    
    /*
     * Include HTTP basic auth. Campaign is json body. Create or update. 
     * The campaign must already include a username and a campaignId which is unquire for that username.
     *
     */
    app.post('/api/campaign', function(req, res) {
        authCheck(req, res, function(authUser) {
            var postedCampaign = req.body;
            if (postedCampaign && postedCampaign.username === authUser.username) {
                store.storeCampaign(postedCampaign, function(err, camp) {
                    if (err) {
                        console.log('====================================================');
                        log.error('Error writing campaign', err);
                        res.status(500).json(err);//SECURITY????????
                    } else {
                        res.json(camp);
                    }
                });
            } else {
                res.status(403).send("Failed to authenticate with campaign's username");
            }
        });
    });
    
    app.get('/api/campaign/:username/:id', function(req, res) {
        if (req.params.username && req.params.id) {
            store.loadCampaign(req.params.username, req.params.id, function(err, campaign) {
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
    //Returns only campaignId, title, and username
    app.post('/api/search', function(req, res) {
        if (req.body) {
            store.findCampaignsMetadata(req.body, function(err, campaignsMeta) {
                if (err) {
                    log.error('error from findCampaignsMetadata', err);
                } else {
                    res.json(campaignsMeta);
                }
            });
        } else {
            res.status(400).send("No search criteria.");
        }
    });
    
    //Include HTTP basic auth. Campaign ID is next thing in path. Username is the authorizing user.
    app.delete('/api/campaign/:id', function(req, res) {
        authCheck(req, res, function(authUser) {
            if (req.params.id) {
                store.deleteCampaign(authUser.username, req.params.id, function(err) {
                    if (err) {
                        res.status(500).json(err);//TODO  MAKE BETTER AND SAFER!!!!
                    } else {
                        res.end();
                    }
                });
            } else {
                res.status(400).send("CampaignId required.");
            }
        });
    });


    ////////////////////// Admin ///////////////////////


    /* Utility function.
     * Calls ifAuth(userObjectFromDatabase) if credentials are good.
     * Sends a status 401 if credentials are bad.
     */
    function adminAuthCheck(req, res, ifAuth) {
        var authUser = basicAuth(req);//has name and pass 
        if (authUser && authUser.name && authUser.pass) {
            store.loadAdminUser(authUser.name, function (err, storedAdminUser) {console.log(storedAdminUser);
                if (storedAdminUser && (authUser.pass === storedAdminUser.adminPassword)) {
                    ifAuth(storedAdminUser);
                } else {
                    res.status(401).send("Bad username / password");
                }
            });
        } else {
            res.status(401).send("Missing username/password");
        }
    }

        //Include HTTP basic auth. Campaign ID is next thing in path. Username is the authorizing user.
    app.delete('/api/admin/campaign/:campaignUser/:id', function(req, res) {
        adminAuthCheck(req, res, function(adminUser) {
            if (req.params.campaignUser && req.params.id) {
                store.deleteCampaign(req.params.campaignUser, req.params.id, function(err) {
                    if (err) {
                        res.status(500).json(err);//TODO  MAKE BETTER AND SAFER!!!!
                    } else {
                        res.end();
                    }
                });
            } else {
                res.status(400).send("Owning username and campaignId required.");
            }
        });
    });

    app.delete('/api/admin/user/:userToDelete', function(req, res) {
        adminAuthCheck(req, res, function(adminUser) {
            if (req.params.userToDelete) {
                store.deleteUser(req.params.userToDelete, function(err) {
                    if (err) {
                        res.status(500).json(err);//TODO  MAKE BETTER AND SAFER!!!!
                    } else {
                        res.end();
                    }
                });
            } else {
                res.status(400).send("No username given.");
            }
        });
    });
        

    //Serve the static files
    app.use('/', express.static('public'));
    
    app.listen(80);
}


