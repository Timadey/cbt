import { useEffect, useRef, useState } from 'react';
import { FaceMesh } from '@mediapipe/face_mesh';
import { Camera } from '@mediapipe/camera_utils';
import { Room } from 'livekit-client';

interface ProctoringProps {
    questionPaperId: number | string;
    studentName: string;
    livekitUrl: string;
    enabled: boolean;
}

export function useAIProctoring({ questionPaperId, studentName, livekitUrl, enabled }: ProctoringProps) {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const [status, setStatus] = useState('Initializing AI...');
    const [isAlert, setIsAlert] = useState(false);
    const roomRef = useRef<Room | null>(null);

    useEffect(() => {
        if (!enabled || !videoRef.current) return;

        // 1. MediaPipe Setup
        const faceMesh = new FaceMesh({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
        });

        faceMesh.setOptions({
            maxNumFaces: 1,
            refineLandmarks: true,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5,
        });

        faceMesh.onResults((results) => {
            if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
                setStatus('Warning: Face not detected!');
                setIsAlert(true);
            } else {
                setStatus('AI Proctoring Active');
                setIsAlert(false);
                // Additional analysis (gaze, pose) can be added here
            }
        });

        const camera = new Camera(videoRef.current, {
            onFrame: async () => {
                if (videoRef.current) {
                    await faceMesh.send({ image: videoRef.current });
                }
            },
            width: 640,
            height: 480,
        });
        camera.start();

        // 2. LiveKit Setup
        const connectLiveKit = async () => {
            try {
                const response = await fetch(`/api/proctoring/token?room=exam-${questionPaperId}&identity=${encodeURIComponent(studentName)}`);
                const { token } = await response.json();

                if (token) {
                    const room = new Room();
                    roomRef.current = room;
                    await room.connect(livekitUrl, token);
                    await room.localParticipant.enableCameraAndMicrophone();
                    setStatus('Proctoring Active & Streaming');
                }
            } catch (err) {
                console.error('LiveKit failed:', err);
                setStatus('Proctoring Local Only');
            }
        };

        connectLiveKit();

        return () => {
            camera.stop();
            faceMesh.close();
            roomRef.current?.disconnect();
        };
    }, [enabled, questionPaperId, studentName, livekitUrl]);

    return {
        videoRef,
        status,
        isAlert,
    };
}
