/**
 * Enhanced AI Proctoring Client Module
 * Advanced detection using MediaPipe Holistic (Face + Hands + Pose)
 * Accurate mouth movement tracking and multi-modal suspicious behavior detection
 */

export class EnhancedProctoringClient {
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
            lookingUp: 0,
            tabSwitch: 0,
            windowBlur: 0,
            suspiciousMouth: 0,
            headTurned: 0,
            personLeft: 0,
            talkingDetected: 0,
            handNearFace: 0,
            handCoveringFace: 0,
            phoneDetected: 0,
            objectNearFace: 0,
            multiplePersons: 0,
            poorLighting: 0,
            cameraObstructed: 0,
            suspiciousGesture: 0,
            eyesClosed: 0,
            mouthMovement: 0,
            audioVisualMismatch: 0
        };

        // Enhanced state tracking
        this.lastFaceDetectedTime = Date.now();
        this.consecutiveNoFaceFrames = 0;
        this.gazeAwayStartTime = null;
        this.currentGazeDirection = 'center';
        this.gazeDirectionDurations = {
            left: 0,
            right: 0,
            down: 0,
            up: 0,
            center: 0
        };

        // Mouth movement tracking
        this.mouthOpenHistory = [];
        this.mouthMovementHistory = [];
        this.isTalkingByMouth = false;
        this.talkingByMouthStartTime = null;
        this.mouthTalkingDuration = 0;
        this.lipDistanceHistory = [];
        this.jawOpenHistory = [];

        // Hand tracking
        this.handNearFaceStartTime = null;
        this.lastHandPositions = { left: null, right: null };
        this.handMovementHistory = [];
        this.suspiciousHandGestures = 0;

        // Eye tracking
        this.eyeAspectRatioHistory = [];
        this.eyesClosedStartTime = null;
        this.blinkCount = 0;
        this.lastBlinkTime = 0;

        // Audio detection
        this.audioContext = null;
        this.analyser = null;
        this.isAudioSetup = false;
        this.talkingThreshold = -50; // dB
        this.audioTalkingStartTime = null;
        this.audioTalkingDuration = 0;
        this.audioLevelHistory = [];

        // Lighting and quality
        this.brightnessHistory = [];
        this.frameQualityHistory = [];

        // Session info
        this.sessionStartTime = Date.now();
        this.lastAlertSentTime = 0;
        this.alertThrottleMs = 1000; // Send alerts max every 1 second
        this.frameCount = 0;
        this.fps = 30;

        // MediaPipe components
        this.holistic = null;
        this.camera = null;
        this.room = null;
        this.fullLogs = [];
        this.isDestroyed = false;
        this.isInitialized = false;

        // Canvas for visual feedback (optional)
        this.debugCanvas = null;
        this.debugCtx = null;

        // Tracking for sustained look away
        this.sustainedLookAwayTriggered = false;

        // Bind exit handler
        this.handleExit = () => this.sendFinalLogs();
        window.addEventListener('beforeunload', this.handleExit);
        window.addEventListener('unload', this.handleExit);
    }

    async initialize() {
        console.log("🎥 Initializing Enhanced AI Proctoring System");

        try {
            // Setup video proctoring with holistic detection
            await this.setupHolisticProctoring();

            // Setup audio monitoring
            await this.setupAudioMonitoring();

            // Setup tab/window monitoring
            this.setupTabWindowMonitoring();

            // Setup keyboard monitoring
            this.setupKeyboardMonitoring();

            // Setup LiveKit streaming
            await this.setupLiveKitStreaming();

            // Start periodic alert sync
            this.startAlertSync();

            // Start audio-visual correlation check
            this.startAudioVisualCorrelation();

            this.isInitialized = true;
            console.log("✅ Enhanced Proctoring System Active");
        } catch (error) {
            console.error("❌ Failed to initialize proctoring system:", error);
            throw error;
        }
    }

    async setupHolisticProctoring() {
        const videoElement = document.getElementById('proctoring-video');
        const statusElement = document.getElementById('proctoring-status');

        if (!videoElement) {
            throw new Error("Video element not found");
        }

        // Setup optional debug canvas
        this.debugCanvas = document.getElementById('proctoring-debug-canvas');
        if (this.debugCanvas) {
            this.debugCanvas.width = 640;
            this.debugCanvas.height = 480;
            this.debugCtx = this.debugCanvas.getContext('2d');
        }

        // Initialize MediaPipe Holistic (Face + Hands + Pose)
        this.holistic = new Holistic({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`;
            }
        });

        this.holistic.setOptions({
            modelComplexity: 1,
            smoothLandmarks: true,
            enableSegmentation: false,
            smoothSegmentation: false,
            refineFaceLandmarks: true,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        });

        this.holistic.onResults((results) => {
            this.processHolisticResults(results, statusElement);
        });

        // Setup Camera
        this.camera = new Camera(videoElement, {
            onFrame: async () => {
                if (!this.isDestroyed) {
                    await this.holistic.send({ image: videoElement });
                }
            },
            width: 640,
            height: 480
        });

        await this.camera.start();
        console.log("📹 Holistic tracking initialized");
    }

    processHolisticResults(results, statusElement) {
        if (this.isDestroyed) return;

        this.frameCount++;
        const now = Date.now();

        // Draw debug visualization if canvas available
        if (this.debugCanvas && this.debugCtx) {
            this.drawDebugVisualization(results);
        }

        // Check frame quality and lighting
        this.analyzeFrameQuality(results);

        // Check for no face detected
        if (!results.faceLandmarks || results.faceLandmarks.length === 0) {
            this.handleNoFaceDetected(now, statusElement);
            return;
        }

        // Face detected - reset counters
        this.consecutiveNoFaceFrames = 0;
        this.lastFaceDetectedTime = now;

        if (statusElement) {
            statusElement.classList.remove('text-red-500');
            statusElement.innerText = "✓ AI Proctoring Active";
        }

        // Analyze face landmarks
        this.analyzeEnhancedGaze(results.faceLandmarks);
        this.analyzeHeadPose(results.faceLandmarks);
        this.analyzeEyeState(results.faceLandmarks);
        this.analyzeMouthMovement(results.faceLandmarks);
        this.detectMouthCovering(results.faceLandmarks);

        // Analyze hands if detected
        if (results.leftHandLandmarks || results.rightHandLandmarks) {
            this.analyzeHandActivity(
                results.leftHandLandmarks,
                results.rightHandLandmarks,
                results.faceLandmarks
            );
        }

        // Check for multiple persons using pose detection
        if (results.poseLandmarks) {
            this.analyzePoseForMultiplePersons(results.poseLandmarks);
        }
    }

    handleNoFaceDetected(now, statusElement) {
        this.consecutiveNoFaceFrames++;

        // Alert after 1 second of no face (30 frames at 30fps)
        if (this.consecutiveNoFaceFrames > this.fps) {
            this.recordAlert('faceNotDetected', {
                duration: now - this.lastFaceDetectedTime,
                severity: 'high',
                frames: this.consecutiveNoFaceFrames
            });

            if (statusElement) {
                statusElement.innerText = "⚠️ Warning: Face not detected!";
                statusElement.classList.add('text-red-500');
            }
        }

        // Check if person left completely (no face for 5 seconds)
        if (this.consecutiveNoFaceFrames > this.fps * 5) {
            this.recordAlert('personLeft', {
                duration: now - this.lastFaceDetectedTime,
                severity: 'critical',
                frames: this.consecutiveNoFaceFrames
            });
        }
    }

    analyzeFrameQuality(results) {
        // Analyze brightness using image data if available
        // This would require access to the video frame pixels
        // For now, we'll estimate based on landmark visibility

        if (results.faceLandmarks) {
            const visibilityScores = results.faceLandmarks
                .filter(lm => lm.visibility !== undefined)
                .map(lm => lm.visibility);

            if (visibilityScores.length > 0) {
                const avgVisibility = visibilityScores.reduce((a, b) => a + b) / visibilityScores.length;
                this.frameQualityHistory.push(avgVisibility);

                // Keep last 30 frames
                if (this.frameQualityHistory.length > 30) {
                    this.frameQualityHistory.shift();
                }

                // Alert on poor quality
                const avgQuality = this.frameQualityHistory.reduce((a, b) => a + b) / this.frameQualityHistory.length;
                if (avgQuality < 0.3) {
                    this.recordAlert('poorLighting', {
                        quality: avgQuality,
                        severity: 'medium'
                    });
                }
            }
        }
    }

    analyzeEnhancedGaze(landmarks) {
        // Enhanced gaze detection with iris tracking

        // Left eye landmarks
        const leftEyeInner = landmarks[133];
        const leftEyeOuter = landmarks[33];
        const leftEyeTop = landmarks[159];
        const leftEyeBottom = landmarks[145];

        // Right eye landmarks
        const rightEyeInner = landmarks[362];
        const rightEyeOuter = landmarks[263];
        const rightEyeTop = landmarks[386];
        const rightEyeBottom = landmarks[374];

        // Iris landmarks (if available with refineFaceLandmarks)
        const leftIris = landmarks[468]; // Center of left iris
        const rightIris = landmarks[473]; // Center of right iris

        if (!leftIris || !rightIris) return;

        // Calculate horizontal gaze
        const leftGazeX = (leftIris.x - leftEyeInner.x) / (leftEyeOuter.x - leftEyeInner.x);
        const rightGazeX = (rightIris.x - rightEyeInner.x) / (rightEyeOuter.x - rightEyeInner.x);
        const avgGazeX = (leftGazeX + rightGazeX) / 2;

        // Calculate vertical gaze
        const leftGazeY = (leftIris.y - leftEyeTop.y) / (leftEyeBottom.y - leftEyeTop.y);
        const rightGazeY = (rightIris.y - rightEyeTop.y) / (rightEyeBottom.y - rightEyeTop.y);
        const avgGazeY = (leftGazeY + rightGazeY) / 2;

        let gazeDirection = 'center';
        let severity = 'medium';

        // Determine gaze direction with stricter thresholds
        if (avgGazeX < 0.35) {
            gazeDirection = 'left';
            severity = avgGazeX < 0.25 ? 'high' : 'medium';
            this.recordAlert('lookingLeft', {
                direction: 'left',
                gazeX: avgGazeX.toFixed(3),
                severity
            });
        } else if (avgGazeX > 0.65) {
            gazeDirection = 'right';
            severity = avgGazeX > 0.75 ? 'high' : 'medium';
            this.recordAlert('lookingRight', {
                direction: 'right',
                gazeX: avgGazeX.toFixed(3),
                severity
            });
        } else if (avgGazeY > 0.65) {
            gazeDirection = 'down';
            severity = avgGazeY > 0.75 ? 'high' : 'medium';
            this.recordAlert('lookingDown', {
                direction: 'down',
                gazeY: avgGazeY.toFixed(3),
                severity
            });
        } else if (avgGazeY < 0.35) {
            gazeDirection = 'up';
            severity = avgGazeY < 0.25 ? 'high' : 'medium';
            this.recordAlert('lookingUp', {
                direction: 'up',
                gazeY: avgGazeY.toFixed(3),
                severity
            });
        }

        // Track gaze duration
        if (gazeDirection !== this.currentGazeDirection) {
            this.currentGazeDirection = gazeDirection;
            this.gazeAwayStartTime = Date.now();
            this.sustainedLookAwayTriggered = false; // Reset on change
        } else if (gazeDirection !== 'center') {
            const duration = Date.now() - this.gazeAwayStartTime;
            const frameDuration = 1000 / this.fps;
            this.gazeDirectionDurations[gazeDirection] += frameDuration;

            // Alert if looking away for more than 3 seconds
            if (duration > 3000) {
                this.recordAlert('lookingAwayExtended', {
                    direction: gazeDirection,
                    duration: duration,
                    gazeX: avgGazeX.toFixed(3),
                    gazeY: avgGazeY.toFixed(3),
                    severity: 'high'
                });
            }

            // Sustained look away (5+ seconds)
            if (duration > 5000 && !this.sustainedLookAwayTriggered) {
                this.sustainedLookAwayTriggered = true;
                this.recordAlert('sustainedLookAway', {
                    direction: gazeDirection,
                    duration: duration,
                    severity: 'critical',
                    note: 'User has been looking away for a sustained period'
                });
            }
        }
    }

    analyzeHeadPose(landmarks) {
        // Enhanced head pose estimation
        const noseTip = landmarks[1];
        const noseBridge = landmarks[6];
        const forehead = landmarks[10];
        const chin = landmarks[152];
        const leftCheek = landmarks[234];
        const rightCheek = landmarks[454];
        const leftEar = landmarks[234];
        const rightEar = landmarks[454];

        // Calculate horizontal rotation (yaw)
        const faceWidth = Math.abs(rightCheek.x - leftCheek.x);
        const noseCenterOffset = noseTip.x - ((leftCheek.x + rightCheek.x) / 2);
        const yawRatio = Math.abs(noseCenterOffset) / faceWidth;

        // Calculate vertical rotation (pitch)
        const faceHeight = Math.abs(chin.y - forehead.y);
        const noseVerticalOffset = noseTip.y - ((forehead.y + chin.y) / 2);
        const pitchRatio = Math.abs(noseVerticalOffset) / faceHeight;

        // Head turned significantly (yaw)
        if (yawRatio > 0.25) {
            const direction = noseCenterOffset > 0 ? 'right' : 'left';
            const severity = yawRatio > 0.35 ? 'critical' : 'high';
            this.recordAlert('headTurned', {
                direction: direction,
                yawRatio: yawRatio.toFixed(3),
                severity: severity
            });
        }

        // Head tilted up/down significantly (pitch)
        if (pitchRatio > 0.15) {
            const direction = noseVerticalOffset > 0 ? 'down' : 'up';
            const severity = pitchRatio > 0.25 ? 'high' : 'medium';
            this.recordAlert('headTilted', {
                direction: direction,
                pitchRatio: pitchRatio.toFixed(3),
                severity: severity
            });
        }
    }

    analyzeEyeState(landmarks) {
        // Calculate Eye Aspect Ratio (EAR) for blink detection
        const leftEyeTop = landmarks[159];
        const leftEyeBottom = landmarks[145];
        const leftEyeLeft = landmarks[133];
        const leftEyeRight = landmarks[33];

        const rightEyeTop = landmarks[386];
        const rightEyeBottom = landmarks[374];
        const rightEyeLeft = landmarks[362];
        const rightEyeRight = landmarks[263];

        // Calculate vertical and horizontal distances
        const leftVertical = this.calculateDistance(leftEyeTop, leftEyeBottom);
        const leftHorizontal = this.calculateDistance(leftEyeLeft, leftEyeRight);
        const leftEAR = leftVertical / leftHorizontal;

        const rightVertical = this.calculateDistance(rightEyeTop, rightEyeBottom);
        const rightHorizontal = this.calculateDistance(rightEyeLeft, rightEyeRight);
        const rightEAR = rightVertical / rightHorizontal;

        const avgEAR = (leftEAR + rightEAR) / 2;
        this.eyeAspectRatioHistory.push(avgEAR);

        // Keep last 30 frames
        if (this.eyeAspectRatioHistory.length > 30) {
            this.eyeAspectRatioHistory.shift();
        }

        // Detect eyes closed (EAR threshold typically around 0.2-0.25)
        const EAR_THRESHOLD = 0.22;
        const now = Date.now();

        if (avgEAR < EAR_THRESHOLD) {
            if (!this.eyesClosedStartTime) {
                this.eyesClosedStartTime = now;
            }

            const closedDuration = now - this.eyesClosedStartTime;

            // Alert if eyes closed for more than 2 seconds (not just blinking)
            if (closedDuration > 2000) {
                this.recordAlert('eyesClosed', {
                    duration: closedDuration,
                    ear: avgEAR.toFixed(3),
                    severity: 'high'
                });
            }
        } else {
            // Eyes opened
            if (this.eyesClosedStartTime) {
                const closedDuration = now - this.eyesClosedStartTime;

                // Detect blink (closed for 100-400ms)
                if (closedDuration > 100 && closedDuration < 400) {
                    this.blinkCount++;
                    this.lastBlinkTime = now;
                }

                this.eyesClosedStartTime = null;
            }
        }

        // Analyze blink rate (normal is 15-20 blinks per minute)
        // Intense reading also reduces blink rate. We only care if they are reading OFF-SCREEN.
        const sessionDuration = (now - this.sessionStartTime) / 1000 / 60; // minutes

        if (sessionDuration > 1 && this.currentGazeDirection !== 'center') {
            const blinksPerMinute = this.blinkCount / sessionDuration;

            // Session-wide low blink rate while looking away
            if (blinksPerMinute < 8) {
                this.recordAlert('abnormalBlinkRate', {
                    blinksPerMinute: blinksPerMinute.toFixed(1),
                    gazeDirection: this.currentGazeDirection,
                    severity: 'high',
                    note: 'Unusually low blink rate across session while looking away'
                });
            }

            // Real-time "no blink" detection while looking away (suggests focused reading of external material)
            const timeSinceLastBlink = now - this.lastBlinkTime;
            if (timeSinceLastBlink > 10000) { // 10 seconds without blinking while looking away
                this.recordAlert('suspiciousGazeReading', {
                    durationSinceBlink: timeSinceLastBlink,
                    direction: this.currentGazeDirection,
                    severity: 'critical',
                    note: 'Focused reading detected while looking away (no blinks for 10s+)'
                });
            }
        }
    }

    analyzeMouthMovement(landmarks) {
        // Comprehensive mouth movement analysis for talking detection

        // Upper and lower lip landmarks
        const upperLipTop = landmarks[13];
        const lowerLipBottom = landmarks[14];
        const upperLipCenter = landmarks[0];
        const lowerLipCenter = landmarks[17];

        // Mouth corners
        const leftMouthCorner = landmarks[61];
        const rightMouthCorner = landmarks[291];

        // Inner lips
        const upperInnerLip = landmarks[13];
        const lowerInnerLip = landmarks[14];

        // Calculate mouth openness (vertical distance)
        const mouthOpenness = this.calculateDistance(upperLipTop, lowerLipBottom);

        // Calculate mouth width (horizontal distance)
        const mouthWidth = this.calculateDistance(leftMouthCorner, rightMouthCorner);

        // Calculate lip distance (inner lips)
        const lipDistance = this.calculateDistance(upperInnerLip, lowerInnerLip);

        // Calculate mouth aspect ratio
        const mouthAspectRatio = mouthOpenness / mouthWidth;

        // Store history
        this.mouthOpenHistory.push(mouthOpenness);
        this.lipDistanceHistory.push(lipDistance);

        if (this.mouthOpenHistory.length > 30) {
            this.mouthOpenHistory.shift();
            this.lipDistanceHistory.shift();
        }

        // Calculate mouth movement (variance in recent frames)
        if (this.mouthOpenHistory.length >= 10) {
            const recentMouth = this.mouthOpenHistory.slice(-10);
            const mouthVariance = this.calculateVariance(recentMouth);
            const mouthMovement = Math.sqrt(mouthVariance);

            this.mouthMovementHistory.push(mouthMovement);
            if (this.mouthMovementHistory.length > 30) {
                this.mouthMovementHistory.shift();
            }

            // Detect talking based on mouth movement patterns
            // Talking shows consistent movement, not just static open mouth
            const MOVEMENT_THRESHOLD = 0.008; // Tuned threshold for talking
            const OPENNESS_THRESHOLD = 0.015; // Minimum mouth openness

            const isMouthMoving = mouthMovement > MOVEMENT_THRESHOLD;
            const isMouthOpen = mouthOpenness > OPENNESS_THRESHOLD;

            const now = Date.now();

            // Talking is detected when mouth is both moving and open
            if (isMouthMoving && isMouthOpen) {
                if (!this.talkingByMouthStartTime) {
                    this.talkingByMouthStartTime = now;
                    this.isTalkingByMouth = true;
                }

                const talkingDuration = now - this.talkingByMouthStartTime;
                this.mouthTalkingDuration += 1000 / this.fps;

                // Alert if talking detected by mouth movement for more than 1 second
                if (talkingDuration > 1000) {
                    this.recordAlert('talkingDetected', {
                        duration: talkingDuration,
                        mouthOpenness: mouthOpenness.toFixed(4),
                        mouthMovement: mouthMovement.toFixed(4),
                        mouthAspectRatio: mouthAspectRatio.toFixed(3),
                        detectionMethod: 'visual',
                        severity: 'high'
                    });
                }
            } else {
                if (this.talkingByMouthStartTime) {
                    const finalDuration = now - this.talkingByMouthStartTime;
                    if (finalDuration > 500) {
                        // Log talking episode
                        this.recordAlert('talkingEpisode', {
                            duration: finalDuration,
                            severity: 'high',
                            detectionMethod: 'visual'
                        });
                    }
                }
                this.talkingByMouthStartTime = null;
                this.isTalkingByMouth = false;
            }

            // Also detect general mouth movement (could be mouthing words)
            if (mouthMovement > MOVEMENT_THRESHOLD * 0.5) {
                this.recordAlert('mouthMovement', {
                    movement: mouthMovement.toFixed(4),
                    openness: mouthOpenness.toFixed(4),
                    severity: 'medium'
                });
            }
        }
    }

    detectMouthCovering(landmarks) {
        // Detect if mouth area appears covered or obscured
        const upperLip = landmarks[13];
        const lowerLip = landmarks[14];
        const leftMouth = landmarks[61];
        const rightMouth = landmarks[291];

        const mouthHeight = Math.abs(lowerLip.y - upperLip.y);
        const mouthWidth = Math.abs(rightMouth.x - leftMouth.x);

        // Check for unusually small mouth dimensions (possible covering)
        // if (mouthHeight < 0.008 || mouthWidth < 0.015) {
        //     this.recordAlert('suspiciousMouth', {
        //         height: mouthHeight.toFixed(5),
        //         width: mouthWidth.toFixed(5),
        //         severity: 'medium',
        //         note: 'Mouth may be covered or obscured'
        //     });
        // }

        // Check for visibility if available
        if (upperLip.visibility !== undefined && lowerLip.visibility !== undefined) {
            const avgVisibility = (upperLip.visibility + lowerLip.visibility) / 2;
            if (avgVisibility < 0.3) {
                this.recordAlert('mouthObscured', {
                    visibility: avgVisibility.toFixed(3),
                    severity: 'high'
                });
            }
        }
    }

    analyzeHandActivity(leftHand, rightHand, faceLandmarks) {
        const now = Date.now();
        const noseTip = faceLandmarks[1];
        const faceCenter = faceLandmarks[1]; // Using nose tip as face center

        let handNearFace = false;
        let handCoveringFace = false;

        // Analyze left hand
        if (leftHand && leftHand.length > 0) {
            const handAnalysis = this.analyzeHandProximity(leftHand, faceLandmarks, 'left');
            if (handAnalysis.nearFace) handNearFace = true;
            if (handAnalysis.covering) handCoveringFace = true;
        }

        // Analyze right hand
        if (rightHand && rightHand.length > 0) {
            const handAnalysis = this.analyzeHandProximity(rightHand, faceLandmarks, 'right');
            if (handAnalysis.nearFace) handNearFace = true;
            if (handAnalysis.covering) handCoveringFace = true;
        }

        // Record alerts
        if (handCoveringFace) {
            this.recordAlert('handCoveringFace', {
                timestamp: now,
                severity: 'critical'
            });
        } else if (handNearFace) {
            if (!this.handNearFaceStartTime) {
                this.handNearFaceStartTime = now;
            }

            const duration = now - this.handNearFaceStartTime;
            if (duration > 2000) { // Hand near face for 2+ seconds
                this.recordAlert('handNearFace', {
                    duration: duration,
                    severity: 'high'
                });
            }
        } else {
            this.handNearFaceStartTime = null;
        }

        // Detect suspicious gestures (phone-holding gesture)
        this.detectPhoneGesture(leftHand, rightHand, faceLandmarks);

        // Store hand positions for movement tracking
        this.lastHandPositions = {
            left: leftHand,
            right: rightHand
        };
    }

    analyzeHandProximity(hand, faceLandmarks, handSide) {
        // Get face boundaries
        const faceBounds = this.getFaceBounds(faceLandmarks);

        // Key hand landmarks
        const wrist = hand[0];
        const indexTip = hand[8];
        const middleTip = hand[12];
        const ringTip = hand[16];
        const pinkyTip = hand[20];
        const thumbTip = hand[4];
        const palm = hand[9]; // Middle of palm

        let nearFace = false;
        let covering = false;

        // Check if any hand part is near face
        const handPoints = [wrist, indexTip, middleTip, ringTip, pinkyTip, thumbTip, palm];

        for (const point of handPoints) {
            const distanceToFace = this.calculateDistance(point, faceBounds.center);

            // Near face threshold
            if (distanceToFace < 0.15) {
                nearFace = true;
            }

            // Covering face threshold (very close)
            if (distanceToFace < 0.08) {
                covering = true;
            }
        }

        return { nearFace, covering };
    }

    detectPhoneGesture(leftHand, rightHand, faceLandmarks) {
        // Detect if hand pose looks like holding a phone near face
        // Phone holding: hand flat, near ear/face, fingers extended

        const checkPhonePose = (hand, handSide) => {
            if (!hand || hand.length < 21) return false;

            const wrist = hand[0];
            const indexTip = hand[8];
            const pinkyTip = hand[20];
            const thumbTip = hand[4];
            const palm = hand[9];

            // Check if hand is near ear
            const leftEar = faceLandmarks[234];
            const rightEar = faceLandmarks[454];
            const ear = handSide === 'left' ? leftEar : rightEar;

            const distanceToEar = this.calculateDistance(palm, ear);

            // Check finger extension (phone holding has extended fingers)
            const fingerSpread = this.calculateDistance(indexTip, pinkyTip);

            // Phone gesture: hand near ear, fingers extended
            if (distanceToEar < 0.12 && fingerSpread > 0.08) {
                return true;
            }

            return false;
        };

        const leftPhone = leftHand ? checkPhonePose(leftHand, 'left') : false;
        const rightPhone = rightHand ? checkPhonePose(rightHand, 'right') : false;

        if (leftPhone || rightPhone) {
            this.recordAlert('phoneDetected', {
                hand: leftPhone ? 'left' : 'right',
                severity: 'critical',
                note: 'Hand pose suggests phone usage'
            });
        }
    }

    getFaceBounds(landmarks) {
        // Calculate face bounding box and center
        const xs = landmarks.map(lm => lm.x);
        const ys = landmarks.map(lm => lm.y);

        return {
            minX: Math.min(...xs),
            maxX: Math.max(...xs),
            minY: Math.min(...ys),
            maxY: Math.max(...ys),
            center: {
                x: (Math.min(...xs) + Math.max(...xs)) / 2,
                y: (Math.min(...ys) + Math.max(...ys)) / 2
            },
            width: Math.max(...xs) - Math.min(...xs),
            height: Math.max(...ys) - Math.min(...ys)
        };
    }

    analyzePoseForMultiplePersons(poseLandmarks) {
        // Advanced: Could use pose to detect multiple people
        // For now, just basic pose validation

        if (!poseLandmarks || poseLandmarks.length === 0) return;

        // Check pose confidence
        const visibleLandmarks = poseLandmarks.filter(lm =>
            lm.visibility !== undefined && lm.visibility > 0.5
        );

        // If we detect pose landmarks but no face, might indicate someone else
        if (visibleLandmarks.length > 10) {
            // Additional person detection logic would go here
        }
    }

    async setupAudioMonitoring() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: false
                },
                video: false
            });

            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.analyser = this.audioContext.createAnalyser();
            const microphone = this.audioContext.createMediaStreamSource(stream);

            this.analyser.fftSize = 2048;
            this.analyser.smoothingTimeConstant = 0.8;
            microphone.connect(this.analyser);

            this.isAudioSetup = true;
            this.monitorAudioLevels();

            console.log("🎤 Enhanced audio monitoring active");
        } catch (error) {
            console.error("Failed to setup audio monitoring:", error);
        }
    }

    monitorAudioLevels() {
        if (!this.isAudioSetup || this.isDestroyed) return;

        const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
        const timeArray = new Uint8Array(this.analyser.fftSize);

        const checkAudio = () => {
            if (this.isDestroyed) return;

            this.analyser.getByteFrequencyData(dataArray);
            this.analyser.getByteTimeDomainData(timeArray);

            // Calculate RMS (Root Mean Square) for better audio detection
            let sum = 0;
            for (let i = 0; i < timeArray.length; i++) {
                const normalized = (timeArray[i] - 128) / 128;
                sum += normalized * normalized;
            }
            const rms = Math.sqrt(sum / timeArray.length);
            const decibels = 20 * Math.log10(rms);

            // Calculate average frequency
            const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
            const frequencyDb = 20 * Math.log10(average / 255);

            this.audioLevelHistory.push({ decibels, frequencyDb, timestamp: Date.now() });
            if (this.audioLevelHistory.length > 30) {
                this.audioLevelHistory.shift();
            }

            const now = Date.now();

            // Improved talking detection threshold
            const TALKING_THRESHOLD = -40; // More sensitive
            const isTalkingByAudio = decibels > TALKING_THRESHOLD && average > 5;

            if (isTalkingByAudio) {
                if (!this.audioTalkingStartTime) {
                    this.audioTalkingStartTime = now;
                }

                const talkingDuration = now - this.audioTalkingStartTime;
                this.audioTalkingDuration += 100;

                // Alert if talking detected by audio for more than 1 second
                if (talkingDuration > 1000) {
                    this.recordAlert('talkingDetected', {
                        duration: talkingDuration,
                        decibels: decibels.toFixed(2),
                        frequencyDb: frequencyDb.toFixed(2),
                        average: average.toFixed(2),
                        detectionMethod: 'audio',
                        severity: 'high'
                    });
                }
            } else {
                this.audioTalkingStartTime = null;
            }

            setTimeout(checkAudio, 100); // Check every 100ms
        };

        checkAudio();
    }

    startAudioVisualCorrelation() {
        // Check if audio and visual talking detection correlate
        setInterval(() => {
            if (this.isDestroyed) return;

            const isVisualTalking = this.isTalkingByMouth;
            const isAudioTalking = this.audioTalkingStartTime !== null;

            // Mismatch detection
            if (isAudioTalking && !isVisualTalking) {
                // Audio detected but no mouth movement - suspicious
                this.recordAlert('audioVisualMismatch', {
                    type: 'audioWithoutVisual',
                    severity: 'high',
                    note: 'Audio detected but no mouth movement - possible external source'
                });
            } else if (isVisualTalking && !isAudioTalking && this.isAudioSetup) {
                // Mouth moving but no audio - might be mouthing or mic issue
                this.recordAlert('audioVisualMismatch', {
                    type: 'visualWithoutAudio',
                    severity: 'medium',
                    note: 'Mouth movement without audio - possible mic issue or mouthing'
                });
            }
        }, 2000); // Check every 2 seconds
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

        // Detect window blur
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

        // Detect right-click
        document.addEventListener('contextmenu', (e) => {
            this.recordAlert('rightClick', {
                timestamp: Date.now(),
                severity: 'low'
            });
        });

        // Detect copy/paste
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

        // Detect developer tools (limited detection)
        const detectDevTools = () => {
            const threshold = 160;
            const widthThreshold = window.outerWidth - window.innerWidth > threshold;
            const heightThreshold = window.outerHeight - window.innerHeight > threshold;

            if (widthThreshold || heightThreshold) {
                this.recordAlert('devToolsOpen', {
                    timestamp: Date.now(),
                    severity: 'critical'
                });
            }
        };

        setInterval(detectDevTools, 5000);

        console.log("👁️ Tab/Window monitoring active");
    }

    setupKeyboardMonitoring() {
        // Monitor suspicious key combinations
        const suspiciousKeys = new Set();

        document.addEventListener('keydown', (e) => {
            // Detect Alt+Tab, Ctrl+Tab, etc.
            if (e.altKey && e.key === 'Tab') {
                this.recordAlert('suspiciousKeyPress', {
                    key: 'Alt+Tab',
                    severity: 'high'
                });
            }

            if (e.ctrlKey && e.key === 'Tab') {
                this.recordAlert('suspiciousKeyPress', {
                    key: 'Ctrl+Tab',
                    severity: 'medium'
                });
            }

            // Detect F12 (dev tools)
            if (e.key === 'F12') {
                this.recordAlert('devToolsAttempt', {
                    severity: 'critical'
                });
                e.preventDefault();
            }

            // Detect Ctrl+Shift+I/J/C (dev tools)
            if (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key.toUpperCase())) {
                this.recordAlert('devToolsAttempt', {
                    severity: 'critical'
                });
                e.preventDefault();
            }

            // Detect print screen
            if (e.key === 'PrintScreen') {
                this.recordAlert('screenshotAttempt', {
                    severity: 'high'
                });
            }
        });

        console.log("⌨️ Keyboard monitoring active");
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
            frameNumber: this.frameCount,
            sessionTime: now - this.sessionStartTime,
            metadata: {
                ...metadata,
                studentName: this.studentName,
                studentId: this.studentId
            }
        };

        // Add to full logs
        this.fullLogs.push(alertItem);

        // Send real-time update via LiveKit
        this.broadcastAlert(alertItem);

        // Throttle backend API calls
        if (now - this.lastAlertSentTime < this.alertThrottleMs) {
            return;
        }

        this.lastAlertSentTime = now;
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

            await this.room.localParticipant.publishData(
                data,
                LivekitClient.DataPacket_Kind.RELIABLE
            );
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
                mouthTalkingDuration: this.mouthTalkingDuration,
                audioTalkingDuration: this.audioTalkingDuration,
                blinkCount: this.blinkCount
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

    async sendFinalLogs() {
        if (this.fullLogs.length === 0 || this.isDestroyed) return;

        console.log("📤 Sending final proctoring logs...");
        const data = {
            question_paper_id: this.questionPaperId,
            student_id: this.studentId,
            logs: this.fullLogs,
            summary: this.getAlertSummary(),
            endTime: Date.now(),
            statistics: this.getDetailedStatistics()
        };

        const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });

        try {
            if (navigator.sendBeacon && !this.isExplicitlySubmitting) {
                navigator.sendBeacon('/proctoring/save-logs', blob);
            } else {
                await fetch('/proctoring/save-logs', {
                    method: 'POST',
                    body: blob,
                    headers: { 'Content-Type': 'application/json' },
                    keepalive: true
                });
            }
            console.log("✅ Proctoring logs saved successfully");
        } catch (error) {
            console.error("❌ Failed to save proctoring logs:", error);
        }

        this.isDestroyed = true;
    }

    startAlertSync() {
        setInterval(() => {
            if (this.isDestroyed) return;

            this.sendAlertToBackend('sync', {
                allAlerts: this.alerts,
                gazeDurations: this.gazeDirectionDurations,
                mouthTalkingDuration: this.mouthTalkingDuration,
                audioTalkingDuration: this.audioTalkingDuration,
                blinkCount: this.blinkCount,
                sessionDuration: Date.now() - this.sessionStartTime,
                statistics: this.getDetailedStatistics()
            });
        }, 10000); // Sync every 10 seconds
    }

    getAlertSummary() {
        return {
            alerts: this.alerts,
            gazeDurations: this.gazeDirectionDurations,
            mouthTalkingDuration: this.mouthTalkingDuration,
            audioTalkingDuration: this.audioTalkingDuration,
            blinkCount: this.blinkCount,
            sessionDuration: Date.now() - this.sessionStartTime,
            frameCount: this.frameCount
        };
    }

    getDetailedStatistics() {
        const sessionDuration = (Date.now() - this.sessionStartTime) / 1000; // seconds

        return {
            sessionDurationSeconds: sessionDuration,
            framesProcessed: this.frameCount,
            averageFps: this.frameCount / sessionDuration,
            blinkRate: (this.blinkCount / sessionDuration) * 60, // blinks per minute
            gazeAwayPercentage: {
                left: (this.gazeDirectionDurations.left / (sessionDuration * 1000)) * 100,
                right: (this.gazeDirectionDurations.right / (sessionDuration * 1000)) * 100,
                down: (this.gazeDirectionDurations.down / (sessionDuration * 1000)) * 100,
                up: (this.gazeDirectionDurations.up / (sessionDuration * 1000)) * 100,
                center: (this.gazeDirectionDurations.center / (sessionDuration * 1000)) * 100
            },
            talkingPercentage: {
                visual: (this.mouthTalkingDuration / (sessionDuration * 1000)) * 100,
                audio: (this.audioTalkingDuration / (sessionDuration * 1000)) * 100
            },
            suspicionScore: this.calculateSuspicionScore()
        };
    }

    calculateSuspicionScore() {
        // Calculate overall suspicion score (0-100)
        let score = 0;

        // Weight different alert types
        const weights = {
            personLeft: 20,
            multipleFaces: 15,
            handCoveringFace: 12,
            phoneDetected: 15,
            talkingDetected: 10,
            headTurned: 8,
            lookingAway: 6,
            tabSwitch: 8,
            devToolsOpen: 12,
            pasteAttempt: 10,
            audioVisualMismatch: 7,
            handNearFace: 5,
            windowBlur: 4,
            copyAttempt: 3,
            rightClick: 1
        };

        for (const [type, weight] of Object.entries(weights)) {
            if (this.alerts[type]) {
                score += Math.min(this.alerts[type] * weight, weight * 3);
            }
        }

        return Math.min(score, 100);
    }

    drawDebugVisualization(results) {
        if (!this.debugCtx || !this.debugCanvas) return;

        const ctx = this.debugCtx;
        const canvas = this.debugCanvas;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw face landmarks
        if (results.faceLandmarks) {
            ctx.fillStyle = 'rgba(0, 255, 0, 0.5)';
            results.faceLandmarks.forEach(landmark => {
                ctx.beginPath();
                ctx.arc(
                    landmark.x * canvas.width,
                    landmark.y * canvas.height,
                    2,
                    0,
                    2 * Math.PI
                );
                ctx.fill();
            });
        }

        // Draw hand landmarks
        const drawHand = (landmarks, color) => {
            if (!landmarks) return;

            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.fillStyle = color;

            landmarks.forEach(landmark => {
                ctx.beginPath();
                ctx.arc(
                    landmark.x * canvas.width,
                    landmark.y * canvas.height,
                    3,
                    0,
                    2 * Math.PI
                );
                ctx.fill();
            });
        };

        drawHand(results.leftHandLandmarks, 'rgba(255, 0, 0, 0.7)');
        drawHand(results.rightHandLandmarks, 'rgba(0, 0, 255, 0.7)');

        // Draw status text
        ctx.fillStyle = '#fff';
        ctx.font = '14px monospace';
        ctx.fillText(`Frame: ${this.frameCount}`, 10, 20);
        ctx.fillText(`Gaze: ${this.currentGazeDirection}`, 10, 40);
        ctx.fillText(`Talking: ${this.isTalkingByMouth ? 'YES' : 'NO'}`, 10, 60);
    }

    // Helper methods
    calculateDistance(point1, point2) {
        const dx = point1.x - point2.x;
        const dy = point1.y - point2.y;
        const dz = (point1.z && point2.z) ? point1.z - point2.z : 0;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    calculateVariance(arr) {
        if (arr.length === 0) return 0;
        const mean = arr.reduce((a, b) => a + b) / arr.length;
        return arr.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / arr.length;
    }

    async destroy() {
        console.log("🛑 Destroying proctoring system");

        await this.sendFinalLogs();
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

        console.log("✅ Proctoring system destroyed");
    }
}

// Export initialization function
export async function initEnhancedAIProctoring(questionPaperId, studentId, studentName, livekitUrl) {
    const client = new EnhancedProctoringClient(questionPaperId, studentId, studentName, livekitUrl);
    await client.initialize();
    return client;
}