import * as faceapi from 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/dist/face-api.esm.js';
let storedDescriptor = null;
const video = document.getElementById("video");
const status = document.getElementById("status");
const unlocked = document.getElementById("unlocked-content");

// Start webcam
window.startVideo = async function () {
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  video.srcObject = stream;
}

// Load face-api.js models
Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('./models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('./models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('./models')
]).then(startVideo);

// Register face
window.registerFace = async function () {
  const detection = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!detection) return alert("No face detected!");

  storedDescriptor = detection.descriptor;
  localStorage.setItem('faceDescriptor', JSON.stringify(Array.from(storedDescriptor)));
  alert("Face registered successfully!");
}

// Verify face
window.verifyFace = async function () {
  const saved = localStorage.getItem('faceDescriptor');
  if (!saved) return alert("No face registered!");

  const detection = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!detection) return alert("No face detected!");

  const inputDescriptor = detection.descriptor;
  const savedDescriptor = new Float32Array(JSON.parse(saved));
  const distance = faceapi.euclideanDistance(inputDescriptor, savedDescriptor);

  if (distance < 0.5) {
    status.innerText = "✅ Face matched! Unlocked.";
    unlocked.style.display = "block";
  } else {
    status.innerText = "❌ Face mismatch. Try again.";
    unlocked.style.display = "none";
  }
}
