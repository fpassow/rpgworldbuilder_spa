

/*
 * Includes data shared with the back end AND state of the UI.
 */
function Model(campaignList, def) {
	this.def = def;
	this.campaignList = campaignList; //An array of campaignMetadata's
	this.campaign = null //Will have username, campaignId, and one property named after each fieldname.
	this.user = {username:null, password:null, loggedIn:false}
	this.userMessage = null;
	this.campaignMessage = null;
	this.creatingUser = false;
	this.changingPassword = false;

	//userState can be 'notloggedin', 'loggedin', 'changingpw', or 'createnew'.
	// These match it IDs on the 'user-state-' <div>s.
	this.userState = 'notloggedin';
}
