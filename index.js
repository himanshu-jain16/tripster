var googleMapsClient = require('@google/maps').createClient({
  key: process.env.google_api_key
});
var request = require('request');
var mongoose = require('mongoose');
var vote_table = require('models/vote_table');

exports.findPlaces = (event, context, callback) => {
	if(event.currentIntent.name == "GetTripSuggestions"){
		console.log("finding options");
		findOptions(event, context, callback);
	}
	else if(event.currentIntent.name == "voteForSuggestion"){
		console.log("voting");
		voteForOption(event, context, callback);	
	}
	
}

function sendLexResponse(callback, err, success){
	mongoose.connection.close();
	var res;
	if(err == null){
		res = {
			"dialogAction":{
				"type": "Close",
				"fulfillmentState": "Fulfilled"
			}
		};
		if(success != null){
			res["dialogAction"]["message"] = {
				"contentType": "PlainText",
		        "content": success
			}
		}
	callback(null, res);
	}
	else{
		res = {
			"dialogAction":{
				"type": "Close",
				"fulfillmentState": "Failed",
				"message": {
			      "contentType": "PlainText",
			      "content": err
			    }
			}
		};
	callback(res);
	}
}

function findOptions(event, context, callback){
	var trip_query = event.currentIntent.slots.Activity + " in " + event.currentIntent.slots.Location;
	googleMapsClient.places({
		query: trip_query
	}, function(err, response){
		if(!err){
			var google_results = response.json.results;
		    var options = {url: process.env.slack_channel_hook, method:'POST', headers: {'content-type':'application/json'}, body:createSlackMsg(google_results)};
			request(options, function(err, slackresponse, body){
                if(err){console.log(err);sendLexResponse(callback, "Unable to send msg to slack channel", null);}
                else{
                	//console.log(google_results); 
                	//console.log(slackresponse);
                	saveOptions(google_results, callback, context);             	
                }
			});
		}
		if (err) {
			console.log(err);
			sendLexResponse(callback,"Bot is having trouble interacting with Google Maps API", null);
        }
	}); 
}

function createPollResultMsg(callback){
	var msg;
	mongoose.connect(process.env.mlab_url);
	vote_table.findOne({}).sort('-votes').exec(function(err, result){
		msg = {
		    "text": "Hurray..!! The group has decided to go to: ",
		    "attachments": [
		        {
		        	"color": "#36a64f",
		            "title": result.optionName
		        }
		    ]
		}
		msg = JSON.stringify(msg);
		var options = {url: process.env.slack_channel_hook, method:'POST', headers: {'content-type':'application/json'}, body:msg};
		request(options, function(err, slackresponse, body){vote_table.remove({}).exec();sendLexResponse(callback, null, "Have a good day :D");});
	
	});
}

function sendPollResults(callback, context){
	context.callbackWaitsForEmptyEventLoop = false;
	setTimeout(function(){
		console.log("posting poll result");
		createPollResultMsg(callback);
	}, 180000);

}

function voteForOption(event, context, callback){
	var voted_option = event.currentIntent.slots.option;
	mongoose.connect(process.env.mlab_url);
	vote_table.findOneAndUpdate({ optionId: Number(voted_option) }, { $inc: { votes: 1 }})
	  .exec(function(err, db_res) { 
	    if (err) { 
	      console.log(err); 
		  var success_vote = JSON.stringify({"text": "Bot is having trouble casting your vote"});
		  var options = {url: process.env.slack_channel_hook, method:'POST', headers: {'content-type':'application/json'}, body:success_vote};
	      request(options, function(err, slackresponse, body){});
	    } 
	    else { 
		    console.log("successfull vote");
		    var success_vote = JSON.stringify({"text": "Your vote has been casted. Results will be out soon"});
		    var options = {url: process.env.slack_channel_hook, method:'POST', headers: {'content-type':'application/json'}, body:success_vote};
		    request(options, function(err, slackresponse, body){});
	    } 
	  });
}

function saveOptions(googleResponse, callback, context){
	console.log("saving options");
	var optionsObj = [];
	mongoose.connect(process.env.mlab_url);
	googleResponse.forEach(function(entry,index){
		var temp = {
			optionId: index+1,
			optionName: entry.name
		};
		optionsObj.push(temp);
	});
	vote_table.insertMany(optionsObj, function(err, docs){
		if(err){
			console.log("insert many error");console.log(err.message);
			sendLexResponse(callback, "Bot is having trouble saving your results to DB", null);
		}
		else{
			sendPollResults(callback, context);
		}
	});

}
function createSlackMsg(oldmsg){
	if(oldmsg.length>9){oldmsg = oldmsg.splice(0,10);}
	var slackmsg = {
		"text": "You have 3 minutes to select a place you like. Please vote to select a place!",
		"attachments": []
			}
	oldmsg.forEach(function(element, index){
		photo_url = "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference="+element.photos[0].photo_reference+"&key="+process.env.google_api_key;
		tempobj = {
			"title": (index+1) +". " + element.name,
			"title_link": "https://www.google.com/maps/place/?q=place_id:"+ element.place_id,
			"text": element.formatted_address,
			"fields": [{
				"title": "Customer Rating",
				"value": element.rating
				}],
            "thumb_url":photo_url,
            "callback_id":element.name
			};
		slackmsg.attachments.push(tempobj);

		
	}); 
	var vote_cmd = {"title": "To vote for an option, type 'Vote for option 1'"}
	slackmsg.attachments.push(vote_cmd);    
	console.log(JSON.stringify(slackmsg));
	return JSON.stringify(slackmsg);
}