"use strict";

(function() {
    // ==========================================
    // 1. DATA MANAGER
    // ==========================================
    const STORAGE_KEY = 'healthcareAssistant';
    
    function getFormattedDate() {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }

    const defaultData = {
        lastResetDate: getFormattedDate(),
        medicines: [],
        water: {
            date: getFormattedDate(),
            count: 0,
            goal: 8
        },
        exercise: {
            date: getFormattedDate(),
            completed: [],
            totalMinutes: 0,
            dailyGoal: 30
        },
        bmi: {
            height: null,
            weight: null,
            value: null,
            category: null,
            lastCalculated: null
        }
    };

    let appData = null;

    const DataManager = {
        loadData: function() {
            try {
                const stored = localStorage.getItem(STORAGE_KEY);
                if (stored) {
                    appData = JSON.parse(stored);
                    
                    // Data migration if needed
                    if (!appData.lastResetDate) {
                        appData.lastResetDate = appData.water.date || getFormattedDate();
                    }
                    
                    this.checkDailyReset();
                } else {
                    appData = JSON.parse(JSON.stringify(defaultData));
                    this.saveData();
                }
            } catch (e) {
                console.error("Error loading data from localStorage", e);
                appData = JSON.parse(JSON.stringify(defaultData));
            }
        },
        saveData: function() {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
            } catch (e) {
                console.error("Error saving data to localStorage", e);
                showToast("Error saving data. Storage might be full.");
            }
        },
        checkDailyReset: function() {
            const today = getFormattedDate();
            let dataChanged = false;

            if (appData.lastResetDate !== today) {
                appData.lastResetDate = today;
                
                appData.water.count = 0;
                appData.water.date = today;
                
                appData.exercise.completed = [];
                appData.exercise.totalMinutes = 0;
                appData.exercise.date = today;
                
                appData.medicines.forEach(m => {
                    m.status = 'upcoming';
                });
                
                dataChanged = true;
            }

            if (dataChanged) {
                this.saveData();
            }
        }
    };

    // ==========================================
    // HELPER FUNCTIONS
    // ==========================================
    function formatTime(timeString) {
        if (!timeString) return '';
        const [hourStr, minuteStr] = timeString.split(':');
        let hours = parseInt(hourStr, 10);
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        return `${hours}:${minuteStr} ${ampm}`;
    }

    function getTimeOfDay() {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) return "Good Morning";
        if (hour >= 12 && hour < 17) return "Good Afternoon";
        if (hour >= 17 && hour < 21) return "Good Evening";
        return "Good Night";
    }

    function generateId() {
        return Date.now().toString();
    }

    function playNotificationSound() {
        try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            
            oscillator.type = 'sine';
            oscillator.frequency.value = 800; // Hz
            
            gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
            gainNode.gain.linearRampToValueAtTime(1, audioCtx.currentTime + 0.05);
            gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.5);
            
            oscillator.start(audioCtx.currentTime);
            oscillator.stop(audioCtx.currentTime + 0.5);
        } catch (e) {
            console.error("Web Audio API not supported", e);
        }
    }

    function showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        
        Object.assign(toast.style, {
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            padding: '1rem 1.5rem',
            background: 'var(--primary, #007bff)',
            color: 'white',
            borderRadius: '4px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            zIndex: '9999',
            opacity: '0',
            transition: 'opacity 0.3s ease-in-out'
        });

        document.body.appendChild(toast);
        
        toast.offsetHeight; 
        toast.style.opacity = '1';

        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => {
                if (document.body.contains(toast)) {
                    document.body.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    // ==========================================
    // ROUTING & NAVIGATION
    // ==========================================
    const pages = [
        'page-home', 'page-dashboard', 'page-medicine', 
        'page-timer', 'page-bmi', 'page-health-tips', 
        'page-conditions', 'page-emergency', 'page-about'
    ];

    function handleRouting() {
        DataManager.checkDailyReset();
        
        let hash = window.location.hash || '#home';
        const targetPageId = 'page-' + hash.substring(1);
        
        if (!pages.includes(targetPageId)) {
            hash = '#home';
        }

        pages.forEach(pageId => {
            const el = document.getElementById(pageId);
            if (el) {
                if (pageId === targetPageId) {
                    el.classList.add('active');
                    el.style.display = 'block';
                } else {
                    el.classList.remove('active');
                    el.style.display = 'none';
                }
            }
        });

        document.querySelectorAll('nav a, .mobile-menu a, [data-page]').forEach(link => {
            let linkHash = link.getAttribute('href') || link.getAttribute('data-page');
            if (linkHash && linkHash.startsWith('#')) {
                if (linkHash === hash) {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            }
        });

        const mobileMenu = document.getElementById('mobile-menu');
        const hamburgerBtn = document.getElementById('hamburger-btn');
        if (mobileMenu) mobileMenu.classList.remove('active');
        if (hamburgerBtn) hamburgerBtn.classList.remove('active');

        updateDynamicContent();
    }

    function setupNavigation() {
        window.addEventListener('hashchange', handleRouting);
        
        document.addEventListener('click', (e) => {
            const pageLink = e.target.closest('[data-page]');
            if (pageLink) {
                e.preventDefault();
                const hash = pageLink.getAttribute('data-page');
                window.location.hash = hash;
            }
        });

        const hamburgerBtn = document.getElementById('hamburger-btn');
        const mobileMenu = document.getElementById('mobile-menu');
        if (hamburgerBtn && mobileMenu) {
            hamburgerBtn.addEventListener('click', () => {
                hamburgerBtn.classList.toggle('active');
                mobileMenu.classList.toggle('active');
            });
        }
        
        if (mobileMenu) {
            mobileMenu.addEventListener('click', (e) => {
                if (e.target.tagName === 'A') {
                    mobileMenu.classList.remove('active');
                    if (hamburgerBtn) hamburgerBtn.classList.remove('active');
                }
            });
        }
    }

    function updateDynamicContent() {
        const currentHash = window.location.hash || '#home';
        if (currentHash === '#dashboard') renderDashboard();
        if (currentHash === '#home') renderHome();
        if (currentHash === '#medicine') renderMedicineList();
        if (currentHash === '#timer') {
            updateWaterDisplay();
            updateExerciseLog();
        }
        updateBadgeCounts();
    }

    // ==========================================
    // DASHBOARD
    // ==========================================
    function renderDashboard() {
        const greetingEl = document.getElementById('dashboard-greeting');
        const dateEl = document.getElementById('dashboard-date');
        
        if (greetingEl) greetingEl.textContent = getTimeOfDay();
        if (dateEl) {
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            dateEl.textContent = new Date().toLocaleDateString(undefined, options);
        }

        const medTaken = appData.medicines.filter(m => m.status === 'taken').length;
        const medTotal = appData.medicines.length;
        
        const waterCount = appData.water.count;
        const waterGoal = appData.water.goal;
        
        const exerciseTotal = appData.exercise.totalMinutes;
        const exerciseGoal = appData.exercise.dailyGoal;
        
        const dashMedCount = document.getElementById('dash-med-count');
        const dashWaterCount = document.getElementById('dash-water-count');
        const dashExerciseCount = document.getElementById('dash-exercise-count');
        
        if (dashMedCount) dashMedCount.textContent = `${medTaken}/${medTotal} Taken`;
        if (dashWaterCount) dashWaterCount.textContent = `${waterCount}/${waterGoal} Glasses`;
        if (dashExerciseCount) dashExerciseCount.textContent = `${exerciseTotal}/${exerciseGoal} Mins`;

        const totalTasks = medTotal + waterGoal + 1; 
        const completedTasks = medTaken + Math.min(waterCount, waterGoal) + (exerciseTotal >= exerciseGoal ? 1 : 0);
        const overallProgress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
        
        const dashOverallProgress = document.getElementById('dash-overall-progress');
        if (dashOverallProgress) dashOverallProgress.style.width = `${overallProgress}%`;

        const scheduleList = document.getElementById('dashboard-schedule-list');
        if (scheduleList) {
            scheduleList.innerHTML = '';
            
            let scheduleItems = [];
            
            appData.medicines.forEach(m => {
                scheduleItems.push({
                    time: m.time,
                    title: `Medicine: ${m.name} (${m.dosage})`,
                    status: m.status,
                    type: 'medicine'
                });
            });

            scheduleItems.sort((a, b) => a.time.localeCompare(b.time));

            if (scheduleItems.length === 0) {
                scheduleList.innerHTML = '<p class="empty-state">No schedule items for today.</p>';
            } else {
                scheduleItems.forEach(item => {
                    const el = document.createElement('div');
                    el.className = `schedule-item status-${item.status}`;
                    el.innerHTML = `
                        <div class="schedule-time">${formatTime(item.time)}</div>
                        <div class="schedule-info">
                            <h4>${item.title}</h4>
                            <span class="status-badge ${item.status}">${item.status.charAt(0).toUpperCase() + item.status.slice(1)}</span>
                        </div>
                    `;
                    scheduleList.appendChild(el);
                });
            }
        }
    }

    // ==========================================
    // HOME PAGE
    // ==========================================
    function renderHome() {
        const heroMed = document.getElementById('hero-med-status');
        const heroHydration = document.getElementById('hero-hydration-status');
        const heroMindful = document.getElementById('hero-mindful-status');

        if (heroMed) {
            const medRemaining = appData.medicines.filter(m => m.status === 'upcoming' || m.status === 'missed').length;
            heroMed.textContent = medRemaining === 0 && appData.medicines.length > 0 ? "On track" : (appData.medicines.length === 0 ? "No meds added" : `${medRemaining} remaining`);
        }

        if (heroHydration) {
            heroHydration.textContent = `${appData.water.count} / ${appData.water.goal}`;
        }

        if (heroMindful) {
            heroMindful.textContent = appData.exercise.completed.length > 0 ? "Today" : "Start";
        }
    }

    function updateBadgeCounts() {
        const medBadge = document.getElementById('med-count-badge');
        if (medBadge) {
            const count = appData.medicines.length;
            medBadge.textContent = count;
            medBadge.style.display = count > 0 ? 'inline-block' : 'none';
        }
    }

    // ==========================================
    // MEDICINE REMINDER
    // ==========================================
    let editingMedicineId = null;
    let reminderActiveMedId = null;
    let reminderCheckerInterval = null;

    function setupMedicineForm() {
        const form = document.getElementById('medicine-form');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = document.getElementById('med-name').value.trim();
            const dosage = document.getElementById('med-dosage').value.trim();
            const time = document.getElementById('med-time').value;
            const notes = document.getElementById('med-notes').value.trim();
            const reminderEnabled = document.getElementById('med-reminder').checked;

            if (!name || !time) {
                showToast("Name and time are required.");
                return;
            }

            if (editingMedicineId) {
                const index = appData.medicines.findIndex(m => m.id === editingMedicineId);
                if (index > -1) {
                    appData.medicines[index] = {
                        ...appData.medicines[index],
                        name, dosage, time, notes, reminderEnabled
                    };
                }
                editingMedicineId = null;
                const submitBtn = form.querySelector('button[type="submit"]');
                if (submitBtn) submitBtn.textContent = 'Add Medicine';
                showToast("Medicine updated successfully.");
            } else {
                const newMed = {
                    id: generateId(),
                    name,
                    dosage,
                    time,
                    notes,
                    reminderEnabled,
                    status: 'upcoming',
                    dateAdded: getFormattedDate()
                };
                appData.medicines.push(newMed);
                showToast("Medicine added successfully.");
                
                if (reminderEnabled && "Notification" in window) {
                    Notification.requestPermission();
                }
            }

            DataManager.saveData();
            form.reset();
            renderMedicineList();
            updateDynamicContent();
        });
    }

    window.editMedicine = function(id) {
        const med = appData.medicines.find(m => m.id === id);
        if (!med) return;

        document.getElementById('med-name').value = med.name;
        document.getElementById('med-dosage').value = med.dosage;
        document.getElementById('med-time').value = med.time;
        document.getElementById('med-notes').value = med.notes;
        document.getElementById('med-reminder').checked = med.reminderEnabled;

        editingMedicineId = id;
        
        const submitBtn = document.querySelector('#medicine-form button[type="submit"]');
        if (submitBtn) submitBtn.textContent = 'Update Medicine';
        
        const form = document.getElementById('medicine-form');
        if (form) form.scrollIntoView({ behavior: 'smooth' });
    };

    window.deleteMedicine = function(id) {
        if (confirm("Are you sure you want to delete this medicine?")) {
            appData.medicines = appData.medicines.filter(m => m.id !== id);
            DataManager.saveData();
            renderMedicineList();
            updateDynamicContent();
            showToast("Medicine deleted.");
        }
    };

    window.changeMedicineStatus = function(id, status) {
        const med = appData.medicines.find(m => m.id === id);
        if (med) {
            med.status = status;
            DataManager.saveData();
            renderMedicineList();
            updateDynamicContent();
        }
    };

    function renderMedicineList() {
        const list = document.getElementById('medicine-list');
        if (!list) return;

        list.innerHTML = '';
        
        if (appData.medicines.length === 0) {
            list.innerHTML = `
                <div class="empty-state">
                    <i>💊</i>
                    <p>No medicines added yet.</p>
                </div>`;
            return;
        }

        const sortedMeds = [...appData.medicines].sort((a, b) => a.time.localeCompare(b.time));

        sortedMeds.forEach(med => {
            const card = document.createElement('div');
            card.className = `medicine-card ${med.status === 'taken' ? 'taken' : (med.status === 'missed' ? 'missed' : '')}`;
            
            card.innerHTML = `
                <div class="med-info">
                    <h4>${med.name} <span class="badge ${med.status}">${med.status}</span></h4>
                    <p><strong>Dosage:</strong> ${med.dosage || 'N/A'} | <strong>Time:</strong> ${formatTime(med.time)}</p>
                    ${med.notes ? `<p class="notes"><strong>Notes:</strong> ${med.notes}</p>` : ''}
                    <p><em>Reminder: ${med.reminderEnabled ? 'Enabled' : 'Disabled'}</em></p>
                </div>
                <div class="med-actions">
                    <button onclick="changeMedicineStatus('${med.id}', 'taken')" class="btn-success">✓ Taken</button>
                    <button onclick="changeMedicineStatus('${med.id}', 'missed')" class="btn-danger">✗ Missed</button>
                    <button onclick="editMedicine('${med.id}')" class="btn-secondary">Edit</button>
                    <button onclick="deleteMedicine('${med.id}')" class="btn-danger-outline">Delete</button>
                </div>
            `;
            list.appendChild(card);
        });
    }

    function startMedicineChecker() {
        if (reminderCheckerInterval) clearInterval(reminderCheckerInterval);
        
        reminderCheckerInterval = setInterval(() => {
            const now = new Date();
            const currentHHMM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
            
            const currentSec = now.getSeconds();
            if (currentSec > 30) return; 
            
            const dueMeds = appData.medicines.filter(m => 
                m.reminderEnabled && 
                m.status === 'upcoming' && 
                m.time === currentHHMM
            );

            if (dueMeds.length > 0 && !reminderActiveMedId) {
                showReminder(dueMeds[0]);
            }
        }, 30000); 
    }

    function showReminder(med) {
        reminderActiveMedId = med.id;
        
        const modal = document.getElementById('reminder-modal');
        const medNameEl = document.getElementById('reminder-med-name');
        
        if (medNameEl) {
            medNameEl.textContent = `${med.name} (${med.dosage}) at ${formatTime(med.time)}`;
        }
        
        if (modal) {
            modal.style.display = 'block';
            modal.classList.add('active'); 
        }
        
        playNotificationSound();

        if ("Notification" in window && Notification.permission === "granted") {
            new Notification("Medicine Reminder", {
                body: `It's time to take ${med.name} (${med.dosage}).`,
                icon: '/favicon.ico'
            });
        }
    }

    function setupReminderModal() {
        const modal = document.getElementById('reminder-modal');
        const takenBtn = document.getElementById('reminder-taken-btn');
        const snoozeBtn = document.getElementById('reminder-snooze-btn');
        const dismissBtn = document.getElementById('reminder-dismiss-btn');

        function closeModal() {
            if (modal) modal.style.display = 'none';
            reminderActiveMedId = null;
        }

        if (takenBtn) {
            takenBtn.addEventListener('click', () => {
                if (reminderActiveMedId) {
                    changeMedicineStatus(reminderActiveMedId, 'taken');
                }
                closeModal();
            });
        }

        if (snoozeBtn) {
            snoozeBtn.addEventListener('click', () => {
                closeModal();
            });
        }

        if (dismissBtn) {
            dismissBtn.addEventListener('click', () => {
                closeModal();
            });
        }
    }


    // ==========================================
    // WATER TRACKER & TIMER
    // ==========================================
    let waterTimerInterval = null;
    let waterTimerRemaining = 0;

    function setupWaterTimer() {
        const startBtn = document.getElementById('water-start-btn');
        const pauseBtn = document.getElementById('water-pause-btn');
        const resetBtn = document.getElementById('water-reset-btn');
        
        if (startBtn) startBtn.addEventListener('click', startWaterTimer);
        if (pauseBtn) pauseBtn.addEventListener('click', pauseWaterTimer);
        if (resetBtn) resetBtn.addEventListener('click', resetWaterTimer);

        const addBtn = document.getElementById('water-add-btn');
        const removeBtn = document.getElementById('water-remove-btn');
        const goalInput = document.getElementById('water-goal');

        if (addBtn) addBtn.addEventListener('click', () => {
            appData.water.count++;
            DataManager.saveData();
            updateWaterDisplay();
            updateDynamicContent();
        });

        if (removeBtn) removeBtn.addEventListener('click', () => {
            if (appData.water.count > 0) {
                appData.water.count--;
                DataManager.saveData();
                updateWaterDisplay();
                updateDynamicContent();
            }
        });

        if (goalInput) goalInput.addEventListener('change', (e) => {
            const val = parseInt(e.target.value, 10);
            if (!isNaN(val) && val > 0) {
                appData.water.goal = val;
                DataManager.saveData();
                updateWaterDisplay();
                updateDynamicContent();
            }
        });
    }

    function updateWaterDisplay() {
        const countEl = document.getElementById('water-count');
        const goalEl = document.getElementById('water-goal-display');
        const progressEl = document.getElementById('water-progress');
        const goalInput = document.getElementById('water-goal');

        if (countEl) countEl.textContent = appData.water.count;
        if (goalEl) goalEl.textContent = appData.water.goal;
        if (goalInput) goalInput.value = appData.water.goal;

        if (progressEl) {
            let percentage = (appData.water.count / appData.water.goal) * 100;
            if (percentage > 100) percentage = 100;
            progressEl.style.width = `${percentage}%`;
        }
    }

    function formatCountdown(totalSeconds) {
        const m = Math.floor(totalSeconds / 60);
        const s = totalSeconds % 60;
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }

    function updateWaterTimerDisplay() {
        const display = document.getElementById('water-timer-display');
        if (display) display.textContent = formatCountdown(waterTimerRemaining);
    }

    function startWaterTimer() {
        if (waterTimerInterval) return; 

        const intervalInput = document.getElementById('water-interval');
        if (!intervalInput) return;

        if (waterTimerRemaining <= 0) {
            const mins = parseInt(intervalInput.value, 10) || 30;
            waterTimerRemaining = mins * 60;
        }

        updateWaterTimerDisplay();

        document.getElementById('water-start-btn').disabled = true;
        document.getElementById('water-pause-btn').disabled = false;
        document.getElementById('water-pause-btn').textContent = 'Pause';

        waterTimerInterval = setInterval(() => {
            waterTimerRemaining--;
            updateWaterTimerDisplay();

            if (waterTimerRemaining <= 0) {
                clearInterval(waterTimerInterval);
                waterTimerInterval = null;
                playNotificationSound();
                showToast("Time to drink water!");
                
                if ("Notification" in window && Notification.permission === "granted") {
                    new Notification("Hydration Reminder", { body: "It's time to drink a glass of water." });
                }

                document.getElementById('water-start-btn').disabled = false;
                document.getElementById('water-pause-btn').disabled = true;
                
                const mins = parseInt(intervalInput.value, 10) || 30;
                waterTimerRemaining = mins * 60;
                updateWaterTimerDisplay();
            }
        }, 1000);
    }

    function pauseWaterTimer() {
        const pauseBtn = document.getElementById('water-pause-btn');
        if (waterTimerInterval) {
            clearInterval(waterTimerInterval);
            waterTimerInterval = null;
            if (pauseBtn) pauseBtn.textContent = 'Resume';
            document.getElementById('water-start-btn').disabled = false;
        } else if (waterTimerRemaining > 0) {
            startWaterTimer();
        }
    }

    function resetWaterTimer() {
        if (waterTimerInterval) {
            clearInterval(waterTimerInterval);
            waterTimerInterval = null;
        }
        const intervalInput = document.getElementById('water-interval');
        const mins = intervalInput ? (parseInt(intervalInput.value, 10) || 30) : 30;
        waterTimerRemaining = mins * 60;
        updateWaterTimerDisplay();
        
        const startBtn = document.getElementById('water-start-btn');
        const pauseBtn = document.getElementById('water-pause-btn');
        if (startBtn) startBtn.disabled = false;
        if (pauseBtn) {
            pauseBtn.disabled = true;
            pauseBtn.textContent = 'Pause';
        }
    }


    // ==========================================
    // EXERCISE TIMER
    // ==========================================
    let exerciseTimerInterval = null;
    let exerciseTimerRemaining = 0;

    function setupExerciseTimer() {
        const startBtn = document.getElementById('exercise-start-btn');
        const pauseBtn = document.getElementById('exercise-pause-btn');
        const resetBtn = document.getElementById('exercise-reset-btn');
        
        if (startBtn) startBtn.addEventListener('click', startExerciseTimer);
        if (pauseBtn) pauseBtn.addEventListener('click', pauseExerciseTimer);
        if (resetBtn) resetBtn.addEventListener('click', resetExerciseTimer);
    }

    function updateExerciseTimerDisplay() {
        const display = document.getElementById('exercise-timer-display');
        if (display) display.textContent = formatCountdown(exerciseTimerRemaining);
    }

    function startExerciseTimer() {
        if (exerciseTimerInterval) return;

        const durationInput = document.getElementById('exercise-duration');
        const nameInput = document.getElementById('exercise-name');
        
        if (!durationInput) return;

        const mins = parseInt(durationInput.value, 10) || 15;
        
        if (exerciseTimerRemaining <= 0) {
            exerciseTimerRemaining = mins * 60;
        }

        updateExerciseTimerDisplay();

        const startBtn = document.getElementById('exercise-start-btn');
        const pauseBtn = document.getElementById('exercise-pause-btn');
        
        if (startBtn) startBtn.disabled = true;
        if (pauseBtn) {
            pauseBtn.disabled = false;
            pauseBtn.textContent = 'Pause';
        }

        exerciseTimerInterval = setInterval(() => {
            exerciseTimerRemaining--;
            updateExerciseTimerDisplay();

            if (exerciseTimerRemaining <= 0) {
                clearInterval(exerciseTimerInterval);
                exerciseTimerInterval = null;
                playNotificationSound();
                
                const exerciseName = nameInput && nameInput.value.trim() ? nameInput.value.trim() : "Exercise";
                showToast(`Great job! You completed ${exerciseName}.`);
                
                const now = new Date();
                appData.exercise.completed.push({
                    name: exerciseName,
                    duration: mins,
                    completedAt: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
                });
                appData.exercise.totalMinutes += mins;
                DataManager.saveData();
                updateExerciseLog();
                updateDynamicContent();

                if (startBtn) startBtn.disabled = false;
                if (pauseBtn) pauseBtn.disabled = true;
            }
        }, 1000);
    }

    function pauseExerciseTimer() {
        const pauseBtn = document.getElementById('exercise-pause-btn');
        if (exerciseTimerInterval) {
            clearInterval(exerciseTimerInterval);
            exerciseTimerInterval = null;
            if (pauseBtn) pauseBtn.textContent = 'Resume';
            document.getElementById('exercise-start-btn').disabled = false;
        } else if (exerciseTimerRemaining > 0) {
            startExerciseTimer();
        }
    }

    function resetExerciseTimer() {
        if (exerciseTimerInterval) {
            clearInterval(exerciseTimerInterval);
            exerciseTimerInterval = null;
        }
        const durationInput = document.getElementById('exercise-duration');
        const mins = durationInput ? (parseInt(durationInput.value, 10) || 15) : 15;
        exerciseTimerRemaining = mins * 60;
        updateExerciseTimerDisplay();
        
        const startBtn = document.getElementById('exercise-start-btn');
        const pauseBtn = document.getElementById('exercise-pause-btn');
        if (startBtn) startBtn.disabled = false;
        if (pauseBtn) {
            pauseBtn.disabled = true;
            pauseBtn.textContent = 'Pause';
        }
    }

    function updateExerciseLog() {
        const logContainer = document.getElementById('exercise-log');
        if (!logContainer) return;

        logContainer.innerHTML = '';
        
        if (appData.exercise.completed.length === 0) {
            logContainer.innerHTML = '<p class="empty-state">No exercises completed today.</p>';
            return;
        }

        const ul = document.createElement('ul');
        ul.className = 'exercise-list';
        
        appData.exercise.completed.forEach(ex => {
            const li = document.createElement('li');
            li.innerHTML = `
                <strong>${ex.name}</strong> - ${ex.duration} min 
                <span class="time-completed">at ${formatTime(ex.completedAt)}</span>
            `;
            ul.appendChild(li);
        });

        logContainer.appendChild(ul);
    }

    // ==========================================
    // BMI CALCULATOR
    // ==========================================
    function setupBmiCalculator() {
        const calcBtn = document.getElementById('bmi-calculate-btn');
        const resetBtn = document.getElementById('bmi-reset-btn');

        if (calcBtn) {
            calcBtn.addEventListener('click', () => {
                const heightInput = document.getElementById('bmi-height');
                const weightInput = document.getElementById('bmi-weight');
                
                if (!heightInput || !weightInput) return;

                const height = parseFloat(heightInput.value);
                const weight = parseFloat(weightInput.value);

                if (!height || !weight || height <= 0 || weight <= 0) {
                    showToast("Please enter valid height and weight.");
                    return;
                }

                const heightInMeters = height / 100;
                const bmi = weight / (heightInMeters * heightInMeters);
                const roundedBmi = Math.round(bmi * 10) / 10;

                let category = '';
                let catClass = '';
                let explanation = '';

                if (roundedBmi < 18.5) {
                    category = 'Underweight';
                    catClass = 'underweight';
                    explanation = 'You are below the healthy weight range. Consider consulting a doctor or dietitian.';
                } else if (roundedBmi >= 18.5 && roundedBmi <= 24.9) {
                    category = 'Normal weight';
                    catClass = 'normal';
                    explanation = 'You are within a healthy weight range for your height. Keep up the good work!';
                } else if (roundedBmi >= 25 && roundedBmi <= 29.9) {
                    category = 'Overweight';
                    catClass = 'overweight';
                    explanation = 'You are slightly above the healthy weight range. A balanced diet and regular exercise may help.';
                } else {
                    category = 'Obese';
                    catClass = 'obese';
                    explanation = 'Your BMI indicates obesity. It is highly recommended to consult a healthcare professional.';
                }

                appData.bmi = {
                    height,
                    weight,
                    value: roundedBmi,
                    category,
                    lastCalculated: getFormattedDate()
                };
                DataManager.saveData();

                const resultDiv = document.getElementById('bmi-result');
                const valueSpan = document.getElementById('bmi-value');
                const categorySpan = document.getElementById('bmi-category');
                const explanationP = document.getElementById('bmi-explanation');
                const marker = document.getElementById('bmi-indicator-marker');

                if (resultDiv) resultDiv.style.display = 'block';
                if (valueSpan) valueSpan.textContent = roundedBmi;
                if (categorySpan) {
                    categorySpan.textContent = category;
                    categorySpan.className = catClass; 
                }
                if (explanationP) explanationP.textContent = explanation;

                if (marker) {
                    let percent = ((roundedBmi - 10) / 30) * 100;
                    if (percent < 0) percent = 0;
                    if (percent > 100) percent = 100;
                    marker.style.left = `${percent}%`;
                }
            });
        }

        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                const heightInput = document.getElementById('bmi-height');
                const weightInput = document.getElementById('bmi-weight');
                const resultDiv = document.getElementById('bmi-result');
                
                if (heightInput) heightInput.value = '';
                if (weightInput) weightInput.value = '';
                if (resultDiv) resultDiv.style.display = 'none';
            });
        }
    }

    // ==========================================
    // INITIALIZATION
    // ==========================================
    document.addEventListener('DOMContentLoaded', () => {
        DataManager.loadData();
        
        setupNavigation();
        setupMedicineForm();
        setupReminderModal();
        setupWaterTimer();
        setupExerciseTimer();
        setupBmiCalculator();
        
        updateWaterTimerDisplay();
        updateExerciseTimerDisplay();

        handleRouting();
        
        startMedicineChecker();

        if (appData.medicines.some(m => m.reminderEnabled) && "Notification" in window) {
            if (Notification.permission === "default") {
                Notification.requestPermission();
            }
        }
    });

})();
