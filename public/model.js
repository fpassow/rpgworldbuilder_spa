//DOCUMENT DEF HERE TOO!!!!!

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
	this.anonymousEditing = false; //A new campaign may be created even if the user is not
	                               //logged in. This allows someone to try the tool without
	                               //creating an account. If the user then creates an account
	                               //(or logs in), they take ownership of the campaign they
	                               //had been editing anonymously.

	//userState can be 'notloggedin', 'loggedin', 'changingpw', or 'createnew'.
	// These match it IDs on the 'user-state-' <div>s.
	this.userState = 'notloggedin';
	this.nextFocusId = null; //If set, focus on this element when displaying the standard view
	this.addToCampaignId = null; //Value of [Add to] dropdown
}

