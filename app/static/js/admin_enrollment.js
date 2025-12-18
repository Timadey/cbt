/**
 * Admin Enrollment Logic
 */

function initAdminEnrollment(config) {
    const video = document.getElementById('webcam');
    const canvas = document.getElementById('canvas');
    const btnCapture = document.getElementById('btn-capture');
    const btnReset = document.getElementById('btn-reset');
    const btnText = document.getElementById('btn-text');
    const successOverlay = document.getElementById('success-overlay');
    const statusMessage = document.getElementById('status-message');

    let enrollmentImages = [];
    const steps = [
        "Capture Base Portrait",
        "Capture Left Angle",
        "Capture Right Angle"
    ];

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
            showStatus("Webcam access failed. Please ensure permissions are granted.", "error");
        }
    }

    function captureBase64() {
        const context = canvas.getContext('2d');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Show in preview
        const stepNum = enrollmentImages.length + 1;
        const previewImg = document.getElementById(`preview-${stepNum}`);
        const placeholder = document.getElementById(`placeholder-${stepNum}`);
        const progressBar = document.getElementById(`progress-${stepNum}`);

        const base64 = canvas.toDataURL('image/jpeg', 0.8);
        previewImg.src = base64;
        previewImg.classList.remove('hidden');
        placeholder.classList.add('hidden');
        progressBar.style.width = '100%';

        return base64.split(',')[1];
    }

    async function handleCapture() {
        if (enrollmentImages.length >= 3) return;

        showStatus("", "hide");
        const base64 = captureBase64();

        enrollmentImages.push({
            image_base64: base64,
            capture_timestamp: new Date().toISOString(),
            device_info: { role: 'admin_enrolled', browser: navigator.userAgent }
        });

        btnReset.classList.remove('hidden');

        if (enrollmentImages.length < 3) {
            btnText.textContent = steps[enrollmentImages.length];
        } else {
            submitEnrollment();
        }
    }

    async function submitEnrollment() {
        btnCapture.disabled = true;
        btnText.textContent = "Processing Enrollment...";

        try {
            const response = await fetch('/proctoring/enroll', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    candidate_id: config.studentId,
                    images: enrollmentImages,
                    metadata: {
                        enrolled_by_admin: true,
                        student_name: config.studentName
                    }
                })
            });

            const result = await response.json();

            if (response.ok && result.status === 'success') {
                successOverlay.classList.remove('hidden');
            } else {
                const errorMsg = result.detail || result.error || result.message || "Enrollment failed. Please try again.";
                showStatus(errorMsg, "error");
                btnCapture.disabled = false;
                btnText.textContent = "Retry Final Submission";
            }
        } catch (err) {
            showStatus("Connection error during enrollment.", "error");
            btnCapture.disabled = false;
        }
    }

    function resetEnrollment() {
        enrollmentImages = [];
        btnCapture.disabled = false;
        btnText.textContent = steps[0];
        btnReset.classList.add('hidden');
        showStatus("", "hide");

        for (let i = 1; i <= 3; i++) {
            document.getElementById(`preview-${i}`).classList.add('hidden');
            document.getElementById(`placeholder-${i}`).classList.remove('hidden');
            document.getElementById(`progress-${i}`).style.width = '0%';
        }
    }

    function showStatus(text, type) {
        if (type === 'hide') {
            statusMessage.classList.add('hidden');
            return;
        }
        statusMessage.classList.remove('hidden');
        const p = statusMessage.querySelector('p');
        p.textContent = text;

        if (type === 'error') {
            statusMessage.className = "mt-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-2xl transition-all duration-300";
            p.className = "text-[11px] text-red-700 dark:text-red-400 font-bold leading-relaxed";
        }
    }

    btnCapture.addEventListener('click', handleCapture);
    btnReset.addEventListener('click', resetEnrollment);

    startCamera();
}
