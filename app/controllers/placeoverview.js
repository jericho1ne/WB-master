//=================================================================================
//		Name:				attachMiniHeader(place_ID)
//		Purpose:		replace full size header w/ smaller version upon downward scroll
//=================================================================================
function attachMiniHeader () {
  var a = Ti.UI.createAnimation({
    top: 0, opacity: 1, duration : 320
  });
  $.miniHeader.animate(a);
}

function hideMiniHeader () {
  var a = Ti.UI.createAnimation({
    top: -60, opacity: 0, duration : 220
  });
  $.miniHeader.animate(a);
}

//================================================================================
//		Name:				getPlaceInfo(place_ID)
//		Purpose:		get place header info (name, address, bg image, etc)
//================================================================================
function getPlaceInfo(place_ID) {
	Ti.API.log("* getPlaceInfo() called *" + place_ID);
	var query = Ti.Network.createHTTPClient();
	var params = {
		place_ID  : place_ID,
		lat				: sessionVars.lat,
		lon				:	sessionVars.lon
	};
	
	query.open("POST", "http://waterbowl.net/mobile/place-info.php");	
	query.send( params );
	query.onload = function() {
		var jsonResponse = this.responseText;
		Ti.API.log( " * Place JSON: " + jsonResponse );
		if (jsonResponse != "" && jsonResponse !="[]") {
			var placeJson = JSON.parse( jsonResponse );
			// var header_image = zeroPad( sessionVars.currentPlace.ID, 4 ) . "-000001-placename.jpg";
			$.place_name_label.text 	= placeJson['name'];			// add place name header
			$.place_address_label.text=	placeJson['street_address'];		// address, city, zip
			$.place_city_label.text	  =	placeJson['city'] +' ' + placeJson['zipcode'];
			$.place_dist_label.text 	= placeJson['distance'] + " miles away";   // TODO: send in distance in miles from backend
			 
			/*  fill in mini header info */
			$.miniHeaderPlaceName.text = placeJson['name'];	
			
			/*  only attempt to set the bg image if it exists */
			if ( placeJson['mobile_bg'] != "") {
				$.headerContainer.backgroundImage = "images/places/" + placeJson['mobile_bg'];		// add place header image
			}
			/*  if viewing place details on a place we're currently, show the checkboxx!!   */
			if ( place_ID == sessionVars.checkin_place_ID && sessionVars.checkedIn == true ) {
				$.checkboxHeader.image = "images/icons/checkbox.png";
				$.checkboxMiniHeader.image = "images/icons/checkbox.png";
				// TODO: add checkout fucntionality to checkbox button!
				//$.checkin_button.opacity = 1;
				
				/*
				$.checkin_button.addEventListener( "touchstart", touchStartClick );				// assign the touch start & end functions
				$.checkin_button.addEventListener( "touchend", touchEndClick );
				$.checkin_button.addEventListener( "touchcancel", touchEndClick );
				*/
				//checkin_button.text = '';				
			}
		}	
	};
}
//================================================================================
//		Name:				getPlaceActivity(place_ID)
//		Purpose:		get latest checkins
//================================================================================
function getPlaceActivity(place_ID) {
	Ti.API.log("* getPlaceActivity() called *");
	var query = Ti.Network.createHTTPClient();
	var params = {
		place_ID	: place_ID
	};
	
	query.open("POST", "http://waterbowl.net/mobile/place-activity.php");	
	query.send( params );
	query.onload = function() {
		var jsonResponse = this.responseText;
		var activityData = new Array();												// create empty object container
		
		/*			CREATE BLANK TEMPLATE FOR LATEST FEED ITEM 				*/
		var dog_name_label 			= Ti.UI.createLabel({text: "None so far ...", top: 0});
		$.addClass( dog_name_label, "feed_label_left_md");
		
		var time_elapsed_label 	= Ti.UI.createLabel({text: "Be the first!", top: 0});
		$.addClass( time_elapsed_label, "feed_label_left");
		
		var dogs_amount_label = Ti.UI.createLabel({text: "...", top: 4});
		$.addClass( dogs_amount_label, "feed_label_center_lg");
					
		if (jsonResponse != "" && jsonResponse !="[]") {
			var activityJson = JSON.parse( jsonResponse );
				
			/*					POPULATE LATEST FEED ITEM 					*/
			//var base_profile_url = "http://waterbowl.net/app-dev/stable/images/profile/";
			var last_update_photo = sessionVars.AWS.base_profile_url + activityJson[0].dog_photo;
			Ti.API.log( "latest update photo: " + last_update_photo  );
			 
			$.last_update_thumb.image = last_update_photo;		// TODO: change storage location	
			dog_name_label.text 			= activityJson[0].dog_name;				// dog that provided most recent update
			time_elapsed_label.text 	= activityJson[0].time_elapsed;				// dog that provided most recent update
			dogs_amount_label.text 		= activityJson[0].amount;				// dog that provided most recent update
			
			var dogs_amount_suffix = Ti.UI.createLabel({text: "dogs here", top: -1});
			$.addClass( dogs_amount_suffix, "feed_label_center");
			
			$.last_update_middle.add ( dog_name_label );				// add most recent update info to middle and right views
			$.last_update_middle.add ( time_elapsed_label );
			$.last_update_right.add ( dogs_amount_label );
			$.last_update_right.add ( dogs_amount_suffix );
			
			activityJson.sort(function(a,b) {			// 		sort updates based on datetime posted
			  return b.rank - a.rank;
			});
			
			var max = 10;		// activityJson.length;
			
			/* ensure that there is more than 1 recent checkin */
			if( activityJson.length > 1) {
				for (var i=1; i<max; i++) {		// optimize loop to only calculate array size once
					// Ti.API.log("* "+ activityJson[i].dog_name + " - " + activityJson[i].last_update_formatted +" *");
					// var icon = 'images/missing/dog-icon-sm.png';
				
					///////////// CREATE INDIVIDUAL FEED ITEM  ////////////////////////////////////
					var feed_item_view =  Ti.UI.createView();
					$.addClass( feed_item_view, "feed_item");
					
					///////////// MIDDLE VIEW OF STUFF ////////////////////////////////////////////
					var middle_view = Ti.UI.createView ();
					$.addClass( middle_view, "middle_view");
					
					var thumb = Ti.UI.createImageView ();
					$.addClass( thumb, "thumbnail_sm");
					thumb.image = sessionVars.AWS.base_profile_url + activityJson[i].dog_photo;		// TODO: change storage location	
					
					var status_update_label = Ti.UI.createLabel({text: "...", top: 4});
					$.addClass( status_update_label, "feed_label_left");
					
					var dog_name_label = Ti.UI.createLabel({text: "..."});
					$.addClass( dog_name_label, "feed_label_left");
					
					status_update_label.text = activityJson[i].dog_name + " checked in";			// TODO: grab other status updates instead
					dog_name_label.text 			= activityJson[i].dog_name + " saw " + activityJson[i].amount + " dogs 	";
					
					middle_view.add(status_update_label);
					middle_view.add(dog_name_label);
					
					///////// RIGHT VIEW OF STUFF ///////////////////////////
					var right_view = Ti.UI.createView();
					var time_elapsed_label = Titanium.UI.createLabel({text: "..."});
					time_elapsed_label.text = activityJson[i].time_elapsed;
					
					$.addClass( right_view, "right_view");
					$.addClass( time_elapsed_label, "feed_label_right");
					
					right_view.add( time_elapsed_label );
					///////// BUILD FEED ITEM  ///////////////////////////////////
					feed_item_view.add( thumb );
					feed_item_view.add( middle_view );
					feed_item_view.add( right_view );
					
					///////// ADD ITEM TO FEED CONTAINER ////////////////////////
					$.feedContainer.add( feed_item_view );		
				}
			}
			//$.feedList.data = activityData;				// populate placeList TableView (defined in XML file, styled in TSS)
		}
		else {
			$.latest_update_static.text = "";
			$.last_update_middle.add ( dog_name_label );	
			$.last_update_middle.add ( time_elapsed_label );
			Ti.API.log(" * no checkins here... * ");
		}
				
	};
}



//============================================================================
//		Name:			touchStartClick(e)
//		Purpose:		what to do upon checkin button long press
//							- creates a 350ms interval that fires click events
//================================================================================
function touchStartClick(e) {
  if ( !e.source.touchTimer ) {	
      e.source.touchTimer = setInterval(function () {
        e.source.fireEvent("click");
        longPress = 1;
        this.backgroundColor = "#ff38d9";
        this.opacity = "1";
        this.title = "Update";
        Ti.API.log("***** Long Press Start "+ longPress +"*****");
    }, 350);
  }
}

//============================================================================
//		Name:			touchStartClick(e)
//		Purpose:		what to do upon checkin button long press
//							- what do to at the end of the touchStart;  cancels the interval
//================================================================================
function touchEndClick(e) {
  if ( e.source.touchTimer ) {
    clearInterval(e.source.touchTimer);
    if (longPress == 1) {
  		longPress = 0;
  		this.backgroundColor = "#16dd0c";
  		this.opacity = "0.88";
  		//this.title = "|/";
  		Ti.API.log("***** Long Press End *****");
    }
    e.source.touchTimer = null;
  }
}
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//
//			LOGIC FLOW
//
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
var mini_header_display = 0;

//-----------------------------------------------------------------------------
//
//		(1)		Grab incoming variables, set header image and title
//
//-----------------------------------------------------------------------------
var args 	= arguments[0] || {};
Ti.API.log("* placeoverview.js { #" + args._place_ID  + " } * ");	
sessionVars.currentWindow = "placeoverview";									// set current place session variable

//----------------------------------------------------------------------------
//
//		(2)		Populate place header + activity feed
//
//----------------------------------------------------------------------------
getPlaceInfo( args._place_ID );
getPlaceActivity( args._place_ID );

//----------------------------------------------------------------------------
//
//		(3)		Button listeners
//
//----------------------------------------------------------------------------
$.backBtn.addEventListener('click', function() {			//  BACK button (aka window close)
	$.placeoverview.close( { 
		top: 0, opacity: 0.01, duration: 200, 
		curve : Titanium.UI.ANIMATION_CURVE_EASE_IN_OUT
	} );
	/* $.placeoverview.close( { 
		top: 800,	opacity: 0.2,
		duration: 320, curve : Titanium.UI.ANIMATION_CURVE_EASE_IN_OUT
	} ); */
	$.placeoverview = null;
});

/*
$.refreshBtn.addEventListener('click', function() {			//  BACK button (aka window close)
	Ti.API.log( "* Should be refreshing the feed... *" 	);
	// TODO:  refresh / replace feed if newer posts exist
});
*/
$.infoBtn.addEventListener('click', function() {			//  BACK button (aka window close)
	Ti.API.log( "* Info button clicked *" 	);
	// TODO:  ask Herb what info does
});

///----------------------------------------------------------------------------
//
//		(4)		Add scrollView listener (and attach sticky mini-header bar)
//
//----------------------------------------------------------------------------
$.scrollView.addEventListener('scroll', function(e) {
  if (e.y!=null) {
    var offsetY = e.y;
   
    if  ( offsetY >= 230 && offsetY != null && mini_header_display==0 ) {
    	miniHeader = attachMiniHeader();			// show the mini header
    	
    	//$.placeoverview.add( miniHeader );
    	
 			Titanium.API.info(' * scrollView Y offset: ' + offsetY);
 			mini_header_display = 1;
 			Titanium.API.info( ' * miniHeader attached * ' +  mini_header_display );
    }
    else if ( offsetY < 230 && offsetY != null && mini_header_display==1) {
    	Ti.API.log (" MINIHEADER CONTENTS: "+ miniHeader);
    	miniHeader = hideMiniHeader();			// hide the mini header
     	
    	Titanium.API.info(' * scrollView Y offset: ' + offsetY);
   		mini_header_display = 0;
 			Titanium.API.info( ' * miniHeader removed * ' + mini_header_display );
 		}
    	
  } else {
    Titanium.API.info(' * scrollView Y offset is null');
  }
});


