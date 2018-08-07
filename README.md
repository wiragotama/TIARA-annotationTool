TO DO:
	- automatic scroll
		- Note: we can scroll while moving sentence, but jsPlumb doesn't support scrolling when dragging connection
	
	- bug in jsPlumb
		- when we change the label, it seems the previous label's arrow still exist even though we already removed the Overlays (tried many methods but didn't work)

	- highlight the arcs that contitutes in a loop
		- prohibit the link that can cause a loop with a warning when establishing new connection, then drop the new relation

	- save & load