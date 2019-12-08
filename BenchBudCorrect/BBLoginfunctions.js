function deg2rad(deg) {
	return deg * (Math.PI/180)
	};
				
function calcDistances(Lat1,Lon1,Lat2,Lon2) {
	var R = 6371000;
	dLat = deg2rad(Lat2 - Lat1);
	dLon = deg2rad(Lon2 - Lon1); 
	var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(deg2rad(Lat1)) * Math.cos(deg2rad(Lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2);
 	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
	var d = R * c;
	return d;
	}


function calculateDistance(){
	console.log("Calculating User Distance"); 
	userID = 2;
	console.log("Sending Requst To Server to Calculate Distance");
	$.ajax({
		type: "GET",
		url: "/calcDist",
		dataType: "json",
		success: function(info) {
			console.log("Successfully retrieved gym location");
			gymLat = info.lat;
			gymLon = info.lon;
			console.log(navigator.geolocation)
			if(navigator.geolocation){
				navigator.geolocation.getCurrentPosition(function(pos){
				var curLat = pos.coords.latitude;
				var curLon = pos.coords.longitude; 
				console.log("gym Lat and Lon =" + String(gymLat) + "," + String(gymLon));
				console.log("current Lat and Lon ="  + String(curLat) + "," + String(curLon));
				dist = calcDistances(gymLat,gymLon,curLat,curLon);
				console.log(dist);
				if(dist <= 150) {
					console.log("Starting one hour timer");
					document.getElementById("clockIn").style.visibility = "hidden";
					document.getElementById("locCheck").innerHTML = "Starting one hour timer";
					setTimeout(function(){
						document.getElementById("clockIn").style.visibility = "visible";
						var endLat = pos.coords.latitude;
						var endLon = pos.coords.longitude;
						endDist = calcDistances(gymLat,gymLon,endLat,endLon);
						console.log("End Lat and Lon ="  + String(endLat) + "," + String(endLon));
						if(endDist <= 150) {
							addPoint(userID);
							};
						     },
						3600 * 1000);
					}
				else {
					console.log("You can't clock in when you are not at the gym");
					document.getElementById("locCheck").innerHTML = "You can't clock in when you are not at the gym";				
				}
			   })
			}
		}
	})
}

function addPoint(userID) {
	console.log("addPoint Triggered");
	var Url = "http://localhost:8080/addPoint?userID=" + String(userID);
	console.log("Sending Request To Server to Check Points");
	$.ajax({
		type: "GET",
		url: Url,
		dataType: "html",
		success: function(info) {
			console.log("New points Added");
		}
	})
}

