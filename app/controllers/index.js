//================================================================================
//	Name: 		goToLogin
//	Purpose: 	determine whether user is already logged in
//================================================================================
function goToLogin() {
	Ti.API.log("* Login clicked *");				
	if(Titanium.Network.networkType==Titanium.Network.NETWORK_NONE) {
		createSimpleDialog('Uh oh', 'No network connection detected');
	}	else {
		email.blur();				// temporarily blur the login fields while awaiting response
		password.blur();
				
		if (email.value != '' && password.value != '') {
			wbLogin(email.value, password.value);
		} 
		else {
			createSimpleDialog('Login Error', 'Please fill in both fields.');	
			email.focus();
			password.focus();
		}  
	}  
}

//================================================================================
//	Name: wbLogin
//	Purpose: check credentials against backend
//================================================================================
function wbLogin(email, password) {
	//alert(email+"/"+password);
	// >> XHR REQUEST
	var loginRequest = Ti.Network.createHTTPClient( {
		// SUCCESS:  On data load
		onload: function(e) {
			var response = JSON.parse(this.responseText);	
			// Ti.API.debug(this.responseText);
			// TODO:  should probably put this into a separate function
			if (response.status == 1) {
				var dog_ID = response.dog.dog_ID;
				
				
				// save credentials locally in mySesh global arrays
				mySesh.user.email 	 = email;
				Ti.App.Properties.setString('user', email);
				Ti.App.Properties.setString('pass', password);
				mySesh.user.owner_ID = response.human.owner_ID;
				mySesh.user.name 		 = response.human.owner_name;
	
				// USER HAS VALID ACCOUNT BUT NO DOG PROFILE	//////////////////////////////////////////////////////
				if(dog_ID=="" || dog_ID==null) {
					var modal_title = "Please complete your Dog's profile before proceeding"; 
					var optns = {
						options : ['OK'],
						selectedIndex : 0,
						title : modal_title
					};
					var gotoRegPage2 = Ti.UI.createOptionDialog(optns);
					gotoRegPage2.show();
					gotoRegPage2.addEventListener('click', function(e_dialog) {
						if (e_dialog.index == 0) {  // user clicked OK
					    closeWindowController();
							createWindowController("register2","","slide_left");
						} else {
						    // TODO: figure out if cancel case is necessary
						 } 
					});
				}
				// USER HAS VALID ACCOUNT + VALID DOG PROFILE  //////////////////////////////////////////////////////
				else {
					mySesh.dog.dog_ID  	 = response.dog.dog_ID;
					mySesh.dog.sex			 = response.dog.sex;
					mySesh.dog.breed		 = response.dog.breed;
					mySesh.dog.age				=	response.dog.age;
					mySesh.dog.birthdate 	=	response.dog.birthdate;
					mySesh.dog.weight			= response.dog.weight;
					mySesh.dog.marks_made = parseInt(response.dog.marks_made);
					
					// GRAB ALL DOG RELATE INFO
					mySesh.dog.current_place_ID        = response.dog.current_place_ID;
					if (response.place!=null) {
					  mySesh.dog.current_place_name    = response.place.name;
					  mySesh.dog.current_place_lat     = response.place.lat;
					  mySesh.dog.current_place_lon     = response.place.lon;
					  mySesh.dog.current_place_geofence_radius = response.place.geofence_radius;
	        }
					mySesh.dog.last_checkin_timestamp  = response.dog.last_checkin_timestamp;
					mySesh.dog.name	 	= response.dog.dog_name;
				
					// TAKE USER TO MAP
					createWindowController( "mapview", "", "slide_left" ); 	
				}
			} else {
				// pass on error message from backend 
				createSimpleDialog('Login Error', response.message);
			}
		},
		//  ERROR:  No data received from XHRequest
		onerror: function(e) {
			Ti.API.debug(e.error);
			createSimpleDialog('Error', e.error);
		},
		timeout: 4000 /* in milliseconds */
	} );
	// << XHR REQUEST
	loginRequest.open("POST", SERVER_URL+"login.php");
	var params = {
		email : email,
		pass  : password
	};
	loginRequest.send(params);
	Ti.API.debug ( "SENDING >> "+JSON.stringify(params) );
}

//================================================================================
//	Name: 	goToRegister(e)
//	Purpose:  bounce user to Registration page
//================================================================================
function goToRegister (e) {
	Ti.API.log("* Register clicked * ");
 	createWindowController("register", "", "slide_left"); 
}

//======================== Create and Open top level UI components ==================================== 
$.index.open();	
addToAppWindowStack( $.index, "index" );


$.index.backgroundImage = 'images/waterbowl-splash-screen.jpg';

// DIV HEIGHTS
var footer_height = 80;
var content_height = mySesh.device.screenheight - footer_height;
var topView_height = .35 * content_height;
var midView_height = .65 * content_height;
var form_width = mySesh.device.screenwidth - myUiFactory._pad_right - myUiFactory._pad_left;

// Check if the device is running iOS 8 or later, before registering for local notifications
	/*if (Ti.Platform.name == "iPhone OS" && parseInt(Ti.Platform.version.split(".")[0]) >= 8) { 
	 // TODO:  turn this on if we use push notifications
	  Ti.App.iOS.registerUserNotificationSettings({
	    types: [
	          Ti.App.iOS.USER_NOTIFICATION_TYPE_ALERT,
	          Ti.App.iOS.USER_NOTIFICATION_TYPE_SOUND,
	          Ti.App.iOS.UESR_NOTIFICATION_TYPE_BADGE
	      ]
	  }); 
	  // Ti.API.debug( " > > > IOS 8 or greater *" );
	}
	else {
		//Ti.API.debug( " > > > IOS 7 or older *" );
	} */
//Titanium.API.debug ('.... [~] Available memory: ' + Titanium.Platform.availableMemory);	

// FIRST THINGS FIRST - IF CREDS ARE SAVED, AUTOLOGIN!
var saved_user = Ti.App.Properties.getString('user');
var saved_pwd  = Ti.App.Properties.getString('pass');

//if (saved_user=="" || saved_pwd=="") {
	// Build 3 vertically stacked View Containers
	var topView = myUiFactory.buildViewContainer ( "topView", "", 				"100%", topView_height, 0 );
	var midView = myUiFactory.buildViewContainer ( "midView", "vertical", "100%", midView_height, 0 );
	var botView = myUiFactory.buildViewContainer ( "botView", "", 				"100%", Ti.UI.FILL, 0 );
	
	// 																		title, 			 w, 		 h,  font_style, 					    color 			text_align
	var titlebar = myUiFactory.buildLabel("waterbowl", form_width, 60, myUiFactory._text_banner, "#ffffff", "center");
	//                                         id,       width,  hint,       is_pwd
	var email    = myUiFactory.buildTextField("email",   form_width,  "email",    "");
	var password = myUiFactory.buildTextField("password", form_width, "password", true);
	
	var loginBtn = myUiFactory.buildButton("loginBtn", "login", "xl");
	loginBtn.addEventListener('click', function(){ goToLogin(); });
	
	var regBtn = myUiFactory.buildButton("regBtn", "register", "xl");
	regBtn.addEventListener('click', function(){ goToRegister(); });
	
	var footer = Ti.UI.createImageView({ 
		//height				: icon_size,
		//width				  : icon_size,
		image						: 'images/WB-FooterBar.png',
		backgroundColor : '',  //myUiFactory._color_dkblue,
		bottom					: 0
	});

	// add UI elements to containers		
	//topView.add( myUiFactory.buildSpacer("horz", 0.35*topView_height) ); 
	topView.add(titlebar);
	midView.add(email);
	midView.add(password);
	midView.add( myUiFactory.buildSpacer("horz", 4) );
	midView.add(loginBtn);
	midView.add(regBtn);
	botView.add(footer);

	// add containers to parent view
	$.content.add(topView);
	$.content.add(midView);
	$.content.add(botView);
	
	// if credentials are already saved in mySesh
	if( saved_user!="" ) {
		email.value = saved_user;
	}
	if( saved_pwd!="" ) {
		password.value = saved_pwd;
	}	
//} else {  // AUTOLOGIN IF CREDENTIALS ARE SAVED
//	wbLogin(saved_user, saved_pwd);
//}


/*  	LOGIN HACK - skip past login screen and go to Map 	*/
// Ti.App.Properties.setString('user', '');
// Ti.App.Properties.setString('pass', '');
// setTimeout ( function() { loginBtn.fireEvent('click'); }, 300 );  // wait for login fields to populate

//   To skip to a specific window, uncomment block below and change which window name to jump to
/* 
var necessary_args = {  _place_ID    : 601000001, };
createWindowController("provideestimate",necessary_args,"slide_left");
*/

createWindowController("register3","","slide_left");
