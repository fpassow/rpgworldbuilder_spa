

/*
 * 
 */
function Model(campaignList, def) {
	this.def = def;
	this.campaignList = campaignList; //An array of campaignMetadata's
	this.campaign = null
	this.user = {username:null, password:null, loggedIn:false}
	this.userMessage = null;
	this.campaignMessage = null;
	this.creatingUser = false;
	this.changingPassword = false;

	//userState can be 'notloggedin', 'loggedin', 'changingpw', or 'createnew'.
	// These match it IDs on the 'user-state-' <div>s.
	this.userState = 'notloggedin';
}
