/** 
 * Default configuration of program, can be changed based on your preference
 */
var disableDropping = false; // {true, false}; set true to disable dropping function
var disableReordering = false; // {true, false}; set true to disable reordering function
var allowIntermediarySave = false; // {true, false}; set false (suggested) if you allow the annotator to save only when the annotation is done; true if the annotator can save midway


/** 
 * Relations and their color
 * The relations that can be used in the tool, you can add or delete the relation in this list
 */
// var availableRels = ["collection", "comparison", "description", "causation", "response"] 
var availableRels = ["att", "det", "sup", "="] 
// var availableRels = ["met", "sup", "det", "ca", "res", "qf", "="] 

/** 
 * The corresponding color for the relation, i.e., the first element of relColor for the first relation in availableRels list. 
 * For example, change "lightgreen" to "#ff0000"
 * Basic colors (can be used in all browsers): ["white", "silver", "gray", "black", "red", "maroon", "yellow", "olive", "lime", "green", "aqua", "teal", "blue", "navy", "fuchsia", "purple"]
 *
 * Refer to the following website for a comprehensive list of color names: https://en.wikipedia.org/wiki/Web_colors#Extended_colors
 */
// var relColors = ["lightgray", "lightpink", "lightblue", "lightgreen", "goldenrod"] 
var relColors = ["lightpink", "lightblue", "lightgreen", "lightgray"] 
// var relColors = ["lightseagreen", "lightgreen", "lightblue", "lightpink", "indianred", "goldenrod", "lightgray"] 

/**
 * Corresponding relation type, true if directed (asymmetrical) and false if undirected (symmetrical)
 */
// var relDirections = [false, false, true, true, true]
var relDirections = [true, true, true, false]
// var relDirections = [true, true, true, true, true, true, false]
