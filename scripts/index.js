(function() {
	'use strict';
	//Testing Speech API supported
	var speechSynthesisSupported = 'speechSynthesis' in window;

	var isPlaying = false;
	//Getting parameters
	var supportMessageEle = document.getElementById('support-message');

	var optionsContainer = document.getElementById('options-container');
	var textContainer = document.getElementById('text-container');

	var langSelect = document.getElementById('language');

	var playBtn = document.getElementById('play-btn');
	var nextBtn = document.getElementById('next-btn');

	var textAnswer = document.getElementById('answer');

	var speechStatus = document.getElementById('speech-status');

	//Getting Data
	var getJSON = function(url, callback) {
	    var xhr = new XMLHttpRequest();
	    xhr.open('GET', url, true);
	    xhr.responseType = 'json';
	    xhr.onload = function() {
	      var status = xhr.status;
	      if (status == 200) {
	        callback(null, xhr.response);
	      } else {
	        callback(status);
	      }
	    };
	    xhr.send();
	};

	var sort_by = function(field, reverse, primer){

	   var key = primer ? 
	       function(x) {return primer(x[field])} : 
	       function(x) {return x[field]};

	   reverse = !reverse ? 1 : -1;

	   return function (a, b) {
	       return a = key(a), b = key(b), reverse * ((a > b) - (b > a));
	     } 
	}

	var words = {};

	var getWords = function () {

		words = {};

		getJSON(langSelect.value + '.json',
		function(err, data) {
		  if (err != null) {
		    supportMessageEle.innerHTML = 'Words Database does not found.';
		  } else {
		    words = data;

		    words.Sort = function() {

				words.words.forEach((Item) => {
					Item.Sort = Math.random();
				});

				words.words.sort(sort_by('Sort', false, parseFloat));

			};

			speakWord();
		  }
		});
	};

	if (!speechSynthesisSupported) {
		supportMessageEle.innerHTML = 'Your browser <strong>does not support</strong> speech synthesis.';
		supportMessageEle.classList.add('unSupported');
	}

	var speak = function (textToSpeech) {
		var synUtterance = new SpeechSynthesisUtterance();
		synUtterance.text = textToSpeech;
		
		synUtterance.lang = langSelect.value;
		synUtterance.volume = 1;
		synUtterance.rate = 0.4;

		window.speechSynthesis.speak(synUtterance);
	};

	var speakWord = function () {
		if ((words.index <= 0 || words.index >= words.words.length) && playBtn.innerHTML == "Start") {
			words.Sort();
			words.index = 0;
			playBtn.innerHTML = "Speech";
			textContainer.style.visibility = 'visible';

		};

		if (words.words.length > 0 && words.index < words.words.length) {
				speak(words.words[words.index].word);
				textAnswer.focus();
			}
		if (words.index >= words.words.length) {
			playBtn.innerHTML = "Start";
			textContainer.style.visibility = 'hidden';
			words.index = 0;
		};
	};

	if (speechSynthesisSupported) {
		playBtn.addEventListener('click', () => {
			if (words.language != langSelect.value) {
				getWords();
			}
			speakWord();
		});
	};

	textAnswer.onkeyup = function() {
		//console.log(textAnswer.value);
		words.words[words.index].answers.forEach((item) => {
			if (textAnswer.value.toUpperCase() == item.toUpperCase()) {
				nextBtn.style.visibility = 'visible';
			}
		})
	};

	nextBtn.onclick = function() {
		words.index ++;
		textAnswer.value = '';
		nextBtn.style.visibility = 'hidden';
		speakWord();
	};

	setInterval(() => {
			if (speechSynthesis.speaking) {
				speechStatus.style.visibility = 'visible';
				speechStatus.style.width = '32px';
				if (!isPlaying) {
					speechStatus.src = 'images/playingsound.gif';
					isPlaying = true;
				}
				if (speechSynthesis.paused) {
					speechStatus.src = 'images/pauseicon.png';
					isPlaying = false;
				}
			} else {
				isPlaying = false;
				speechStatus.src = '';
				speechStatus.style.visibility = 'hidden';
			}
		}, 100);

}());