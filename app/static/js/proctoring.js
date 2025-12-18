/**
 * AI Proctoring Client Module
 * Tracks suspicious behavior and sends alerts to Redis via backend
 */

// import { FaceMesh } from '@mediapipe/face_mesh';
// import { Camera } from '@mediapipe/camera_utils';

export class ProctoringClient {
    constructor(questionPaperId, studentId, studentName, livekitUrl) {
        this.questionPaperId = questionPaperId;
        this.studentId = studentId;
        this.studentName = studentName;
        this.livekitUrl = livekitUrl;

        // Alert counters and tracking
        this.alerts = {
            faceNotDetected: 0,
            multipleFaces: 0,
            lookingAway: 0,
            lookingLeft: 0,
            lookingRight: 0,
            lookingDown: 0,
            tabSwitch: 0,
            windowBlur: 0,
            suspiciousMouth: 0,
            headTurned: 0,
            personLeft: 0
        };

        // State tracking
        this.lastFaceDetectedTime = Date.now();
        this.consecutiveNoFaceFrames = 0;
        this.gazeAwayStartTime = null;
        this.currentGazeDirection = 'center';
        this.gazeDirectionDurations = {
            left: 0,
            right: 0,
            down: 0,
            center: 0
        };

        // Audio detection
        this.audioContext = null;
        this.analyser = null;
        this.isAudioSetup = false;
        this.talkingThreshold = -50; // dB
        this.talkingStartTime = null;
        this.totalTalkingDuration = 0;

        // Session info
        this.sessionStartTime = Date.now();
        this.lastAlertSentTime = 0;
        this.alertThrottleMs = 2000; // Send alerts max every 2 seconds

        this.faceMesh = null;
        this.camera = null;
        this.room = null;
        this.fullLogs = []; // Store all alerts for final submission
        this.isDestroyed = false;

        // Bind exit handler
        this.handleExit = this.sendFinalLogs.bind(this);
        window.addEventListener('beforeunload', this.handleExit);
        window.addEventListener('unload', this.handleExit);
    }

    async initialize() {
        console.log("🎥 Initializing AI Proctoring System");

        // Setup video proctoring
        await this.setupVideoProctoring();

        // Setup audio monitoring
        await this.setupAudioMonitoring();

        // Setup tab/window monitoring
        this.setupTabWindowMonitoring();

        // Setup LiveKit streaming
        await this.setupLiveKitStreaming();

        // Start periodic alert sync
        this.startAlertSync();

        console.log("✅ Proctoring System Active");
    }

    async setupVideoProctoring() {
        const videoElement = document.getElementById('proctoring-video');
        const statusElement = document.getElementById('proctoring-status');

        if (!videoElement) {
            console.error("Video element not found");
            return;
        }

        // Initialize MediaPipe FaceMesh
        this.faceMesh = new FaceMesh({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
            }
        });

        this.faceMesh.setOptions({
            maxNumFaces: 2, // Detect up to 2 faces to catch cheating
            refineLandmarks: true,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        });

        this.faceMesh.onResults((results) => {
            this.processFaceResults(results, statusElement);
        });

        // Setup Camera
        this.camera = new Camera(videoElement, {
            onFrame: async () => {
                await this.faceMesh.send({ image: videoElement });
            },
            width: 640,
            height: 480
        });

        await this.camera.start();
    }

    processFaceResults(results, statusElement) {
        if (this.isDestroyed) return;
        const now = Date.now();

        // Check for no face detected
        if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
            this.consecutiveNoFaceFrames++;

            // Alert after 1 second of no face (assuming 30fps = 30 frames)
            if (this.consecutiveNoFaceFrames > 30) {
                this.recordAlert('faceNotDetected', {
                    duration: now - this.lastFaceDetectedTime,
                    severity: 'high'
                });

                if (statusElement) {
                    statusElement.innerText = "⚠️ Warning: Face not detected!";
                    statusElement.classList.add('text-red-500');
                }
            }

            // Check if person left completely (no face for 5 seconds)
            if (this.consecutiveNoFaceFrames > 150) {
                this.recordAlert('personLeft', {
                    duration: now - this.lastFaceDetectedTime,
                    severity: 'critical'
                });
            }
            return;
        }

        // Face detected - reset counters
        this.consecutiveNoFaceFrames = 0;
        this.lastFaceDetectedTime = now;

        if (statusElement) {
            statusElement.classList.remove('text-red-500');
            statusElement.innerText = "✓ AI Proctoring Active";
        }

        // Check for multiple faces
        if (results.multiFaceLandmarks.length > 1) {
            this.recordAlert('multipleFaces', {
                faceCount: results.multiFaceLandmarks.length,
                severity: 'critical'
            });
        }

        // Analyze primary face
        const landmarks = results.multiFaceLandmarks[0];
        this.analyzeGaze(landmarks);
        this.analyzeHeadPose(landmarks);
        // this.analyzeMouthCovering(landmarks);
    }

    analyzeGaze(landmarks) {
        // Eye landmarks
        const leftEyeInner = landmarks[133];
        const leftEyeOuter = landmarks[33];
        const rightEyeInner = landmarks[362];
        const rightEyeOuter = landmarks[263];

        // Iris landmarks
        const leftIris = landmarks[468]; // Center of left iris
        const rightIris = landmarks[473]; // Center of right iris

        // Calculate gaze direction based on iris position relative to eye corners
        const leftGazeX = (leftIris.x - leftEyeInner.x) / (leftEyeOuter.x - leftEyeInner.x);
        const rightGazeX = (rightIris.x - rightEyeInner.x) / (rightEyeOuter.x - rightEyeInner.x);
        const avgGazeX = (leftGazeX + rightGazeX) / 2;

        // Vertical gaze
        const leftEyeTop = landmarks[159];
        const leftEyeBottom = landmarks[145];
        const leftGazeY = (leftIris.y - leftEyeTop.y) / (leftEyeBottom.y - leftEyeTop.y);

        let gazeDirection = 'center';
        let severity = 'medium';

        // Determine gaze direction
        if (avgGazeX < 0.3) {
            gazeDirection = 'left';
            this.recordAlert('lookingAway', { direction: 'left', gazeX: avgGazeX, severity });
        } else if (avgGazeX > 0.7) {
            gazeDirection = 'right';
            this.recordAlert('lookingAway', { direction: 'right', gazeX: avgGazeX, severity });
        } else if (leftGazeY > 0.6) {
            gazeDirection = 'down';
            this.recordAlert('lookingAway', { direction: 'down', gazeY: leftGazeY, severity });
        }

        // Track gaze duration
        if (gazeDirection !== this.currentGazeDirection) {
            this.currentGazeDirection = gazeDirection;
            this.gazeAwayStartTime = Date.now();
        } else if (gazeDirection !== 'center') {
            const duration = Date.now() - this.gazeAwayStartTime;
            this.gazeDirectionDurations[gazeDirection] += 33; // ~30fps = 33ms per frame

            // Alert if looking away for more than 3 seconds
            if (duration > 3000) {
                this.recordAlert('lookingAwayExtended', {
                    direction: gazeDirection,
                    duration: duration,
                    severity: 'high'
                });
            }
        }
    }

    analyzeHeadPose(landmarks) {
        // Use nose, forehead, and chin to estimate head rotation
        const noseTip = landmarks[1];
        const forehead = landmarks[10];
        const chin = landmarks[152];
        const leftCheek = landmarks[234];
        const rightCheek = landmarks[454];

        // Calculate horizontal rotation (yaw)
        const faceWidth = Math.abs(rightCheek.x - leftCheek.x);
        const noseCenterOffset = noseTip.x - ((leftCheek.x + rightCheek.x) / 2);
        const rotationRatio = Math.abs(noseCenterOffset) / faceWidth;

        // Head turned significantly
        if (rotationRatio > 0.2) {
            const direction = noseCenterOffset > 0 ? 'right' : 'left';
            this.recordAlert('headTurned', {
                direction: direction,
                ratio: rotationRatio,
                severity: 'high'
            });
        }
    }

    analyzeMouthCovering(landmarks) {
        // Upper and lower lip landmarks
        const upperLip = landmarks[13];
        const lowerLip = landmarks[14];
        const leftMouth = landmarks[61];
        const rightMouth = landmarks[291];

        // Hand landmarks would require MediaPipe Hands
        // For now, we'll detect if mouth area is obscured based on visibility
        const mouthHeight = Math.abs(lowerLip.y - upperLip.y);
        const mouthWidth = Math.abs(rightMouth.x - leftMouth.x);

        // Unusually small mouth area might indicate covering
        if (mouthHeight < 0.01 || mouthWidth < 0.02) {
            this.recordAlert('suspiciousMouth', {
                height: mouthHeight,
                width: mouthWidth,
                severity: 'medium'
            });
        }
    }

    async setupAudioMonitoring() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: false
            });

            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.analyser = this.audioContext.createAnalyser();
            const microphone = this.audioContext.createMediaStreamSource(stream);

            this.analyser.fftSize = 512;
            microphone.connect(this.analyser);

            this.isAudioSetup = true;
            this.monitorAudioLevels();

            console.log("🎤 Audio monitoring active");
        } catch (error) {
            console.error("Failed to setup audio monitoring:", error);
        }
    }

    monitorAudioLevels() {
        if (!this.isAudioSetup || this.isDestroyed) return;

        const dataArray = new Uint8Array(this.analyser.frequencyBinCount);

        const checkAudio = () => {
            if (this.isDestroyed) return;
            this.analyser.getByteFrequencyData(dataArray);

            // Calculate average volume
            const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
            const decibels = 20 * Math.log10(average / 255);

            // Check if talking
            if (decibels > this.talkingThreshold) {
                if (!this.talkingStartTime) {
                    this.talkingStartTime = Date.now();
                }

                const talkingDuration = Date.now() - this.talkingStartTime;
                this.totalTalkingDuration += 100; // Add 100ms

                // Alert if talking for more than 2 seconds
                if (talkingDuration > 2000) {
                    this.recordAlert('talking', {
                        duration: talkingDuration,
                        decibels: decibels,
                        severity: 'high'
                    });
                }
            } else {
                this.talkingStartTime = null;
            }

            setTimeout(checkAudio, 100); // Check every 100ms
        };

        checkAudio();
    }

    setupTabWindowMonitoring() {
        // Detect tab switches
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.recordAlert('tabSwitch', {
                    timestamp: Date.now(),
                    severity: 'high'
                });
            }
        });

        // Detect window blur (user clicked outside)
        window.addEventListener('blur', () => {
            this.recordAlert('windowBlur', {
                timestamp: Date.now(),
                severity: 'high'
            });
        });

        // Detect fullscreen exit
        document.addEventListener('fullscreenchange', () => {
            if (!document.fullscreenElement) {
                this.recordAlert('exitedFullscreen', {
                    timestamp: Date.now(),
                    severity: 'medium'
                });
            }
        });

        // Detect right-click (potential copying)
        document.addEventListener('contextmenu', (e) => {
            this.recordAlert('rightClick', {
                timestamp: Date.now(),
                severity: 'low'
            });
        });

        // Detect copy/paste attempts
        document.addEventListener('copy', () => {
            this.recordAlert('copyAttempt', {
                timestamp: Date.now(),
                severity: 'medium'
            });
        });

        document.addEventListener('paste', () => {
            this.recordAlert('pasteAttempt', {
                timestamp: Date.now(),
                severity: 'high'
            });
        });

        console.log("👁️ Tab/Window monitoring active");
    }

    async setupLiveKitStreaming() {
        try {
            const tokenResponse = await fetch(
                `/proctoring/token?room=exam-${this.questionPaperId}&identity=${this.studentId}&name=${encodeURIComponent(this.studentName)}`
            );
            const { token } = await tokenResponse.json();

            if (token && window.LivekitClient) {
                this.room = new LivekitClient.Room();
                await this.room.connect(this.livekitUrl, token);

                // Publish local video and audio
                await this.room.localParticipant.enableCameraAndMicrophone();

                console.log("📡 Connected to LiveKit room:", this.room.name);
            }
        } catch (err) {
            console.error("LiveKit connection failed:", err);
        }
    }

    recordAlert(type, metadata = {}) {
        const now = Date.now();

        // Increment counter
        if (this.alerts[type] !== undefined) {
            this.alerts[type]++;
        } else {
            this.alerts[type] = 1;
        }

        const alertItem = {
            type,
            timestamp: now,
            metadata: {
                ...metadata,
                studentName: this.studentName,
                studentId: this.studentId
            }
        };

        // Add to full logs
        this.fullLogs.push(alertItem);

        // Send real-time update via LiveKit Data Channel
        this.broadcastAlert(alertItem);

        // Throttle actual sending to backend REST API
        if (now - this.lastAlertSentTime < this.alertThrottleMs) {
            return;
        }

        this.lastAlertSentTime = now;

        // Send to backend
        this.sendAlertToBackend(type, metadata);
    }

    async broadcastAlert(alertItem) {
        if (!this.room || !this.room.localParticipant) return;

        try {
            const encoder = new TextEncoder();
            const data = encoder.encode(JSON.stringify({
                type: 'PROCTORING_ALERT',
                alert: alertItem,
                summary: this.getAlertSummary()
            }));

            await this.room.localParticipant.publishData(data, LivekitClient.DataPacket_Kind.RELIABLE);
        } catch (err) {
            console.warn("Failed to broadcast alert via LiveKit:", err);
        }
    }

    async sendAlertToBackend(type, metadata) {
        try {
            const alertData = {
                questionPaperId: this.questionPaperId,
                studentId: this.studentId,
                studentName: this.studentName,
                alertType: type,
                timestamp: Date.now(),
                metadata: metadata,
                sessionStartTime: this.sessionStartTime,
                allAlerts: this.alerts,
                gazeDurations: this.gazeDirectionDurations,
                totalTalkingDuration: this.totalTalkingDuration
            };

            await fetch('/proctoring/alert', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(alertData)
            });
        } catch (error) {
            console.error("Failed to send alert:", error);
        }
    }

    sendFinalLogs() {
        if (this.fullLogs.length === 0 || this.isDestroyed) return;

        const data = {
            question_paper_id: this.questionPaperId,
            student_id: this.studentId,
            logs: this.fullLogs,
            summary: this.getAlertSummary(),
            endTime: Date.now()
        };

        const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });

        // Try Beacon first for reliability
        if (navigator.sendBeacon) {
            navigator.sendBeacon('/proctoring/save-logs', blob);
        } else {
            // Fallback to fetch with keepalive
            fetch('/proctoring/save-logs', {
                method: 'POST',
                body: blob,
                keepalive: true
            });
        }

        this.isDestroyed = true;
    }

    startAlertSync() {
        // Sync full alert state every 10 seconds
        setInterval(() => {
            if (this.isDestroyed) return;
            this.sendAlertToBackend('sync', {
                allAlerts: this.alerts,
                gazeDurations: this.gazeDirectionDurations,
                totalTalkingDuration: this.totalTalkingDuration,
                sessionDuration: Date.now() - this.sessionStartTime
            });
        }, 10000);
    }

    getAlertSummary() {
        return {
            alerts: this.alerts,
            gazeDurations: this.gazeDirectionDurations,
            totalTalkingDuration: this.totalTalkingDuration,
            sessionDuration: Date.now() - this.sessionStartTime
        };
    }

    destroy() {
        this.sendFinalLogs();
        this.isDestroyed = true;

        if (this.camera) {
            this.camera.stop();
        }
        if (this.audioContext) {
            this.audioContext.close();
        }
        if (this.room) {
            this.room.disconnect();
        }

        window.removeEventListener('beforeunload', this.handleExit);
        window.removeEventListener('unload', this.handleExit);
    }
}

// Export initialization function
export async function initAIProctoring(questionPaperId, studentId, studentName, livekitUrl) {
    const client = new ProctoringClient(questionPaperId, studentId, studentName, livekitUrl);
    await client.initialize();
    return client;
}