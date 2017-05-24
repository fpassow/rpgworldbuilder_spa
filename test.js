require('./store')(function(store) {
    
    store.loadUser('a', function(err, user) {
        console.log();
        console.log("User a err: " + JSON.stringify(err));
        console.log("User a user: " + JSON.stringify(user));
        user.password = user.password + "a";
        store.storeUser(user, function(er) {
            console.log();
            console.log("User a restored err: " + JSON.stringify(er));
        });
    });
    
    store.listUsers(function(err, userArr) {
        console.log();
        console.log("listUsers err: " + JSON.stringify(err));
        console.log("listUsers users: " + JSON.stringify(userArr));
    });
 
 
    //var camp = {username:'a', title:'a new campaign thing'};
    var camp= {username:'a', title:'war and peace'};
    store.storeCampaign(camp, function(err, recamp) {
        console.log();
        console.log("storeCampaign err: " + JSON.stringify(err));
        console.log("storeCampaign recamp: " + JSON.stringify(recamp));
    });

    var camp2= {username:'a', title:'war and peace and zombies', campaignId:'librarycard'};
    store.storeCampaign(camp2, function(err, recamp) {
        console.log();
        console.log("storeCampaign err: " + JSON.stringify(err));
        console.log("storeCampaign recamp: " + JSON.stringify(recamp));
    });
    
    store.findCampaigns({}, function(err, campArr) {
        console.log();
        console.log("findCampaigns err: " + JSON.stringify(err));
        console.log("findCampaigns camps: " + JSON.stringify(campArr));
    });
    
    console.log('hi');
    
});
