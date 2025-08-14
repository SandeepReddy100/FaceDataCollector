// // Get references to our HTML elements
// const video = document.getElementById('video');
// const startButton = document.getElementById('startButton');
// const canvasElement = document.getElementById('canvas');
// const canvasCtx = canvasElement.getContext('2d');
// const statusText = document.getElementById('statusText');
// const overlay = document.getElementById('overlay');

// // --- State Management & Constants ---
// const CAPTURE_DELAY_MS = 2000;
// let readyToCaptureTimer = null;
// let isCaptureDone = false;

// let faceStatus = {
//     isFaceDetected: false,
//     isCentered: false,
//     isReady: false
// };

// // --- Function to load face-api.js models ---
// async function loadFaceAPIModels() {
//     await faceapi.nets.ssdMobilenetv1.loadFromUri('models');
//     await faceapi.nets.faceLandmark68Net.loadFromUri('models');
//     await faceapi.nets.faceRecognitionNet.loadFromUri('models');
// }

// // --- MediaPipe and Drawing Logic ---
// function onResults(results) {
//     if (isCaptureDone) return;

//     canvasCtx.save();
//     canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

//     faceStatus.isFaceDetected = results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0;
//     if (faceStatus.isFaceDetected) {
//         const landmarks = results.multiFaceLandmarks[0];
//         const nose = landmarks[1];
//         faceStatus.isCentered = nose.x > 0.4 && nose.x < 0.6 && nose.y > 0.4 && nose.y < 0.6;
//         drawConnectors(canvasCtx, landmarks, FACEMESH_TESSELATION, { color: '#C0C0C070', lineWidth: 1 });
//     } else {
//         faceStatus.isCentered = false;
//     }
//     faceStatus.isReady = faceStatus.isFaceDetected && faceStatus.isCentered;
//     canvasCtx.restore();
// }

// const faceMesh = new FaceMesh({ locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}` });
// faceMesh.setOptions({ maxNumFaces: 1, refineLandmarks: true, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 });
// faceMesh.onResults(onResults);

// // --- Main Application Flow ---
// async function sendToMediaPipe() {
//     if (isCaptureDone || !video.srcObject) return;

//     if (!video.paused && !video.ended) {
//         await faceMesh.send({ image: video });
//         updateFeedback();
//     }
//     requestAnimationFrame(sendToMediaPipe);
// }

// function updateFeedback() {
//     if (isCaptureDone) return;

//     if (!faceStatus.isFaceDetected || !faceStatus.isCentered) {
//         overlay.classList.remove('correct-position');
//         statusText.textContent = faceStatus.isFaceDetected ? "Please center your face in the oval." : "Please show your face.";
//         clearTimeout(readyToCaptureTimer);
//         readyToCaptureTimer = null;
//     } else {
//         statusText.textContent = "Perfect! Hold still...";
//         overlay.classList.add('correct-position');
//         if (!readyToCaptureTimer) {
//             readyToCaptureTimer = setTimeout(captureAndEmbed, CAPTURE_DELAY_MS);
//         }
//     }
// }

// // --- Capture and Embedding Function (Corrected) ---
// async function captureAndEmbed() {
//     if (isCaptureDone) return;
//     isCaptureDone = true;
//     statusText.textContent = "Processing...";
    
//     try {
//         // Ensure video metadata is loaded
//         if (video.videoWidth === 0 || video.videoHeight === 0) {
//             await new Promise(resolve => {
//                 video.addEventListener('loadedmetadata', resolve, { once: true });
//             });
//         }
        
//         // Match canvas to video
//         canvasElement.width = video.videoWidth;
//         canvasElement.height = video.videoHeight;
        
//         // Draw frame
//         canvasCtx.drawImage(video, 0, 0, canvasElement.width, canvasElement.height);
        
//         console.log('Canvas size:', canvasElement.width, canvasElement.height);
        
//         // Run face detection
//         console.log('Running face detection...');
//         const detection = await faceapi
//             .detectSingleFace(canvasElement, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.3 }))
//             .withFaceLandmarks()
//             .withFaceDescriptor();
        
//         console.log('Detection result:', detection);
        
//         if (!detection) {
//             throw new Error("No face detected. Please try again with your face clearly visible.");
//         }

//         // Validate bounding box to prevent the null error
//         if (!detection.detection?.box || 
//             detection.detection.box.x == null || 
//             detection.detection.box.y == null ||
//             detection.detection.box.width == null || 
//             detection.detection.box.height == null) {
//             throw new Error("Face detected but bounding box is invalid.");
//         }

//         // ✅ CALL saveFaceData HERE - after successful detection
//         console.log('Valid detection found:', detection.detection.box);
        
//         // Stop camera after successful detection
//         video.srcObject.getTracks().forEach(track => track.stop());
//         video.style.display = 'none';
        
//         // Save the face data
//         saveFaceData(detection);

//             // Use it in your captureAndEmbed function:
// if (detection) {
//     const isValid = validateFaceData(detection);
//     if (isValid) {
//         console.log('✅ Face registration is VALID and ready to save!');
//         statusText.textContent = "Face registered successfully!";
        
//         // Now save the data
//         // saveFaceData(detection);
//     } else {
//         console.log('⚠️ Face quality could be better. Try again?');
//         statusText.textContent = "Face quality low. Please try again with better lighting.";
//         isCaptureDone = false;
//     }
//     const confidenceScore = detection.detection.score;
//     console.log(`Confidence Score: ${(confidenceScore * 100).toFixed(2)}%`);

//     if (confidenceScore < 0.8) {
//         statusText.textContent = `⚠️ Confidence too low (${(confidenceScore * 100).toFixed(1)}%). Please re-register.`;
//         isCaptureDone = false; // allow retry
//         setTimeout(() => sendToMediaPipe(), 2000); // restart detection
//         return; // stop here, don't save
//     }

//     statusText.textContent = `✅ Face registered successfully! Confidence: ${(confidenceScore * 100).toFixed(1)}%`;
//     saveFaceData(detection);
// }
        
//     } catch (error) {
//         console.error("Error during face detection:", error);
//         statusText.textContent = `An error occurred: ${error.message}`;
//         isCaptureDone = false; // Let them retry
        
//         // Restart the face detection process
//         if (video.srcObject) {
//             setTimeout(() => {
//                 statusText.textContent = "Position your face in the oval and hold still.";
//                 sendToMediaPipe();
//             }, 2000);
//         }
//     }

// }


// // Add this after successful face detection in captureAndEmbed()
// function validateFaceData(detection) {
//     const confidence = detection.detection.score;
//     const descriptor = detection.descriptor;
//     const landmarks = detection.landmarks.positions;
    
//     console.log('=== FACE REGISTRATION VALIDATION ===');
//     console.log('Confidence Score:', confidence.toFixed(3));
//     console.log('Descriptor Length:', descriptor.length);
//     console.log('Landmarks Count:', landmarks.length);
    
//     // Quality checks
//     const isHighQuality = confidence > 0.7;
//     const hasValidDescriptor = descriptor.length === 128;
//     const hasAllLandmarks = landmarks.length === 68;
    
//     console.log('Quality Checks:');
//     console.log('- High Confidence:', isHighQuality ? '✅' : '⚠️');
//     console.log('- Valid Descriptor:', hasValidDescriptor ? '✅' : '❌');
//     console.log('- All Landmarks:', hasAllLandmarks ? '✅' : '❌');
    
//     return isHighQuality && hasValidDescriptor && hasAllLandmarks;
// }
// // --- Add these functions after captureAndEmbed() ---

// function saveFaceData(detection) {
//     const faceData = {
//         descriptor: Array.from(detection.descriptor),
//         confidence: detection.detection.score,
//         timestamp: new Date().toISOString(),
//         landmarks: detection.landmarks.positions.map(p => ({x: p.x, y: p.y}))
//     };
    
//     const studentId = prompt("Enter Student ID:");
//     if (studentId) {
//         localStorage.setItem(`face_${studentId}`, JSON.stringify(faceData));
//         console.log('Face data saved for student:', studentId);
        
//         // Show test button after successful registration
//         document.getElementById('testButton').style.display = 'inline-block';
        
//         sendToBackend(studentId, faceData);
//     }
// }


// async function sendToBackend(studentId, faceData) {
//     try {
//         const response = await fetch('/api/register-face', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify({
//                 studentId: studentId,
//                 faceDescriptor: faceData.descriptor,
//                 confidence: faceData.confidence,
//                 timestamp: faceData.timestamp
//             })
//         });
        
//         if (response.ok) {
//             statusText.textContent = "Face registered and saved successfully!";
//         } else {
//             throw new Error('Failed to save to server');
//         }
//     } catch (error) {
//         console.error('Error saving to backend:', error);
//         statusText.textContent = "Saved locally. Server unavailable.";
//     }
// }

// // async function testRecognition(currentDetection, studentId) {
// //     try {
// //         const currentDescriptor = Array.from(currentDetection.descriptor);
// //         const savedData = JSON.parse(localStorage.getItem(`face_${studentId}`));

// //         if (!savedData) {
// //             console.log('No saved face data found for student:', studentId);
// //             return false;
// //         }

// //         const savedDescriptor = savedData.descriptor;

// //         // Calculate similarity (Euclidean distance)
// //         const distance = faceapi.euclideanDistance(currentDescriptor, savedDescriptor);
// //         const similarity = 1 - distance; // Convert to similarity score (0 to 1)

// //         console.log('Recognition Test:');
// //         console.log('Distance:', distance.toFixed(3));
// //         console.log('Similarity:', (similarity * 100).toFixed(2) + "%");
// //         console.log('Match:', similarity >= 0.7 ? '✅ MATCH' : '❌ NO MATCH');

// //         // Match only if similarity >= 80%
// //         return similarity >= 0.7;
// //     } catch (error) {
// //         console.error('Error in face recognition test:', error);
// //         return false;
// //     }
// // }


// // --- Initialization ---
// async function testRecognition(currentDetection, studentId) {
//     try {
//         const currentDescriptor = Array.from(currentDetection.descriptor);
//         const savedData = JSON.parse(localStorage.getItem(`face_${studentId}`));

//         if (!savedData) {
//             console.log('No saved face data found for student:', studentId);
//             statusText.textContent = "No face data found for this student.";
//             return false;
//         }

//         const savedDescriptor = savedData.descriptor;
//         const distance = faceapi.euclideanDistance(currentDescriptor, savedDescriptor);
//         const similarity = 1 - distance;

//         console.log(`Similarity: ${(similarity * 100).toFixed(2)}%`);
//         statusText.textContent = `Similarity: ${(similarity * 100).toFixed(1)}%`;

//         return similarity >= 0.8; // match threshold
//     } catch (error) {
//         console.error('Error in face recognition test:', error);
//         statusText.textContent = "Error during recognition.";
//         return false;
//     }
// }
// startButton.addEventListener('click', async () => {
//     startButton.style.display = 'none';
//     statusText.textContent = "Loading models...";
//     await Promise.all([
//         faceMesh.initialize(),
//         loadFaceAPIModels()
//     ]);
//     statusText.textContent = "Starting camera...";
//     startCamera();
// });
// function startCamera() {
//     navigator.mediaDevices.getUserMedia({ 
//         video: { 
//             width: { ideal: 640 },
//             height: { ideal: 480 },
//             facingMode: 'user' // Use front camera
//         } 
//     })
//     .then(stream => {
//         video.srcObject = stream;
//         video.addEventListener('loadedmetadata', () => {
//             // Ensure canvas is properly sized when video metadata loads
//             canvasElement.width = video.videoWidth;
//             canvasElement.height = video.videoHeight;
//             console.log('Video dimensions:', video.videoWidth, video.videoHeight);
//         });
        
//         video.addEventListener('playing', () => {
//             sendToMediaPipe();
//         });
//     })
//     .catch(err => {
//         console.error("Error accessing camera: ", err);
//         statusText.textContent = "Could not access the camera. Please grant permission.";
//     });
// }


// // Add this near your other event listeners
// const testButton = document.getElementById('testButton');

// testButton.addEventListener('click', async () => {
//     const studentId = prompt("Enter Student ID to test:");
//     if (!studentId) return;
    
//     statusText.textContent = "Starting recognition test...";
//     testButton.style.display = 'none';
//     startButton.style.display = 'none';
    
//     try {
//         // Start camera for recognition test
//         const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
//         video.srcObject = stream;
//         video.style.display = 'block';
        
//         video.addEventListener('playing', async () => {
//             // Wait a moment for video to stabilize
//             setTimeout(async () => {
//                 // Capture current frame
//                 canvasElement.width = video.videoWidth;
//                 canvasElement.height = video.videoHeight;
//                 canvasCtx.drawImage(video, 0, 0, canvasElement.width, canvasElement.height);
                
//                 // Run face detection
//                 const detection = await faceapi
//                     .detectSingleFace(canvasElement, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.3 }))
//                     .withFaceLandmarks()
//                     .withFaceDescriptor();
                
//                 if (detection) {
//                     const isMatch = await testRecognition(detection, studentId);
//                     statusText.textContent = isMatch ? 
//                         `✅ Recognition SUCCESS for ${studentId}!` : 
//                         `❌ Recognition FAILED for ${studentId}`;
//                 } else {
//                     statusText.textContent = "No face detected in test";
//                 }
                
//                 // Stop camera
//                 video.srcObject.getTracks().forEach(track => track.stop());
//                 video.style.display = 'none';
                
//                 // Show buttons again
//                 setTimeout(() => {
//                     startButton.style.display = 'inline-block';
//                     testButton.style.display = 'inline-block';
//                 }, 2000);
                
//             }, 2000);
//         });
        
//     } catch (error) {
//         console.error('Recognition test error:', error);
//         statusText.textContent = "Recognition test failed";
//         startButton.style.display = 'inline-block';
//         testButton.style.display = 'inline-block';
//     }
// });

// Get references to our HTML elements
const video = document.getElementById('video');
const startButton = document.getElementById('startButton');
const canvasElement = document.getElementById('canvas');
const canvasCtx = canvasElement.getContext('2d');
const statusText = document.getElementById('statusText');
const overlay = document.getElementById('overlay');
const confidenceScore=document.getElementById('confidenceText');
// --- State Management & Constants ---
const CAPTURE_DELAY_MS = 2000;
let readyToCaptureTimer = null;
let isCaptureDone = false;

let faceStatus = {
    isFaceDetected: false,
    isCentered: false,
    isReady: false
};

// --- Function to load face-api.js models ---
async function loadFaceAPIModels() {
    await faceapi.nets.ssdMobilenetv1.loadFromUri('models');
    await faceapi.nets.faceLandmark68Net.loadFromUri('models');
    await faceapi.nets.faceRecognitionNet.loadFromUri('models');
}

// --- MediaPipe and Drawing Logic ---
function onResults(results) {
    if (isCaptureDone) return;

    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    faceStatus.isFaceDetected = results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0;
    if (faceStatus.isFaceDetected) {
        const landmarks = results.multiFaceLandmarks[0];
        const nose = landmarks[1];
        faceStatus.isCentered = nose.x > 0.4 && nose.x < 0.6 && nose.y > 0.4 && nose.y < 0.6;
        drawConnectors(canvasCtx, landmarks, FACEMESH_TESSELATION, { color: '#C0C0C070', lineWidth: 1 });
    } else {
        faceStatus.isCentered = false;
    }
    faceStatus.isReady = faceStatus.isFaceDetected && faceStatus.isCentered;
    canvasCtx.restore();
}

const faceMesh = new FaceMesh({ locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}` });
faceMesh.setOptions({ maxNumFaces: 1, refineLandmarks: true, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 });
faceMesh.onResults(onResults);

// --- Main Application Flow ---
async function sendToMediaPipe() {
    if (isCaptureDone || !video.srcObject) return;

    if (!video.paused && !video.ended) {
        await faceMesh.send({ image: video });
        updateFeedback();
    }
    requestAnimationFrame(sendToMediaPipe);
}

function updateFeedback() {
    if (isCaptureDone) return;

    if (!faceStatus.isFaceDetected || !faceStatus.isCentered) {
        overlay.classList.remove('correct-position');
        statusText.textContent = faceStatus.isFaceDetected ? "Please center your face in the oval." : "Please show your face.";
        clearTimeout(readyToCaptureTimer);
        readyToCaptureTimer = null;
    } else {
        statusText.textContent = "Perfect! Hold still...";
        overlay.classList.add('correct-position');
        if (!readyToCaptureTimer) {
            readyToCaptureTimer = setTimeout(captureAndEmbed, CAPTURE_DELAY_MS);
        }
    }
}

// --- Capture and Embedding Function (Corrected) ---
async function captureAndEmbed() {
    if (isCaptureDone) return;
    isCaptureDone = true;
    statusText.textContent = "Processing...";

    try {
        // Ensure video metadata is loaded
        if (video.videoWidth === 0 || video.videoHeight === 0) {
            await new Promise(resolve => {
                video.addEventListener('loadedmetadata', resolve, { once: true });
            });
        }

        // Match canvas to video
        canvasElement.width = video.videoWidth;
        canvasElement.height = video.videoHeight;

        // Draw frame
        canvasCtx.drawImage(video, 0, 0, canvasElement.width, canvasElement.height);

        console.log('Canvas size:', canvasElement.width, canvasElement.height);

        // Run face detection
        console.log('Running face detection...');
        const detection = await faceapi
            .detectSingleFace(canvasElement, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.3 }))
            .withFaceLandmarks()
            .withFaceDescriptor();

        console.log('Detection result:', detection);

        if (!detection) {
            throw new Error("No face detected. Please try again with your face clearly visible.");
        }

        // Validate bounding box to prevent the null error
        if (!detection.detection?.box ||
            detection.detection.box.x == null ||
            detection.detection.box.y == null ||
            detection.detection.box.width == null ||
            detection.detection.box.height == null) {
            throw new Error("Face detected but bounding box is invalid.");
        }

        // ✅ CALL saveFaceData HERE - after successful detection
        console.log('Valid detection found:', detection.detection.box);

        // Stop camera after successful detection
        video.srcObject.getTracks().forEach(track => track.stop());
        video.style.display = 'none';

        // Save the face data
        saveFaceData(detection);

        // Use it in your captureAndEmbed function:
        if (detection) {
            const confidence = detection.detection.score;
            const isValid = validateFaceData(detection);
            if (isValid) {
                console.log('✅ Face registration is VALID and ready to save!');
                statusText.textContent = "Face registered successfully!";
                confidenceScore.textContent=`ConfideceScore is ${(confidence*100).toFixed(2)} %`;
                // Now save the data
                // saveFaceData(detection);
            } else {
                console.log('⚠️ Face quality could be better. Try again?');
                statusText.textContent = "Face quality low. Please try again with better lighting.";
                isCaptureDone = false;
            }
        }

    } catch (error) {
        console.error("Error during face detection:", error);
        statusText.textContent = `An error occurred: ${error.message}`;
        isCaptureDone = false; // Let them retry

        // Restart the face detection process
        if (video.srcObject) {
            setTimeout(() => {
                statusText.textContent = "Position your face in the oval and hold still.";
                sendToMediaPipe();
            }, 2000);
        }
    }

}


// Add this after successful face detection in captureAndEmbed()
function validateFaceData(detection) {
    const confidence = detection.detection.score;
    const descriptor = detection.descriptor;
    const landmarks = detection.landmarks.positions;

    console.log('=== FACE REGISTRATION VALIDATION ===');
    console.log('Confidence Score:', confidence.toFixed(3));
    console.log('Descriptor Length:', descriptor.length);
    console.log('Landmarks Count:', landmarks.length);

    // Quality checks
    const isHighQuality = confidence > 0.7;
    const hasValidDescriptor = descriptor.length === 128;
    const hasAllLandmarks = landmarks.length === 68;

    console.log('Quality Checks:');
    console.log('- High Confidence:', isHighQuality ? '✅' : '⚠️');
    console.log('- Valid Descriptor:', hasValidDescriptor ? '✅' : '❌');
    console.log('- All Landmarks:', hasAllLandmarks ? '✅' : '❌');

    return isHighQuality && hasValidDescriptor && hasAllLandmarks;
}
// --- Add these functions after captureAndEmbed() ---

function saveFaceData(detection) {
    const faceData = {
        descriptor: Array.from(detection.descriptor),
        confidence: detection.detection.score,
        timestamp: new Date().toISOString(),
        landmarks: detection.landmarks.positions.map(p => ({ x: p.x, y: p.y }))
    };

    const studentId = localStorage.getItem('rollno');
    if (studentId) {
        localStorage.setItem(`face_${studentId}`, JSON.stringify(faceData));
        console.log('Face data saved for student:', studentId);

        // Show test button after successful registration
        document.getElementById('testButton').style.display = 'inline-block';

        sendToBackend(studentId, faceData);
    }
}


async function sendToBackend(studentId, faceData) {
    try {
        const response = await fetch('/api/register-face', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                studentId: studentId,
                faceDescriptor: faceData.descriptor,
                confidence: faceData.confidence,
                timestamp: faceData.timestamp
            })
        });

        if (response.ok) {
            statusText.textContent = "Face registered and saved successfully!";
        } else {
            throw new Error('Failed to save to server');
        }
    } catch (error) {
        console.error('Error saving to backend:', error);
        statusText.textContent = "Saved locally. Server unavailable.";
    }
}

async function testRecognition(currentDetection, studentId) {
    try {
        const currentDescriptor = Array.from(currentDetection.descriptor);
        const savedData = JSON.parse(localStorage.getItem(`face_${studentId}`));

        if (!savedData) {
            console.log('No saved face data found for student:', studentId);
            return false;
        }

        const savedDescriptor = savedData.descriptor;

        // Calculate similarity (Euclidean distance)
        const distance = faceapi.euclideanDistance(currentDescriptor, savedDescriptor);
        const similarity = 1 - distance; // Convert to similarity score (0 to 1)

        console.log('Recognition Test:');
        console.log('Distance:', distance.toFixed(3));
        console.log('Similarity:', (similarity * 100).toFixed(2) + "%");
        console.log('Match:', similarity >= 0.7 ? '✅ MATCH' : '❌ NO MATCH');

        // Match only if similarity >= 80%
        return similarity >= 0.7;
    } catch (error) {
        console.error('Error in face recognition test:', error);
        return false;
    }
}


// --- Initialization ---
startButton.addEventListener('click', async () => {
    startButton.style.display = 'none';
    statusText.textContent = "Loading models...";
    await Promise.all([
        faceMesh.initialize(),
        loadFaceAPIModels()
    ]);
    statusText.textContent = "Starting camera...";
    startCamera();
});
function startCamera() {
    navigator.mediaDevices.getUserMedia({
        video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: 'user' // Use front camera
        }
    })
        .then(stream => {
            video.srcObject = stream;
            video.addEventListener('loadedmetadata', () => {
                // Ensure canvas is properly sized when video metadata loads
                canvasElement.width = video.videoWidth;
                canvasElement.height = video.videoHeight;
                console.log('Video dimensions:', video.videoWidth, video.videoHeight);
            });

            video.addEventListener('playing', () => {
                sendToMediaPipe();
            });
        })
        .catch(err => {
            console.error("Error accessing camera: ", err);
            statusText.textContent = "Could not access the camera. Please grant permission.";
        });
}


// Add this near your other event listeners
const testButton = document.getElementById('testButton');

testButton.addEventListener('click', async () => {
    const studentId = prompt("Enter Student ID to test:");
    if (!studentId) return;

    statusText.textContent = "Starting recognition test...";
    testButton.style.display = 'none';
    startButton.style.display = 'none';

    try {
        // Start camera for recognition test
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
        video.srcObject = stream;
        video.style.display = 'block';

        video.addEventListener('playing', async () => {
            // Wait a moment for video to stabilize
            setTimeout(async () => {
                // Capture current frame
                canvasElement.width = video.videoWidth;
                canvasElement.height = video.videoHeight;
                canvasCtx.drawImage(video, 0, 0, canvasElement.width, canvasElement.height);

                // Run face detection
                const detection = await faceapi
                    .detectSingleFace(canvasElement, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.3 }))
                    .withFaceLandmarks()
                    .withFaceDescriptor();

                if (detection) {
                    const isMatch = await testRecognition(detection, studentId);
                    statusText.textContent = isMatch ?
                        `✅ Recognition SUCCESS for ${studentId}!` :
                        `❌ Recognition FAILED for ${studentId}`;
                } else {
                    statusText.textContent = "No face detected in test";
                }

                // Stop camera
                video.srcObject.getTracks().forEach(track => track.stop());
                video.style.display = 'none';

                // Show buttons again
                setTimeout(() => {
                    startButton.style.display = 'inline-block';
                    testButton.style.display = 'inline-block';
                }, 2000);

            }, 2000);
        });

    } catch (error) {
        console.error('Recognition test error:', error);
        statusText.textContent = "Recognition test failed";
        startButton.style.display = 'inline-block';
        testButton.style.display = 'inline-block';
    }
});
