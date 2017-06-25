

/*
 * 
 */
function Model(campaignList, def) {
	this.campaignList = campaignList; //An array of campaignMetadata's
	this.campaign = null
	this.user = {username:null, password:null, loggedIn:false}
	this.userMessage = null;
	this.campaignMessage = null;
	this.changingPassword = false;
	this.creatingUser = false;
	this.def = def;
}
