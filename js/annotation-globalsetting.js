/** 
 * Default configuration of program, can be changed based on your preference
 */
var disableDropping = false; // set true to disable dropping function
var disableReordering = false; // set true to disable reordering function

/** 
 * Relations and their color
 */
// The relations that can be used in the tool, you can add or delete the relation in this list
var availableRels = ["sup", "det", "att", "="] 

// The corresponding color for the relation, i.e., the first element of relColor for the first relation in availableRels list. 
// You can use available colors in HTML color picker https://www.w3schools.com/colors/colors_picker.asp
// For example, change "lightgreen" to "#ff0000"
var relColors = ["lightgreen", "lightblue", "lightpink", "lightgray"] 

// Corresponding relation type, true if directed (asymmetrical) and false if undirected (symmetrical)
var relDirections = [true, true, true, false]