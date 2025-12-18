/**
 * Identity Verification and Face Enrollment Logic
 */

function initIdentityVerification(config) {
    const video = document.getElementById('webcam');
    const canvas = document.getElementById('canvas');
    const btnVerify = document.getElementById('btn-verify');
    const overlay = document.getElementById('capture-overlay');
    const enrollProgress = document.getElementById('enroll-progress');
    const btnText = document.getElementById('btn-text');
    const failModal = document.getElementById('fail-modal');
    const failReason = document.getElementById('fail-reason');

    let isEnrolling = false;
    let enrollmentImages = [];
    const MAX_ENROLL_IMAGES = 3;

    // Start Webcam
    async function startCamera() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'user',
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            });
            video.srcObject = stream;
        } catch (err) {
            console.error("Error accessing webcam:", err);
            alert("Webcam access is required for identity verification. Please enable it in your browser settings.");
        }
    }

    function captureBase64() {
        const context = canvas.getContext('2d');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
    }

    async function handleVerify() {
        overlay.classList.remove('hidden');
        const imageBase64 = captureBase64();

        try {
            const response = await fetch('/proctoring/verify-identity', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    candidate_id: config.studentId,
                    image_base64: imageBase64,
                    timestamp: new Date().toISOString(),
                    trigger: 'exam_entry'
                })
            });

            const result = await response.json();

            if (response.status === 404 || (result.message && result.message.toLowerCase().includes('not found'))) {
                // Not enrolled - show admin contact box
                document.getElementById('not-enrolled-box').classList.remove('hidden');
                document.getElementById('guidance-box').classList.add('hidden');
                btnVerify.classList.add('hidden');
                return;
            }

            if (result.match) {
                // Success!
                await setVerifiedAndRedirect();
            } else {
                const errorMsg = result.detail || result.error || "Face match failed. Please ensure you are looking directly at the camera and your face is well-lit.";
                showFailure(errorMsg);
            }
        } catch (err) {
            console.error("Verification error:", err);
            showFailure("Connection error. Please try again.");
        } finally {
            overlay.classList.add('hidden');
        }
    }

    async function setVerifiedAndRedirect() {
        await fetch('/proctoring/set-verified', { method: 'POST' });
        window.location.href = config.redirectUrl;
    }

    function showFailure(reason) {
        failReason.textContent = reason;
        failModal.classList.remove('hidden');
    }

    btnVerify.addEventListener('click', () => {
        if (isEnrolling) {
            handleEnrollStep();
        } else {
            handleVerify();
        }
    });

    startCamera();
}
