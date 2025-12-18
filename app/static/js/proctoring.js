/**
 * AI Proctoring Module
 * Uses MediaPipe for local analysis and LiveKit for video relay.
 */

export async function initAIProctoring(questionPaperId, livekitUrl, studentName) {
    console.log("Initializing AI Proctoring for Question Paper:", questionPaperId);

    const videoElement = document.getElementById('proctoring-video');
    const canvasElement = document.getElementById('proctoring-canvas');
    const statusElement = document.getElementById('proctoring-status');

    // 1. Initialize MediaPipe FaceMesh
    const faceMesh = new FaceMesh({
        locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
        }
    });

    faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
    });

    faceMesh.onResults((results) => {
        onResults(results, statusElement);
    });

    // 2. Setup Camera
    const camera = new Camera(videoElement, {
        onFrame: async () => {
            await faceMesh.send({ image: videoElement });
        },
        width: 640,
        height: 480
    });
    camera.start();

    // 3. Connect to LiveKit
    try {
        const tokenResponse = await fetch(`/proctoring/token?room=exam-${questionPaperId}&identity=${encodeURIComponent(studentName)}`);
        const { token } = await tokenResponse.json();

        if (token) {
            const room = new LivekitClient.Room();
            await room.connect(livekitUrl, token);
            console.log('Connected to LiveKit room:', room.name);

            // Publish local video track
            await room.localParticipant.enableCameraAndMicrophone();
            statusElement.innerText = "Proctoring Active & Streaming";
        }
    } catch (err) {
        console.error("LiveKit connection failed:", err);
        statusElement.innerText = "Proctoring Local Only (Relay Failed)";
    }
}

function onResults(results, statusElement) {
    if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
        statusElement.innerText = "Warning: Face not detected!";
        statusElement.classList.add('text-red-500');
        return;
    }

    statusElement.classList.remove('text-red-500');
    statusElement.innerText = "AI Proctoring Active";

    const landmarks = results.multiFaceLandmarks[0];

    // Basic Gaze Tracking Logic (Simplified)
    // Check if iris landmarks are within reasonable bounds
    const leftIris = landmarks[468]; // Center of left iris
    const rightIris = landmarks[473]; // Center of right iris

    // Logic to detect looking away would go here
    // e.g. if absolute position of iris is too far from center relative to head pose
}
