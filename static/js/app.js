const recStart = document.getElementById("record");
const recStop = document.getElementById("stop");
const recStopCont = document.querySelector('.stop-container')
const recCancelCont = document.querySelector('.cancel-container')
const aud = document.getElementById("aud");
const greenCircle = document.getElementById('greenCircle');
const timer = document.getElementById('timer')
const upload = document.getElementById('filepicker-container')
const recCancel = document.getElementById("cancel");
const playbutton = document.getElementById('playbutton')
const stopbutton = document.getElementById('stopbutton')
const outputEmotion = document.getElementById('output-emotion')
const outputEmoji = document.getElementById('output-emoji')
const filePickerInp = document.getElementById('file-picker-inp')
const outputBox=document.querySelector('.output-box')
const quotesBox=document.querySelector('.quotes-box')
const gifOutput=document.getElementById('gif-output')
const happyBomb=document.querySelector('.happybomb')

const mediaConstraints = { audio: true, video: false };

playbutton.style.pointerEvents = 'none'
outputBox.style.display='none'
quotesBox.style.display='none'

playbutton.addEventListener('click', function () {
  playbutton.style.display = 'none'
  stopbutton.style.display = 'inherit'
})
stopbutton.addEventListener('click', function () {
  stopbutton.style.display = 'none'
  playbutton.style.display = 'inherit'
})

filePickerInp.addEventListener('change', function (e) {
  greenCircle.style.display = 'none'
  recStart.style.display = 'inherit'
  const blob = e.target.files[0];
  const audioUrl = URL.createObjectURL(blob)
  const audioPlayer = new Audio(audioUrl)
  playbutton.style.pointerEvents = 'unset';
  happyBomb.style.display='none'

  playbutton.addEventListener('click', function () {
    audioPlayer.play()
  })
  stopbutton.addEventListener('click', function () {
    audioPlayer.pause()
  })

  var blobData = new FormData();
  blobData.append("file", blob);
  fetch("/data", {
    method: "POST",
    body: blobData,
  })
    .then(function (response) {
      if (response.ok) {
        response.json().then(function (response) {
          if(response.response == 'happiness'){
            happyBomb.style.display='inherit'
          }
          console.log(response.response);
          outputBox.style.display='inherit'
          quotesBox.style.display='inherit'
          outputEmotion.textContent = EmotionsData[response.response].emotion
          outputEmoji.textContent = EmotionsData[response.response].emoji
          gifOutput.src=EmotionsData[response.response].quote
        });
      } else {
        throw Error("Something went wrong");
      }
    })
    .catch(function (error) {
      console.log(error);
    });
})

recStart.addEventListener("click", function () {
  outputBox.style.display='none'
quotesBox.style.display='none'
  recStart.style.display = 'none'
  greenCircle.style.display = 'inherit'
  upload.style.pointerEvents = 'none'
  recStopCont.classList.add('DownStop-container')
  recCancelCont.classList.add('DownCancel-container')
  playbutton.style.pointerEvents = 'all'
  happyBomb.style.display='none'

  navigator.mediaDevices.getUserMedia(mediaConstraints).then((stream) => {
    const audioContext = new window.AudioContext();
    const input = audioContext.createMediaStreamSource(stream);
    rec = new Recorder(input, {
      numChannels: 1,
    });
    rec.record();

    recStopCont.style.display = 'inherit'
    recCancelCont.style.display = 'inherit'

    let timerInterval = setInterval(function () {
      let value = Number(timer.textContent)
      timer.textContent = value + 1
    }, 1000)


    recCancel.addEventListener('click', function () {
      greenCircle.style.display = 'none'
      recStart.style.display = 'inherit'
      upload.style.pointerEvents = 'all'
      clearInterval(timerInterval)
      timer.textContent = '0'
      recStopCont.classList.add('reverseStopCancel')
      recCancelCont.classList.add('reverseStopCancel')

      setTimeout(function () {
        recStopCont.style.display = 'none'
        recCancelCont.style.display = 'none'
        recStopCont.classList.remove('reverseStopCancel')
        recCancelCont.classList.remove('reverseStopCancel')
      }, 500)
    })


    recStop.addEventListener("click", function () {
      rec.stop(); //stop microphone access

      greenCircle.style.display = 'none'
      recStart.style.display = 'inherit'
      upload.style.pointerEvents = 'all'
      clearInterval(timerInterval)
      timer.textContent = '0'
      recStopCont.classList.add('reverseStopCancel')
      recCancelCont.classList.add('reverseStopCancel')

      setTimeout(function () {
        recStopCont.style.display = 'none'
        recCancelCont.style.display = 'none'
        recStopCont.classList.remove('reverseStopCancel')
        recCancelCont.classList.remove('reverseStopCancel')
      }, 500)

      stream.getAudioTracks()[0].stop();

      rec.exportWAV((blob) => {
        const audioUrl = URL.createObjectURL(blob)
        const audioPlayer = new Audio(audioUrl)

        playbutton.addEventListener('click', function () {
          audioPlayer.play()
        })
        stopbutton.addEventListener('click', function () {
          audioPlayer.pause()
        })

        var blobData = new FormData();
        blobData.append("file", blob);
        fetch("/data", {
          method: "POST",
          body: blobData,
        })
          .then(function (response) {
            if (response.ok) {
              response.json().then(function (response) {
                if(response.response == 'happiness'){
                  happyBomb.style.display='inherit'
                }
                console.log(response.response);
                outputBox.style.display='inherit'
                quotesBox.style.display='inherit'
                outputEmotion.textContent = EmotionsData[response.response].emotion
                outputEmoji.textContent = EmotionsData[response.response].emoji
                gifOutput.src=EmotionsData[response.response].quote
              });
            } else {
              throw Error("Something went wrong");
            }
          })
          .catch(function (error) {
            console.log(error);
          });
      });
    });

  });
});