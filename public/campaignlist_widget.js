/*
 * selector    jQuery selector for the container to put this widget into
 * selected    Callback called with campaign metadata object (campaignId, title, username)
 *                when a campaign is selected for editing
 *
 * redraw()    method causes a it to redraw from the database. 
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
    
    this.redraw = function() {
        findCampaignsMetadata({}, function(err, camps) {
            if (err) {
                alert('Error loading campaign list: ' + JSON.stringify(err));
            } else {
                camps.forEach(function(aCamp) {
                    var campy = $('<div class="camps-camp"><span class="camps-username">'
                    + aCamp.username + '</span><span class="camps-title">'
                    + aCamp.title + '</span> </div>');
                    campy.on('click',function() {thisWidget.selected(aCamp);});
                    parent.append(campy);
                });
            }   
        });
    }
    
    this.redraw();
}
  