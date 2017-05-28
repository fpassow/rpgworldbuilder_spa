/*
 * selector    jQuery selector for the container to put this widget into
 * selected    Callback called when a campaign is selected for editing
 *
 * Creating and clonging is handled internally, 
 *   and then a selected event is fired for the new campaign.
 */

function CampaignListWidget(selector, selected) {
    var parent = $("#" + selector);
    parent.append('<h2>Campaigns</h2>');
    this.selected = selected || function(camp) {};
    this.campaigns = [];
    var thisWidget = this;
    findCampaignsMetadata({}, function(err, camps) {
        if (err) {
            alert('Error loading campaign list: ' + JSON.stringify(err));
        } else {
            for (var i = 0; i < camps.length; i++) {
                parent.append('<div class="camps-camp"><span class="camps-title">' + camps[i].title + '</span> <span class="camps-username">' + camps[i].username + '</span></div>');
            }
        }   
    });
}
  