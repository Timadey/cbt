/**
 * Teacher Live Proctoring Module
 * Subscribes to student video streams and alerts via LiveKit.
 */

export async function initLiveProctoring(roomId, livekitUrl) {
    console.log("Initializing Live Proctoring for Room:", roomId);

    const grid = document.getElementById('proctoring-grid');
    const noStudents = document.getElementById('no-students');

    try {
        const tokenResponse = await fetch(`/proctoring/token?room=${roomId}&identity=Teacher`);
        const { token } = await tokenResponse.json();

        if (token) {
            const room = new LivekitClient.Room();

            room.on(LivekitClient.RoomEvent.TrackSubscribed, (track, publication, participant) => {
                if (track.kind === LivekitClient.Track.Kind.Video) {
                    noStudents.classList.add('hidden');
                    addStudentFeed(participant, track, grid);
                }
            });

            room.on(LivekitClient.RoomEvent.ParticipantDisconnected, (participant) => {
                removeStudentFeed(participant);
                if (room.participants.size === 0) {
                    noStudents.classList.remove('hidden');
                }
            });

            await room.connect(livekitUrl, token);
            console.log('Connected to LiveKit room:', room.name);
        }
    } catch (err) {
        console.error("LiveKit connection failed:", err);
    }
}

function addStudentFeed(participant, track, grid) {
    let container = document.getElementById(`feed-${participant.identity}`);
    if (!container) {
        container = document.createElement('div');
        container.id = `feed-${participant.identity}`;
        container.className = "bg-white p-4 rounded-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-700";
        container.innerHTML = `
            <div class="flex justify-between items-center mb-2">
                <span class="text-sm font-medium dark:text-white">${participant.identity}</span>
                <span id="alert-${participant.identity}" class="hidden text-[10px] bg-red-100 text-red-800 px-2 py-0.5 rounded dark:bg-red-900 dark:text-red-300">ALERT</span>
            </div>
            <div id="video-${participant.identity}" class="aspect-video bg-black rounded overflow-hidden"></div>
        `;
        grid.appendChild(container);
    }

    const videoElement = track.attach();
    videoElement.className = "w-full h-full object-cover";
    document.getElementById(`video-${participant.identity}`).appendChild(videoElement);
}

function removeStudentFeed(participant) {
    const container = document.getElementById(`feed-${participant.identity}`);
    if (container) {
        container.remove();
    }
}
