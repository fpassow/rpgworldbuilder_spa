//$(document).ready(function(){

function createUser(username, password) {
    var data = JSON.stringify({username: username, password:password});
    console.log("Posting: " + data);
    $.ajax({
        type: 'POST',
        url: 'http://localhost:8080/api/user',
        data: data,
        success: function(data) { console.log('data: ' + data); },
        error:function(x,y,z) {console.log("Err:" + JSON.stringify(x) + " " + JSON.stringify(y) + " " + JSON.stringify(z));},
        contentType: "application/json",
        dataType: 'json'
    });
}

function checkUser(username, password) {
  $.ajax({
        type: 'GET',
        url: 'http://localhost:8080/api/user',
        success: function(data) {console.log(JSON.stringify(data));},
        error:function(x,y,z) {console.log("Err:" + JSON.stringify(x) + " " + JSON.stringify(y) + " " + JSON.stringify(z));},
        contentType: "application/json",
        dataType: 'json',
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Authorization', 'Basic ' + btoa(username + ':' + password));  
        }
    });
}

function createCampaign(username, password, campaign) {
    var data = JSON.stringify(oldCampaignData);
     $.ajax({
        type: 'POST',
        url: 'http://localhost:8080/api/campaign',
        data:data,
        success: function(sdata) {console.log("yay");},
        error:function(x,y,z) {console.log("Err:" + JSON.stringify(x) + " " + JSON.stringify(y) + " " + JSON.stringify(z));},
        contentType: "application/json",
        dataType: 'json',
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Authorization', 'Basic ' + btoa(username + ':' + password));  
        }
    });
    console.log(data);
}


/////////////////////////////////////////////////////

var oldCampaignData = {
    "title":"Classic Dungeon",
    "seed_text":"Green blob in side tunnel, rotten chest beyond",
    "mood":"Grim, tactical, ironic",
    "visual_style":"Classic fantasy book cover",
    "images":["Green blob, and chest behind","Hiding an ox cart. How far away?","So whatcha got this time?","Crap, furniture"],
    "action":["Explore and map, tunnel by tunnel","Catch it, it's teeth are worth money!"],
    "driver":["Treasure hunt. Duh.","Power and resources and cash","Personal missions to become rich and retired, or landed gentry, or a mercenary captain, or a wizard with all the power money can buy"],
    "toy":["Potions","Spells","Magic arms and armor","Magic gizmos","Reusable castles"],
    "place":["Borderland after the great war","Towns","The big city","Dungeons dungeons dungeons","On the road"],
    "group":["Who to trust with the loot","Nobles paying to have a backyard castle cleared","The High King","The orcs who lost"],
    "person":["High King","Banker","Biggest Wizard"],
    "pcs_are":"Lowborn opportunists or disreputable second sons. Back from the war.",
    "adventure":["Classic dungeon assault","Theft from a group too big to slaughter","Hunt for treasure lost in the war","Gauntlet after grabbing a big group's shiney thing"],
    "character_class":["Vet","Rogue","Peasant","Woodsman","Thief","Wizard","Battle Medic"],
    "players_intro":"Great war. Evil pushed back. Proffic learing what's left.",
    "pc_creation_notes":"Goal for the $$",
    "first_adventure":["Meet poor and down and out. Make the big plans and pact. Pick first target. Do it. Surprise. Escape.","Furniture","Grab and gauntlet (for patron)"]
    };

  /*
  $.getJSON('campaign_form_def.json', function(def) {
        var t = new RwbWidget("rwb-widget", def, data, function(thingsData) {
             console.log(JSON.stringify(thingsData));
        });
  });
*/

//});
