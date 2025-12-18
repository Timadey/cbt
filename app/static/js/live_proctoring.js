/**
 * Teacher Live Proctoring Dashboard
 * Displays live student feeds with beautiful visual alert summaries
 * Subscribes to student video streams and real-time alerts via LiveKit
 */

export class TeacherProctoringDashboard {
    constructor(roomId, livekitUrl) {
        this.roomId = roomId;
        this.livekitUrl = livekitUrl;
        this.room = null;
        this.studentAlerts = new Map(); // studentId -> alert data
        this.updateInterval = null;

        // DOM elements
        this.grid = document.getElementById('proctoring-grid');
        this.noStudents = document.getElementById('no-students');
        this.summaryPanel = document.getElementById('summary-panel');
    }

    async initialize() {
        console.log("Initializing Live Proctoring Dashboard for Room:", this.roomId);

        try {
            const tokenResponse = await fetch(`/proctoring/token?room=${this.roomId}&identity=Teacher`);
            const { token } = await tokenResponse.json();

            if (!token) {
                throw new Error("Failed to get LiveKit token");
            }

            this.room = new LivekitClient.Room();

            // Setup event listeners
            this.setupRoomEvents();

            // Connect to room
            await this.room.connect(this.livekitUrl, token);
            console.log('Connected to LiveKit room:', this.room.name);

            // Start periodic alert updates
            this.startAlertUpdates();

            return true;
        } catch (err) {
            console.error("LiveKit connection failed:", err);
            this.showError("Failed to connect to proctoring room");
            return false;
        }
    }

    setupRoomEvents() {
        // Handle video track subscriptions
        this.room.on(LivekitClient.RoomEvent.TrackSubscribed, (track, publication, participant) => {
            if (track.kind === LivekitClient.Track.Kind.Video) {
                this.noStudents.classList.add('hidden');
                this.addStudentFeed(participant, track);
            }
        });

        // Handle participant disconnections
        this.room.on(LivekitClient.RoomEvent.ParticipantDisconnected, (participant) => {
            this.removeStudentFeed(participant);
            this.studentAlerts.delete(participant.identity);

            if (this.room.participants.size === 0) {
                this.noStudents.classList.remove('hidden');
            }
        });

        // Handle data messages from students
        this.room.on(LivekitClient.RoomEvent.DataReceived, (payload, participant) => {
            const decoder = new TextDecoder();
            const data = JSON.parse(decoder.decode(payload));

            if (data.type === 'PROCTORING_UPDATE') {
                this.updateStudentState(participant.identity, data.state);
            } else if (data.type === 'PROCTORING_ALERT') {
                this.handleRealTimeAlert(participant.identity, data.alert, data.summary);
            }
        });
    }

    addStudentFeed(participant, track) {
        const studentId = participant.identity;
        let container = document.getElementById(`feed-${studentId}`);

        if (!container) {
            container = this.createStudentContainer(studentId);
            this.grid.appendChild(container);

            // Initialize alert data
            this.studentAlerts.set(studentId, {
                alerts: {},
                fullLogs: [],
                currentState: {
                    faceDetected: true,
                    gazeDirection: 'center',
                    multipleFaces: false
                },
                riskScore: 0,
                lastUpdate: Date.now()
            });

            // Fetch historical alerts
            this.fetchAlertSummary(studentId);
        }

        // Attach video track
        const videoElement = track.attach();
        videoElement.className = "w-full h-full object-cover transition-transform duration-500 hover:scale-105";
        const videoContainer = container.querySelector(`#video-${studentId}`);
        videoContainer.innerHTML = '';
        videoContainer.appendChild(videoElement);
    }

    createStudentContainer(studentId) {
        const container = document.createElement('div');
        container.id = `feed-${studentId}`;
        container.className = "flex flex-col bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:bg-gray-900 dark:border-gray-800 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1";

        container.innerHTML = `
            <!-- Student Header -->
            <div class="px-5 py-4 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-gray-800 dark:to-gray-850 flex justify-between items-center border-b border-gray-100 dark:border-gray-800">
                <div class="flex items-center space-x-3">
                    <div class="relative">
                        <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-inner">
                            ${studentId.charAt(0).toUpperCase()}
                        </div>
                        <div id="online-status-${studentId}" class="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-white dark:border-gray-900"></div>
                    </div>
                    <div>
                        <h3 class="text-base font-bold text-gray-800 dark:text-white leading-tight">${studentId}</h3>
                        <div class="flex items-center mt-0.5">
                            <span id="status-dot-${studentId}" class="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                            <p id="status-${studentId}" class="text-[11px] font-medium text-gray-500 dark:text-gray-400 tracking-wide uppercase">Active</p>
                        </div>
                    </div>
                </div>
                
                <div class="flex flex-col items-end">
                    <div id="risk-badge-${studentId}" class="px-3 py-1 rounded-lg text-xs font-black shadow-sm transition-all duration-300 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        RISK: 0%
                    </div>
                </div>
            </div>
            
            <!-- Main Content Area (Video + Logs) -->
            <div class="flex flex-col">
                <!-- Video Feed -->
                <div class="relative group">
                    <div id="video-${studentId}" class="aspect-video bg-black overflow-hidden"></div>
                    
                    <!-- Overlay Indicators -->
                    <div class="absolute top-4 left-4 flex flex-col space-y-2 pointer-events-none">
                        <div id="face-indicator-${studentId}" class="backdrop-blur-md bg-white/20 dark:bg-black/20 border border-white/30 px-3 py-1.5 rounded-full text-white text-[10px] font-bold tracking-widest uppercase flex items-center space-x-2 shadow-lg">
                            <span class="w-2 h-2 rounded-full bg-green-400"></span>
                            <span>Face Locked</span>
                        </div>
                        <div id="gaze-indicator-${studentId}" class="hidden backdrop-blur-md bg-yellow-500/20 border border-yellow-500/30 px-3 py-1.5 rounded-full text-white text-[10px] font-bold tracking-widest uppercase flex items-center space-x-2 shadow-lg">
                            <span class="w-2 h-2 rounded-full bg-yellow-400 animate-ping"></span>
                            <span>Looking Away</span>
                        </div>
                    </div>
                    
                    <div id="alert-${studentId}" class="hidden absolute top-4 right-4 backdrop-blur-md bg-red-600/40 border border-red-600/50 px-4 py-2 rounded-xl text-white text-xs font-black tracking-tighter shadow-2xl animate-bounce">
                        🚨 SECURITY ALERT
                    </div>
                </div>

                <!-- Real-time Alert Log -->
                <div class="h-48 bg-gray-50 dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800 flex flex-col">
                    <div class="px-4 py-2 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-white dark:bg-gray-900 sticky top-0 z-10">
                        <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Live Alert Stream</span>
                        <span id="log-count-${studentId}" class="text-[10px] font-bold text-indigo-500">0 Items</span>
                    </div>
                    <div id="alert-log-${studentId}" class="flex-1 overflow-y-scroll p-2 space-y-1.5 scroll-smooth">
                        <!-- Logs will appear here -->
                        <div class="text-[10px] text-gray-400 italic text-center mt-6">Waiting for activity logs...</div>
                    </div>
                </div>
            </div>
            
            <!-- Metrics & Analysis -->
            <div class="p-5 flex-1 flex flex-col">
                <!-- Visual Summary Grid -->
              <!--  <div class="grid grid-cols-2 gap-3 mb-6">
                    ${this.createEnhancedMetric('noFace', 'Identity', '👤', studentId)}
                    ${this.createEnhancedMetric('lookingAway', 'Attention', '👁️', studentId)}
                    ${this.createEnhancedMetric('multipleFaces', 'Proximity', '👥', studentId)}
                    ${this.createEnhancedMetric('tabSwitch', 'Integrity', '🔄', studentId)}
                </div> -->
                
                <!-- Frequency Histogram -->
                <div class="mt-auto">
                    <div class="flex justify-between items-end mb-2">
                        <div>
                            <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Violation Intensity</span>
                            <div class="flex space-x-1 items-end h-12" id="histogram-${studentId}">
                                <!-- Histogram bars -->
                                <div class="w-3 bg-gray-100 dark:bg-gray-800 rounded-t-sm h-1"></div>
                                <div class="w-3 bg-gray-100 dark:bg-gray-800 rounded-t-sm h-1"></div>
                                <div class="w-3 bg-gray-100 dark:bg-gray-800 rounded-t-sm h-1"></div>
                                <div class="w-3 bg-gray-100 dark:bg-gray-800 rounded-t-sm h-1"></div>
                                <div class="w-3 bg-gray-100 dark:bg-gray-800 rounded-t-sm h-1"></div>
                                <div class="w-3 bg-gray-100 dark:bg-gray-800 rounded-t-sm h-1"></div>
                            </div>
                        </div>
                        <div class="text-right">
                            <span id="total-alerts-${studentId}" class="text-2xl font-black text-gray-800 dark:text-white leading-none">0</span>
                            <span class="text-[10px] font-bold text-gray-400 uppercase tracking-tighter block mt-1">Total Flags</span>
                        </div>
                    </div>
                </div>
                
                <!-- Actions -->
                <div class="mt-6 flex space-x-3">
                    <button onclick="viewDetailedReport('${studentId}')" class="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none transition-all active:scale-95 flex items-center justify-center space-x-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                        <span>Full Audit</span>
                    </button>
                    <button onclick="flagStudent('${studentId}')" class="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/20 dark:hover:bg-red-900/30 dark:text-red-400 text-xs font-bold rounded-xl transition-all active:scale-95">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 01-2 2zm9-13.5V9"/></svg>
                    </button>
                </div>
            </div>
        `;

        return container;
    }

    createEnhancedMetric(key, label, icon, studentId) {
        return `
            <div class="bg-gray-50 dark:bg-gray-850 p-3 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-indigo-200 transition-colors">
                <div class="flex justify-between items-center mb-2">
                    <span class="text-sm grayscale opacity-70 group-hover:grayscale-0">${icon}</span>
                    <span id="${key}-count-${studentId}" class="text-xs font-black text-gray-800 dark:text-white">0</span>
                </div>
                <div class="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2">${label}</div>
                <div class="h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div id="${key}-bar-${studentId}" class="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500 rounded-full" style="width: 0%"></div>
                </div>
            </div>
        `;
    }

    handleRealTimeAlert(studentId, alert, summary) {
        const student = this.studentAlerts.get(studentId);
        if (!student) return;

        // Update counts
        student.alerts = { ...summary.alerts };
        student.fullLogs.push(alert);
        student.riskScore = this.calculateRiskScore(student.alerts);

        // UI Updates
        this.addAlertToLog(studentId, alert);
        this.updateStudentUI(studentId);
        this.flashAlert(studentId, alert.type);
    }

    addAlertToLog(studentId, alert) {
        const logContainer = document.getElementById(`alert-log-${studentId}`);
        const logCount = document.getElementById(`log-count-${studentId}`);
        if (!logContainer) return;

        // Clear placeholder
        const placeholder = logContainer.querySelector('.italic');
        if (placeholder) placeholder.remove();

        const alertItem = document.createElement('div');
        alertItem.className = "flex items-start space-x-2 py-1 px-2 bg-white dark:bg-gray-900 rounded border-l-2 shadow-sm transform transition-all duration-300 translate-x-2 opacity-0";

        const timestamp = new Date(alert.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });

        let color = 'border-yellow-400';
        let severityClass = 'text-yellow-600';
        if (alert.metadata?.severity === 'critical' || alert.metadata?.severity === 'high') {
            color = 'border-red-500';
            severityClass = 'text-red-600';
        }

        alertItem.classList.add(color);
        alertItem.innerHTML = `
            <div class="flex-1 overflow-hidden">
                <div class="flex justify-between items-center">
                    <span class="text-[9px] font-black uppercase tracking-tight ${severityClass}">${alert.type.replace(/([A-Z])/g, ' $1')}</span>
                    <span class="text-[8px] font-medium text-gray-300 font-mono">${timestamp}</span>
                </div>
                <p class="text-[9px] text-gray-500 dark:text-gray-400 truncate">${this.formatAlertMetadata(alert.metadata)}</p>
            </div>
        `;

        logContainer.prepend(alertItem);

        // Trigger animation
        setTimeout(() => {
            alertItem.classList.remove('translate-x-2', 'opacity-0');
        }, 10);

        // Update count
        if (logCount) {
            const count = logContainer.children.length;
            logCount.textContent = `${count} Items`;
            logCount.className = count > 10 ? 'text-[10px] font-bold text-red-500' : 'text-[10px] font-bold text-indigo-500';
        }

        this.updateHistogram(studentId);
    }

    formatAlertMetadata(metadata) {
        if (!metadata) return '';
        if (metadata.direction) return `Direction: ${metadata.direction.toUpperCase()}`;
        if (metadata.duration) return `Duration: ${Math.round(metadata.duration / 1000)}s`;
        if (metadata.faceCount) return `Detected: ${metadata.faceCount} faces`;
        return 'Suspicious activity detected';
    }

    flashAlert(studentId, type) {
        const badge = document.getElementById(`alert-${studentId}`);
        if (!badge) return;

        badge.classList.remove('hidden');
        badge.textContent = `🚨 ${type.toUpperCase()}`;

        setTimeout(() => {
            if (!this.shouldShowPermanentAlert(studentId)) {
                badge.classList.add('hidden');
            }
        }, 3000);
    }

    shouldShowPermanentAlert(studentId) {
        const student = this.studentAlerts.get(studentId);
        if (!student) return false;
        return (student.alerts.multipleFaces || 0) > 0;
    }

    updateHistogram(studentId) {
        const histogram = document.getElementById(`histogram-${studentId}`);
        if (!histogram) return;

        const maxBarHeight = 100;
        const totalAlerts = this.studentAlerts.get(studentId).fullLogs.length;

        // Create or update bars based on time windows
        const bars = histogram.querySelectorAll('div');
        const latestIntensity = Math.min((totalAlerts % 10) * 10, 100); // Dummy logic for visual effect

        // Shift bars
        for (let i = 0; i < bars.length - 1; i++) {
            bars[i].style.height = bars[i + 1].style.height;
            bars[i].className = bars[i + 1].className;
        }

        const lastBar = bars[bars.length - 1];
        lastBar.style.height = `${latestIntensity || 4}px`;
        lastBar.className = `w-3 rounded-t-sm transition-all duration-500 ${latestIntensity > 50 ? 'bg-red-500' : 'bg-indigo-400'}`;
    }

    calculateRiskScore(alerts) {
        const weights = {
            faceNotDetected: 5,
            multipleFaces: 10,
            lookingAway: 1,
            lookingAwayExtended: 3,
            tabSwitch: 5,
            windowBlur: 4,
            suspiciousMouth: 2,
            talking: 3,
            personLeft: 15
        };

        let totalScore = 0;
        for (const [key, count] of Object.entries(alerts)) {
            totalScore += (count || 0) * (weights[key] || 1);
        }

        return Math.min(totalScore, 100);
    }

    updateStudentUI(studentId) {
        const student = this.studentAlerts.get(studentId);
        if (!student) return;

        // Risk Badge
        const riskBadge = document.getElementById(`risk-badge-${studentId}`);
        if (riskBadge) {
            riskBadge.textContent = `RISK: ${student.riskScore}%`;
            if (student.riskScore > 70) {
                riskBadge.className = 'px-3 py-1 rounded-lg text-xs font-black shadow-inner bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400 animate-pulse';
            } else if (student.riskScore > 40) {
                riskBadge.className = 'px-3 py-1 rounded-lg text-xs font-black shadow-inner bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-400';
            } else {
                riskBadge.className = 'px-3 py-1 rounded-lg text-xs font-black shadow-inner bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            }
        }

        // Metrics Aggregation Mapping
        const metricMapping = {
            noFace: ['faceNotDetected', 'personLeft', 'identityMismatch'],
            lookingAway: ['lookingAway', 'lookingAwayExtended'],
            multipleFaces: ['multipleFaces', 'personEntering'],
            tabSwitch: ['tabSwitch', 'windowBlur', 'focusLoss']
        };

        Object.entries(metricMapping).forEach(([uiKey, alertTypes]) => {
            const count = alertTypes.reduce((sum, type) => sum + (student.alerts[type] || 0), 0);
            const countEl = document.getElementById(`${uiKey}-count-${studentId}`);
            const barEl = document.getElementById(`${uiKey}-bar-${studentId}`);

            if (countEl) countEl.textContent = count;
            if (barEl) {
                const width = Math.min(count * 8, 100);
                barEl.style.width = `${width}%`;

                // Visual feedback for high violation counts
                if (width > 50) {
                    barEl.className = 'h-full bg-gradient-to-r from-orange-400 to-red-600 transition-all duration-500 rounded-full';
                } else {
                    barEl.className = 'h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500 rounded-full';
                }
            }
        });

        // Total Counts
        const totalEl = document.getElementById(`total-alerts-${studentId}`);
        if (totalEl) {
            const total = Object.values(student.alerts).reduce((a, b) => a + Number(b), 0);
            totalEl.textContent = total;
        }
    }

    updateStudentState(studentId, state) {
        const student = this.studentAlerts.get(studentId);
        if (!student) return;

        student.currentState = { ...state };
        student.lastUpdate = Date.now();

        // Update indicators
        const faceIndicator = document.getElementById(`face-indicator-${studentId}`);
        const gazeIndicator = document.getElementById(`gaze-indicator-${studentId}`);

        if (faceIndicator) {
            if (state.faceDetected) {
                faceIndicator.innerHTML = '<span class="w-2 h-2 rounded-full bg-green-400"></span><span>Face Locked</span>';
                faceIndicator.classList.remove('bg-red-500/20');
            } else {
                faceIndicator.innerHTML = '<span class="w-2 h-2 rounded-full bg-red-600 animate-ping"></span><span>Target Lost</span>';
                faceIndicator.classList.add('bg-red-500/20');
            }
        }

        if (gazeIndicator) {
            if (state.gazeDirection !== 'center') {
                gazeIndicator.classList.remove('hidden');
                gazeIndicator.querySelector('span:last-child').textContent = `Looking ${state.gazeDirection}`;
            } else {
                gazeIndicator.classList.add('hidden');
            }
        }
    }

    async fetchAlertSummary(studentId) {
        try {
            const response = await fetch(`/proctoring/summary?studentId=${studentId}&roomId=${this.roomId}`);
            if (response.ok) {
                const summary = await response.json();
                const student = this.studentAlerts.get(studentId);
                if (student) {
                    student.alerts = { ...summary.counts };
                    this.updateStudentUI(studentId);
                }
            }
        } catch (error) {
            console.warn('Error fetching alert summary:', error);
        }
    }

    startAlertUpdates() {
        // No longer strictly needed for real-time, but good for sync
        this.updateInterval = setInterval(async () => {
            for (const studentId of this.studentAlerts.keys()) {
                await this.fetchAlertSummary(studentId);
            }
        }, 30000);
    }

    showError(message) {
        if (this.summaryPanel) {
            this.summaryPanel.innerHTML = `
                <div class="bg-red-50/50 backdrop-blur-md border border-red-200 rounded-2xl p-6 dark:bg-red-900/20 dark:border-red-800 text-center">
                    <div class="flex flex-col items-center">
                        <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                            <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                        </div>
                        <h4 class="text-sm font-bold text-red-900 dark:text-red-400 mb-1">Connection Error</h4>
                        <p class="text-xs text-red-700 dark:text-red-300 opacity-80">${message}</p>
                    </div>
                </div>
            `;
        }
    }

    cleanup() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }

        if (this.room) {
            this.room.disconnect();
        }
    }
}

// Global functions for button actions
window.viewDetailedReport = function (studentId) {
    window.location.href = `/teacher/proctoring/report/${studentId}`;
};

window.flagStudent = function (studentId) {
    if (confirm(`Flag ${studentId} for manual review?`)) {
        fetch('/proctoring/flag', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ studentId, roomId: window.currentRoomId })
        }).then(() => {
            alert('Student flagged successfully');
        });
    }
};

// Initialize dashboard
export async function initLiveProctoring(roomId, livekitUrl) {
    window.currentRoomId = roomId;
    const dashboard = new TeacherProctoringDashboard(roomId, livekitUrl);
    const initialized = await dashboard.initialize();

    if (!initialized) {
        console.error("Failed to initialize proctoring dashboard");
        return null;
    }

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        dashboard.cleanup();
    });

    return dashboard;
}