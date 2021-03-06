const video = document.createElement('video');
const canvasElement = document.getElementById('canvas');
const canvas = canvasElement.getContext('2d');
const loadingMessage = document.getElementById('loadingMessage');
const outputContainer = document.getElementById('output');
const outputMessage = document.getElementById('outputMessage');
const outputData = document.getElementById('outputData');
const searchBtn = document.getElementById('searchBtn');

const color = '#FF3B58'; // border color of triggered qrcode
let wantToSearch = true; // pause if a qrcode is triggered

init(); // entry point of the script

// play button to resume qrcode search
searchBtn.addEventListener('click', (e) => {
  wantToSearch = true;
  outputMessage.hidden = false;
  outputData.parentElement.hidden = true;
  init();
  console.log('[DEBUG] Resume request search emitted !');
});

// draw a line arround the triggered qrcode
function drawLine(begin, end, color) {
  canvas.beginPath();
  canvas.moveTo(begin.x, begin.y);
  canvas.lineTo(end.x, end.y);
  canvas.lineWidth = 4;
  canvas.strokeStyle = color;
  canvas.stroke();
}

function init() {
  // Use facingMode: environment to attemt to get the front camera on phones
  navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } }).then((stream) => {
    video.srcObject = stream;
    video.setAttribute('playsinline', true); // required to tell iOS safari we don't want fullscreen
    video.play();
    requestAnimationFrame(tick);
  });

  // search every frame
  function tick() {
    if (wantToSearch) {
      loadingMessage.innerText = '⌛ Loading video...';
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        loadingMessage.hidden = true;
        canvasElement.hidden = false;
        outputContainer.hidden = false;

        canvasElement.height = video.videoHeight;
        canvasElement.width = video.videoWidth;
        canvas.drawImage(video, 0, 0, canvasElement.width, canvasElement.height);
        const imageData = canvas.getImageData(0, 0, canvasElement.width, canvasElement.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        });
        if (code) {
          drawLine(code.location.topLeftCorner, code.location.topRightCorner, color);
          drawLine(code.location.topRightCorner, code.location.bottomRightCorner, color);
          drawLine(code.location.bottomRightCorner, code.location.bottomLeftCorner, color);
          drawLine(code.location.bottomLeftCorner, code.location.topLeftCorner, color);
          outputMessage.hidden = true;
          outputData.parentElement.hidden = false;
          outputData.innerText = code.data;
          wantToSearch = false; // pause the execution
        } else {
          outputMessage.hidden = false;
          outputData.parentElement.hidden = true;
        }
      }
      requestAnimationFrame(tick);
    }
  }
}
