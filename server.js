/*
 * REST API for rpgworldbuilder spa.
 * Also serves static files.
 *
 * Expects MongoDB connection string in environement variable RPGWORLDBUILDER_DB
 */
var def = require('./public/campaign_form_def.json');

var winston = require('winston');
winston.level = 'debug';

var log = new (winston.Logger)({
    transports: [
        new ( winston.transports.Console )({ 
            timestamp: true,
        })
    ]
});

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
    app.use(morgan('common'));

    /* Utility function.
     * Calls ifAuth(userObjectFromDatabase) if credentials are good.
     * Sends a status 401 if credentials are bad.
     */
    function authCheck(req, res, ifAuth) {
        var authUser = basicAuth(req);//has name and pass 
        if (authUser && authUser.name && authUser.pass) {
            store.loadUser(authUser.name, function (err, storedUser) {
                if (storedUser && (authUser.pass === storedUser.password)) {
                    log.info('authCheck passed: ' + authUser.name);
                    ifAuth(storedUser);
                } else {
                    log.info('authCheck failed: ' + authUser.name);
                    res.status(401).send("Bad username/password");
                }
            });
        } else {
            log.info('authCheck missing parameter: ' + authUser.name);
            res.status(401).send("Missing username/password");
        }
    }
        
    //To create a new user, just post {username: --, password: --}
    //Tp update a user, post as above with new password, and include HTTP basic auth with old password.
    app.post('/api/user', function(req, res) {
        var authUser = basicAuth(req);//has name and pass
        var postedUser = req.body;
        if (!postedUser.username || !postedUser.password) {
            log.info('POSTed incomplete user info.')
            res.status(400).send('POSTed incomplete user info.');
            return;
        }
        store.loadUser(postedUser.username, function (err, storedUser) {
            if (!storedUser || ((authUser && storedUser.username === authUser.name) && (storedUser.password === authUser.pass))) {
                store.storeUser(postedUser, function(err) {
                    if (err) {      
                        log.info(JSON.stringify(err));             
                        res.status(500).json(err);//TODO MAKE BETTER AND SECURE!!!!
                    } else {
                        res.send('{}');
                    }
                });
            } else {
                log.info("Failed auth while updating user " + postedUser.username);
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
     * The campaign must already include a username and a campaignId which is unquie for that username.
     *
     */
    app.post('/api/campaign', function(req, res) {
        authCheck(req, res, function(authUser) {
            var postedCampaign = req.body;
            if (postedCampaign && postedCampaign.username === authUser.username) {
                store.storeCampaign(postedCampaign, function(err, camp) {
                    if (err) {
                        log.error('Error writing campaign', err);
                        res.status(500).json(err);//SECURITY????????
                    } else {
                        res.json(camp);
                    }
                });
            } else {
                res.status(403).send("Failed to authenticate with campaign's username ");
                log.info("Failed to authenticate with campaign's username "
                 + postedCampaign.username + " id=" + postedCampaign.id);
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
        log.info("Search for campaigns " + JSON.stringify(req.body));
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

    //GET a campaign as html
    app.get('/html/campaign/:username/:campaignId', function(req, res) {
        store.loadCampaign(req.params.username, req.params.campaignId, function(err, campaign) {
            if (err) {
                res.status(500).json(err);
            } else {
                if (campaign) {
                    res.write('<!DOCTYPE html><html><head><meta charset="utf-8"><title>RPG World Builder: '
                        +escapeHtml(campaign.title)+'</title><style>body{padding:60px;} .print-div{text-align:right;}</style></head><body><div id="content">');
                    res.write('<div class="print-div"><button onclick="window.print()">print</button></div>');
                    res.write('<h1>' + escapeHtml(campaign['title']) + '</h1>');
                    res.write('<div class="campaign-author-credit">By ' + escapeHtml(campaign.username) + '</div>');
                    var field, i;
                    for (i = 1; i < def.fields.length; i++) {
                        res.write('<h2>' + def.fields[i].label + '</h2>');
                        if (def.fields[i].isarrayfield) {
                            var arr = campaign[def.fields[i].name];
                            if (arr && arr.length) {
                                arr.forEach(function(x, index) {
                                    res.write('<div class="campaign-static-view-item"><p>'+escapeHtml(x)+'</p></div>');
                                });
                            }
                        } else {
                            res.write('<div class="campaign-static-view-item">'+escapeHtml(campaign[def.fields[i].name])+'</div>');
                        }
                    }
                    res.write('</div></body></html>');
                    res.end();
                } else {
                    res.status(404).end();
                }
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
                    log.info('adminAuthCheck passed: ' + authUser.name);
                    ifAuth(storedAdminUser);
                } else {
                    log.info('authCheck failed: ' + authUser.name);
                    res.status(401).send("Bad username / password");
                }
            });
        } else {
            log.info('authCheck missing username/password: ' + authUser.name);
            res.status(401).send("Missing username/password");
        }
    }

        //Include HTTP basic auth. Campaign ID is next thing in path. Username is the authorizing user.
    app.delete('/api/admin/campaign/:campaignUser/:id', function(req, res) {
        adminAuthCheck(req, res, function(adminUser) {
            if (req.params.campaignUser && req.params.id) {
                store.deleteCampaign(req.params.campaignUser, req.params.id, function(err) {
                    if (err) {
                        log.info('', err);
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

    app.get('/api/admin/user/:username', function(req, res) {
        adminAuthCheck(req, res, function(adminUser) {
            if (req.params.username) {
                store.loadUser(req.params.username, function(err, userObj) {
                    if (err) {
                        log.info('', err);
                        res.status(500).json(err);//TODO  MAKE BETTER AND SAFER!!!!
                    } else {
                        res.json(userObj);
                    }
                });
            } else {
                res.status(400).send("No username given.");
            }
        });
    });

    app.delete('/api/admin/user/:userToDelete', function(req, res) {
        adminAuthCheck(req, res, function(adminUser) {
            if (req.params.userToDelete) {
                store.deleteUser(req.params.userToDelete, function(err) {
                    if (err) {
                        log.error(JSON.stringify(err));
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

    //Update any user. POST the new object. No username in path
    app.post('/api/admin/user', function(req, res) {
        adminAuthCheck(req, res, function(adminUser) {
            var postedUser = req.body;
            log.info('Posted user ' + postedUser.username);
            if (postedUser) {
                store.storeUser(postedUser, function(err) {
                    if (err) {  
                        log.error(JSON.stringify(err));                 
                        res.status(500).json(err);//TODO MAKE BETTER AND SECURE!!!!
                    } else {
                        res.end();
                    }
                });
            } else {
                log.info('No user object in body');
                res.status(400).send("No user object in body.");
            }
        });
    });
    
    //Serve the static files
    app.use('/', express.static('public'));
    
    var port = process.env.PORT || 80;
    app.listen(80);
}


function escapeHtml(unsafe) {
    if (!unsafe) {
        return "";
    }
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
 }
