$( function() {
	$(".flex-container").sortable();
	$(".flex-item").disableSelection();
});

/**
 * Updating the information of the annotation on the source sentence
 * @param {DOM} 	target, 	DOM element denoting the target sentence of a dependency relation
 * @param {DOM} 	relation, 	DOM element denoting the relation label of a dependency relation
 * @param {DOM} 	dropping, 	DOM element denoting whether the sentence should be dropped or kept
 * @param {number} 	sentenceID, the source sentence ID
 * @param {number}	textLength
 * @return{boolean}	false, 		to prevent refresh 
*/
function updateSentenceAnnotation(target, relation, dropping, sentenceID, textLength) {

	// Validate the parameters combination
	output = droppingOrRelation(dropping.value, sentenceID, target.value, relation.value, textLength);
	var flag = output[0];
	var message = output[1];
	if (!flag) { // unallowed parameters combination
		alert(message);
	}
	else { //allowed parameters combination
		var textareaID = '#textarea' + sentenceID;
		if (dropping.value == "drop") {
			$(textareaID).addClass('hideText').removeClass('showText');
		}
		else {
			$(textareaID).addClass('showText').removeClass('hideText');
		}

		target.innerHTML = target.value;
		relation.value = relation.value;

		try {
			var sourceID = "#sentence" + sentenceID;
			var targetID = "#sentence" + target.value;

			// Delete existing connections
			jsPlumb.setSuspendDrawing(true);
			jsPlumb.deleteConnectionsForElement($(sourceID));

			// Establish new connections
			var connectionType = {
				connector: ["Bezier"],
				isSource:true,
                isTarget:true,
				anchor: ["Left"],
				endpoint:"Dot"
			};

			jsPlumb.connect({
				source:$(sourceID),
				target:$(targetID),
				paintStyle:{ stroke: arrowColor(relation.value), strokeWidth:3 },
				hoverPaintStyle: { stroke: "orange", strokeWidth:5 },
				endpointStyle:{ fill: arrowColor(relation.value), outlineStroke: arrowColor(relation.value) },
				endpointHoverStyle: { fill: "orange", outlineStroke:"orange" },
				overlays:[ 
				   ["Arrow" , { width:12, length:12, location:0.67 }]
				]
			}, connectionType); 

			jsPlumb.setSuspendDrawing(false);
			jsPlumb.repaintEverything();
		}
		catch(err) {
			alert(err);
		}

		alert("<OK> The information on sentence ID=" + sentenceID + " has changed");
	}
	return false;
}


/**
 * Verifying the combination of dropping, sourceID, targetID and relationLabel
 * @param{string} 	droppingFlag {"keep", "drop"}
 * @param{number}	sourceID
 * @param{number} 	targetID
 * @param{string} 	relationLabel
 * @param{number}	textLength
 * @return{array} 	[boolean, message]  
 */
function droppingOrRelation(droppingFlag, sourceID, targetID, relationLabel, textLength) {
	if (sourceID == targetID) {
		return [false, "[ERROR] a sentence cannot connect to itself!"]
	}
	else {
		if (targetID >= 0 && targetID <= textLength ) {
			if (droppingFlag == "drop") {
				if (targetID == "" && relationLabel == "") {
					return [true, ""]
				}
				else {
					return [false, "[ERROR] dropped sentence cannot have any relation!"] 
				}
			}
			else { // droppingFlag == "keep"
				if (targetID == "" || relationLabel == "") {
					return [false, "[ERROR] a sentence must relate to another sentence if its not dropped! Set the relation properly!"]
				}
				else return [true, ""]
			}
		}
		else return [false, "[ERROR] the target sentence is unknown!"]
	}
}


/**
 * Determining the proper visualization arrow color for each dependency relation type
 * @param{string} 	relationLabel {"=", "sup", "det", "att"}
 * @return{string} 	color
 */
function arrowColor(relationLabel) {
	if (relationLabel == "=") {
		return "lightgray";
	}
	else if (relationLabel == "sup") {
		return "green";
	}
	else if (relationLabel == "det") {
		return "blue";
	}
	else if (relationLabel == "att") {
		return "red";
	}
}
