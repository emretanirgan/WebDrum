(function() {
	var notesPos = [0, 82, 159, 238, 313, 390, 468, 544];
	var timeOut, lastImageData;
	var canvasSource = $("#canvas-source")[0];
	var canvasBlended = $("#canvas-blended")[0];
	var contextSource = canvasSource.getContext('2d');
	var contextBlended = canvasBlended.getContext('2d');
	var soundContext, bufferLoader;
	var notes = [];
	var startPlay = false;
	var showBlend = false;
	var found = false;


	function toggleStart() {
		startPlay = !startPlay;
		if(startPlay){
			$("#startplay").html("Stop Playing");
		}
		else{
			$("#startplay").html("Start Playing")
		}
	}

	function switchBlend() {
		var canvassource = $("#canvas-source");
		var canvasblended = $("#canvas-blended");
		showBlend = !showBlend;
		if(showBlend){
			canvassource.hide();
			canvasblended.show();
			$("#switchblend").html("Show Normal Cam");

		}
		else{	
			canvasblended.hide();
			canvassource.show();
			$("#switchblend").html("Show Mocap")
		}
	}

	$("#startplay").click(toggleStart);
	$("#switchblend").click(switchBlend);

	var AudioContext = (
		window.AudioContext ||
		window.webkitAudioContext ||
		null
	);

	function hasGetUserMedia() {
	  return !!(navigator.getUserMedia || navigator.webkitGetUserMedia ||
	  navigator.mozGetUserMedia || navigator.msGetUserMedia);
	}   
	var webcamError = function(e) {
		alert('Webcam error!', e);
	};

	var video = $('#webcam')[0];

	if (navigator.getUserMedia) {
		navigator.getUserMedia({audio: true, video: true}, function(stream) {
			video.src = stream;
			initialize();
		}, webcamError);
	} else if (navigator.webkitGetUserMedia) {
	         navigator.webkitGetUserMedia({audio:true, video:true}, function(stream) {
			video.src = window.webkitURL.createObjectURL(stream);
			initialize();
		}, webcamError);
	} else {
		//video.src = 'video.webm'; // fallback.
	}

	//Mirror canvas
	contextSource.translate(canvasSource.width, 0);
	contextSource.scale(-1, 1);

	var c = 5;

	function initialize() {
		if (!AudioContext) {
			alert("Sorry, AudioContext is not supported for your browser!");
		}
		else {
			loadSounds();
		}
	}

	function loadSounds() {
		soundContext = new AudioContext();
		bufferLoader = new BufferLoader(soundContext,
			[
				'sounds/snare.mp3',
				'sounds/cymbalcrash.mp3'
			],
			finishedLoading
		);
		bufferLoader.load();
	}

	function finishedLoading(bufferList) {
		for (var i=0; i<2; i++) {
			var source = soundContext.createBufferSource();
			source.buffer = bufferList[i];
			source.connect(soundContext.destination);
			var note = {
				note: source,
				ready: true,
				//visual: $("#note" + i)[0]
			};
			note.area = {x:notesPos[i], y:380, width:/*note.visual.width*/ 100, height:100};
			notes.push(note);
		}
		start();
	}

	function playSound(obj) {
		if (!obj.ready) return;
		var source = soundContext.createBufferSource();
		source.buffer = obj.note.buffer;
		source.connect(soundContext.destination);
		source.noteOn(0);
		console.log("Here " + new Date().getTime());
		obj.ready = false;
		// throttle the note
		setTimeout(setNoteReady, 100, obj);
	}

	function setNoteReady(obj) {
		obj.ready = true;
	}

	function start() {
		$(canvasSource).show();
		$(canvasBlended).show();
		//$("#xylo").show();
		//$("#message").hide();
		//$("#description").show();
		update();
	}

	function update() {
		if(!found){
			console.log(new Date().getTime());
		}
		drawVideo();
		blend();
		if(startPlay){
			checkAreas();
		}
		timeOut = setTimeout(update, 1000/60);
	}

	function drawVideo() {
			contextSource.drawImage(video, 0, 0, video.width, video.height);
	}

	function fastAbs(value) {
		// equivalent to Math.abs();
		return (value ^ (value >> 31)) - (value >> 31);
	}

	function difference(target, data1, data2) {
		// blend mode difference
		if (data1.length != data2.length) return null;
		var i = 0;
		while (i < (data1.length * 0.25)) {
			target[4*i] = data1[4*i] == 0 ? 0 : fastAbs(data1[4*i] - data2[4*i]);
			target[4*i+1] = data1[4*i+1] == 0 ? 0 : fastAbs(data1[4*i+1] - data2[4*i+1]);
			target[4*i+2] = data1[4*i+2] == 0 ? 0 : fastAbs(data1[4*i+2] - data2[4*i+2]);
			target[4*i+3] = 0xFF;
			++i;
		}
	}

	function threshold(value) {
		return (value > 0x15) ? 0xFF : 0;
	}

	function differenceAccuracy(target, data1, data2) {
		if (data1.length != data2.length) return null;
		var i = 0;
		while (i < (data1.length * 0.25)) {
			var average1 = (data1[4*i] + data1[4*i+1] + data1[4*i+2]) / 3;
			var average2 = (data2[4*i] + data2[4*i+1] + data2[4*i+2]) / 3;
			var diff = threshold(fastAbs(average1 - average2));
			target[4*i] = diff;
			target[4*i+1] = diff;
			target[4*i+2] = diff;
			target[4*i+3] = 0xFF;
			++i;
		}
	}

	function blend() {
		/*var width = canvasSource.width;
		var height = canvasSource.height;*/
		var width = 100;
		var height = 100;
		// get webcam image data
		//var sourceData = contextSource.getImageData(0, 0, width, height);
		var sourceData = contextSource.getImageData(0, 380, width, height);
		// create an image if the previous image doesn’t exist
		if (!lastImageData) lastImageData = contextSource.getImageData(0, 0, width, height);
		//if (!lastImageData) lastImageData = contextSource.getImageData(0, 380, width, height);
		// create a ImageData instance to receive the blended result
		var blendedData = contextSource.createImageData(width, height);
		// blend the 2 images
		differenceAccuracy(blendedData.data, sourceData.data, lastImageData.data);
		// draw the result in a canvas
		//contextBlended.putImageData(blendedData, 0, 0);
		contextBlended.putImageData(blendedData, 0, 380);
		// store the current webcam image
		lastImageData = sourceData;
	}

	function checkAreas() {
		// loop over the note areas
		//1 should be notes.length
		for (var r=0; r<1; ++r) {
			// get the pixels in a note area from the blended image
			var blendedData = contextBlended.getImageData(
				notes[r].area.x,
				notes[r].area.y,
				notes[r].area.width,
				notes[r].area.height);
			var i = 0;
			var average = 0;
			// loop over the pixels
			while (i < (blendedData.data.length / 4)) {
				// make an average between the color channel
				average += (blendedData.data[i*4] + blendedData.data[i*4+1] + blendedData.data[i*4+2]) / 3;
				++i;
			}
			// calculate an average between of the color values of the note area
			average = Math.round(average / (blendedData.data.length / 4));
			if(average > 60){
				//Play the stronger sound
				found = true;
				playSound(notes[1]);
			}
			else if (average > 30) {
				//Play the lighter sound
				found = true;
				// over a small limit, consider that a movement is detected
				// play a note and show a visual feedback to the user
				playSound(notes[r]);
				//notes[r].visual.style.display = "block";
				//$(notes[r].visual).fadeOut();
			}
			else if (average == 0){
				//setNoteReady(notes[r]);
			}
		}
	}

	})();