NOTE:
	- The automatic scroll is disabled because it causes some problems while dragging (if the text is long) --> I don't know what kind of bug is this. Therefore, please hold your mouse left click + using the roller of the mouse when dragging (or use three fingers when using mac)...

HOW TO USE:
	- Open ver3.html
	- Click "load" menu, and then select the essay you want to annotate in the "original/" folder. The essays have been pre-formatted into html
	- After you have done the annotation click "Save", the javascript will automatically download a file
		- You cannot save midway. For example, when you have 5 sentences but you only annotate 3 sentences, the script will give you an error message
		- Question to discuss: should we allow saving midway? I am afraid the annotator will forget which essay they have finished and which one is still unfinished. Allowing saving midway will cause some extra work for us
		- When you annotate the text, DO NOT REFRESH the page (or the annotation will be gone otherwise)
		- When you finished annotating a text, please move the downloaded ".xml" file into the "annotation/" folder. You can load them too!
	- After you have done the annotation and saved the annotation, please refresh the page before begin working on another file
		- I.e., load -> annotate -> save -> refresh
		- Wira: actually, it is okay without refreshing the page. However, sometimes the visualization does not work when I do not refresh the page (and I cannot recreate the problem). I believe this is the bug from the library. Here how my program works:
			1. Reset the JsPlumb object (if present) when loading a new file --> kind of destructor
			2. Load all the DOM necessary
			3. Initialize the JsPlumb object (library: JsPlumb) -> constructor
			4. Do the annotation ...
			Ideally, destructor will delete and flush out everything from the page; however it seems that the destructor doesn't work properly. That's why we need to refresh the page when we work on a new file

DEVELOPER NOTE:
	- We have two modes: "debug" and "production". If you want the script to output some messages every time it detects an event in the page, please change the line 17 of the "js/annotation_v3.js" file as "var mode = "debug""
	- I have tried annotating three files without problems (Chrome 67 and Safari 11.1.2). Hopefully there is no bug but if you found one, please kindly tell me how to reproduce the bug