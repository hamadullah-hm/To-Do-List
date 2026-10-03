/* ==========================================================================
   MY DAILY PLANNER - JAVASCRIPT CODE
   ==========================================================================
   This script is written with beginner-friendly, clean, and well-commented
   vanilla JavaScript to help you learn core web development concepts.
   ========================================================================== */

// ==========================================================================
// 1. GLOBAL STATE (DATA STORAGE IN MEMORY)
// ==========================================================================

// An array of objects to store all tasks.
// Each task object will look like:
// {
//   id: 1712345678901,
//   title: "Complete JS Project",
//   description: "Write clean code and comments",
//   date: "2026-10-04",
//   time: "14:00",
//   priority: "High",       // "Low" | "Medium" | "High"
//   category: "Study",      // "Study" | "Work" | "Personal" | "Exercise" | "Other"
//   reminder: true,         // true | false
//   reminderTriggered: false, // Prevents duplicate reminder alerts
//   isCompleted: false,     // true | false
//   createdAt: "2026-10-03T22:00:00.000Z"
// }
let tasks = [];

// Track the current active filters & search query
let currentStatusFilter = 'All';      // 'All' | 'Pending' | 'Completed' | 'High'
let currentCategoryFilter = 'All';    // 'All' | 'Study' | 'Work' | etc.
let searchQuery = '';

// Track if we are currently editing a task (holds task ID, or null if adding new)
let editingTaskId = null;

// Key name used for saving data in browser LocalStorage
const LOCAL_STORAGE_KEY = 'myDailyPlanner_tasks_v1';


// ==========================================================================
// 2. DOM ELEMENT SELECTORS
// ==========================================================================
// We select HTML elements using document.getElementById to interact with them.

// Header elements
const greetingText = document.getElementById('greetingText');
const liveDate = document.getElementById('liveDate');
const liveTime = document.getElementById('liveTime');
const notificationPermissionBtn = document.getElementById('notificationPermissionBtn');
const notificationBtnText = document.getElementById('notificationBtnText');

// Statistics & Summary elements
const totalTasksCount = document.getElementById('totalTasksCount');
const pendingTasksCount = document.getElementById('pendingTasksCount');
const completedTasksCount = document.getElementById('completedTasksCount');
const highPriorityTasksCount = document.getElementById('highPriorityTasksCount');
const progressPercentage = document.getElementById('progressPercentage');
const progressFill = document.getElementById('progressFill');

// Filter button count badges
const countAll = document.getElementById('countAll');
const countPending = document.getElementById('countPending');
const countCompleted = document.getElementById('countCompleted');
const countHigh = document.getElementById('countHigh');

// Form elements
const taskForm = document.getElementById('taskForm');
const formTitle = document.getElementById('formTitle');
const formIcon = document.getElementById('formIcon');
const editBadge = document.getElementById('editBadge');
const taskIdInput = document.getElementById('taskIdInput');
const taskTitleInput = document.getElementById('taskTitleInput');
const taskDescriptionInput = document.getElementById('taskDescriptionInput');
const taskDateInput = document.getElementById('taskDateInput');
const taskTimeInput = document.getElementById('taskTimeInput');
const taskPrioritySelect = document.getElementById('taskPrioritySelect');
const taskCategorySelect = document.getElementById('taskCategorySelect');
const taskReminderCheckbox = document.getElementById('taskReminderCheckbox');
const submitTaskBtn = document.getElementById('submitTaskBtn');
const submitBtnIcon = document.getElementById('submitBtnIcon');
const submitBtnText = document.getElementById('submitBtnText');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const formErrorMessage = document.getElementById('formErrorMessage');
const errorMessageText = document.getElementById('errorMessageText');

// Search and Filter controls
const taskSearchInput = document.getElementById('taskSearchInput');
const clearSearchBtn = document.getElementById('clearSearchBtn');
const filterCategorySelect = document.getElementById('filterCategorySelect');
const filterButtons = document.querySelectorAll('.filter-btn');
const currentViewHeading = document.getElementById('currentViewHeading');
const tasksShowingBadge = document.getElementById('tasksShowingBadge');

// Task list & empty state containers
const tasksListContainer = document.getElementById('tasksListContainer');
const emptyState = document.getElementById('emptyState');
const emptyTitle = document.getElementById('emptyTitle');
const emptyDesc = document.getElementById('emptyDesc');
const toastContainer = document.getElementById('toastContainer');


// ==========================================================================
// 3. INITIALIZATION & EVENT LISTENERS
// ==========================================================================

// Run initApp when the entire HTML document is loaded
document.addEventListener('DOMContentLoaded', initApp);

/**
 * Entry point of our application.
 * Sets up dates, loads saved tasks, sets event listeners, and starts timers.
 */
function initApp() {
    // 1. Set default date and time in the form to today & current time
    setDefaultFormDateTime();

    // 2. Start the live dynamic clock and greeting
    updateLiveClockAndGreeting();
    setInterval(updateLiveClockAndGreeting, 1000); // update every second

    // 3. Load tasks from browser localStorage
    loadTasksFromLocalStorage();

    // 4. If no tasks exist, load demo starter tasks to showcase the app
    if (tasks.length === 0) {
        loadDemoTasks();
    }

    // 5. Render tasks to the screen and update summary numbers
    renderTasks();
    updateSummaryStats();

    // 6. Set up all button and input event listeners
    setupEventListeners();

    // 7. Check browser notification status
    updateNotificationButtonState();

    // 8. Start the reminder check interval (checks every 5 seconds)
    setInterval(checkReminders, 5000);
}

/**
 * Attach event listeners to all interactive buttons and inputs.
 */
function setupEventListeners() {
    // Form submission (Add or Edit task)
    taskForm.addEventListener('submit', handleFormSubmit);

    // Cancel edit button
    cancelEditBtn.addEventListener('click', resetFormToAddMode);

    // Search input typing
    taskSearchInput.addEventListener('input', handleSearchInput);
    clearSearchBtn.addEventListener('click', clearSearch);

    // Category filter dropdown change
    filterCategorySelect.addEventListener('change', handleCategoryFilterChange);

    // Status filter buttons (All, Pending, Completed, High)
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const selectedFilter = button.getAttribute('data-filter');
            setStatusFilter(selectedFilter);
        });
    });

    // Browser notification permission request button
    notificationPermissionBtn.addEventListener('click', requestNotificationPermission);
}


// ==========================================================================
// 4. HEADER: LIVE CLOCK, DYNAMIC DATE & GREETING
// ==========================================================================

/**
 * Updates the header date, time, and dynamic greeting based on current hour.
 */
function updateLiveClockAndGreeting() {
    const now = new Date();

    // Format Date: e.g., "Sunday, October 4, 2026"
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    liveDate.textContent = now.toLocaleDateString(undefined, dateOptions);

    // Format Time: e.g., "02:30:15 PM"
    liveTime.textContent = now.toLocaleTimeString();

    // Dynamic greeting based on the hour of the day
    const currentHour = now.getHours();
    let greeting = 'Plan your day, stay productive.';

    if (currentHour >= 5 && currentHour < 12) {
        greeting = '🌅 Good morning! Plan your day, stay productive.';
    } else if (currentHour >= 12 && currentHour < 17) {
        greeting = '☀️ Good afternoon! Keep up the great momentum.';
    } else if (currentHour >= 17 && currentHour < 21) {
        greeting = '🌆 Good evening! Review your daily accomplishments.';
    } else {
        greeting = '🌙 Good night! Prepare for a restful sleep and tomorrow.';
    }

    greetingText.textContent = greeting;
}

/**
 * Pre-fills the date input with today's date (YYYY-MM-DD)
 * and time input with the next upcoming hour (HH:00).
 */
function setDefaultFormDateTime() {
    const now = new Date();

    // Format YYYY-MM-DD for <input type="date">
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    taskDateInput.value = `${year}-${month}-${day}`;

    // Format HH:MM for <input type="time"> (round to next hour)
    let nextHour = now.getHours() + 1;
    if (nextHour >= 24) nextHour = 0;
    const hours = String(nextHour).padStart(2, '0');
    taskTimeInput.value = `${hours}:00`;
}


// ==========================================================================
// 5. SWITCH STATEMENT PRACTICE
// ==========================================================================

/**
 * PRACTICE 1: SWITCH STATEMENT FOR CATEGORY DETAILS
 * 
 * WHY USE A SWITCH STATEMENT HERE?
 * We are checking the exact value of the `category` variable against 5 known cases:
 * ('Study', 'Work', 'Personal', 'Exercise', 'Other').
 * A switch statement is cleaner, more readable, and faster to follow than writing:
 * if (category === 'Study') { ... } else if (category === 'Work') { ... }
 * 
 * @param {string} category - The category name
 * @returns {object} - Object with icon, display label, and CSS class name
 */
function getCategoryDetails(category) {
    switch (category) {
        case 'Study':
            return {
                icon: '📚',
                label: 'Study',
                badgeClass: 'cat-study'
            };

        case 'Work':
            return {
                icon: '💼',
                label: 'Work',
                badgeClass: 'cat-work'
            };

        case 'Personal':
            return {
                icon: '👤',
                label: 'Personal',
                badgeClass: 'cat-personal'
            };

        case 'Exercise':
            return {
                icon: '🏃',
                label: 'Exercise',
                badgeClass: 'cat-exercise'
            };

        case 'Other':
            return {
                icon: '📌',
                label: 'Other',
                badgeClass: 'cat-other'
            };

        default:
            // The default case handles any unexpected or missing category
            return {
                icon: '📝',
                label: category || 'General',
                badgeClass: 'cat-other'
            };
    }
}

/**
 * PRACTICE 2: SWITCH STATEMENT FOR PRIORITY BADGE DETAILS
 * 
 * WHY USE A SWITCH STATEMENT HERE?
 * Priority can only be one of three values: 'High', 'Medium', or 'Low'.
 * Using a switch statement provides a structured way to return the icon and CSS styling.
 * 
 * @param {string} priority - "High" | "Medium" | "Low"
 * @returns {object} - Object containing priority icon, CSS class, and text
 */
function getPriorityDetails(priority) {
    switch (priority) {
        case 'High':
            return {
                icon: '🔴',
                badgeClass: 'high',
                cardClass: 'priority-high',
                label: 'High'
            };

        case 'Medium':
            return {
                icon: '🟡',
                badgeClass: 'medium',
                cardClass: 'priority-medium',
                label: 'Medium'
            };

        case 'Low':
            return {
                icon: '🟢',
                badgeClass: 'low',
                cardClass: 'priority-low',
                label: 'Low'
            };

        default:
            return {
                icon: '⚪',
                badgeClass: 'medium',
                cardClass: 'priority-medium',
                label: 'Medium'
            };
    }
}


// ==========================================================================
// 6. FORM HANDLING & VALIDATION (ADD / EDIT TASK)
// ==========================================================================

/**
 * Handles the submission of the task form for both Add and Edit operations.
 * @param {Event} event - The form submit event
 */
function handleFormSubmit(event) {
    // Prevent the default browser page reload
    event.preventDefault();

    // 1. Get and trim values from form inputs
    const title = taskTitleInput.value.trim();
    const description = taskDescriptionInput.value.trim();
    const date = taskDateInput.value;
    const time = taskTimeInput.value;
    const priority = taskPrioritySelect.value;
    const category = taskCategorySelect.value;
    const reminder = taskReminderCheckbox.checked;

    // 2. VALIDATION: Check required fields using if / else if statements
    if (title === '') {
        showFormError('Please enter a task title to continue.');
        taskTitleInput.focus();
        taskTitleInput.classList.add('input-error');
        return;
    }

    if (date === '') {
        showFormError('Please select a valid date for this task.');
        taskDateInput.focus();
        return;
    }

    if (time === '') {
        showFormError('Please select a valid time for this task.');
        taskTimeInput.focus();
        return;
    }

    // Clear any previous error messages
    hideFormError();
    taskTitleInput.classList.remove('input-error');

    // 3. Check whether we are ADDING a new task or EDITING an existing one
    if (editingTaskId === null) {
        // === ADD NEW TASK ===
        const newTask = {
            id: Date.now(), // Generate unique ID using current timestamp in milliseconds
            title: title,
            description: description,
            date: date,
            time: time,
            priority: priority,
            category: category,
            reminder: reminder,
            reminderTriggered: false,
            isCompleted: false,
            createdAt: new Date().toISOString()
        };

        // Add the new task object to the front of our array
        tasks.unshift(newTask);

        showToast(`Task "${title}" added successfully!`, 'success');
    } else {
        // === EDIT EXISTING TASK ===
        // Find the index of the task we are currently editing
        const taskIndex = tasks.findIndex(t => t.id === editingTaskId);

        if (taskIndex !== -1) {
            // Update existing task properties
            tasks[taskIndex].title = title;
            tasks[taskIndex].description = description;
            tasks[taskIndex].date = date;
            tasks[taskIndex].time = time;
            tasks[taskIndex].priority = priority;
            tasks[taskIndex].category = category;
            tasks[taskIndex].reminder = reminder;
            // Reset reminderTriggered if user updated reminder or time
            tasks[taskIndex].reminderTriggered = false;

            showToast(`Task "${title}" updated successfully!`, 'success');
        }

        // Reset the editing state back to Add mode
        resetFormToAddMode();
    }

    // 4. Save updated array to localStorage
    saveTasksToLocalStorage();

    // 5. Refresh the UI
    renderTasks();
    updateSummaryStats();

    // 6. Reset form fields for next entry (if not in edit mode)
    if (editingTaskId === null) {
        taskForm.reset();
        setDefaultFormDateTime();
        taskPrioritySelect.value = 'Medium';
        taskCategorySelect.value = 'Study';
        taskReminderCheckbox.checked = false;
    }
}

/**
 * Displays a friendly error message banner above the form.
 * @param {string} message - Error explanation
 */
function showFormError(message) {
    errorMessageText.textContent = message;
    formErrorMessage.classList.remove('hidden');
}

/**
 * Hides the form error banner.
 */
function hideFormError() {
    formErrorMessage.classList.add('hidden');
}

/**
 * Prepares the form to edit an existing task.
 * @param {number} id - Unique ID of the task to edit
 */
function startEditingTask(id) {
    // Find the task object by ID
    const taskToEdit = tasks.find(t => t.id === id);

    if (!taskToEdit) return;

    // Set global editing state
    editingTaskId = taskToEdit.id;

    // Fill form inputs with the task's current data
    taskIdInput.value = taskToEdit.id;
    taskTitleInput.value = taskToEdit.title;
    taskDescriptionInput.value = taskToEdit.description || '';
    taskDateInput.value = taskToEdit.date;
    taskTimeInput.value = taskToEdit.time;
    taskPrioritySelect.value = taskToEdit.priority;
    taskCategorySelect.value = taskToEdit.category;
    taskReminderCheckbox.checked = taskToEdit.reminder;

    // Update form UI to show Editing Mode
    formTitle.innerHTML = '<span>✏️</span> Edit Task';
    editBadge.classList.remove('hidden');
    submitBtnIcon.textContent = '💾';
    submitBtnText.textContent = 'Update Task';
    cancelEditBtn.classList.remove('hidden');

    hideFormError();

    // Smoothly scroll to the form card (especially helpful on mobile screens)
    taskForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
    taskTitleInput.focus();
}

/**
 * Resets the form back to default "Add New Task" mode.
 */
function resetFormToAddMode() {
    editingTaskId = null;
    taskIdInput.value = '';
    taskForm.reset();
    setDefaultFormDateTime();
    taskPrioritySelect.value = 'Medium';
    taskCategorySelect.value = 'Study';
    taskReminderCheckbox.checked = false;

    // Restore original Add Task form UI
    formTitle.innerHTML = '<span id="formIcon">➕</span> Add New Task';
    editBadge.classList.add('hidden');
    submitBtnIcon.textContent = '➕';
    submitBtnText.textContent = 'Add Task';
    cancelEditBtn.classList.add('hidden');

    hideFormError();
    taskTitleInput.classList.remove('input-error');
}


// ==========================================================================
// 7. TASK ACTIONS (COMPLETE, DELETE)
// ==========================================================================

/**
 * Toggles a task between completed and pending.
 * @param {number} id - Task ID
 */
function toggleTaskComplete(id) {
    // Find the task in our array
    const task = tasks.find(t => t.id === id);

    if (task) {
        // Toggle the boolean value
        task.isCompleted = !task.isCompleted;

        // Show feedback toast
        if (task.isCompleted) {
            showToast(`Task "${task.title}" marked as completed! 🎉`, 'success');
        } else {
            showToast(`Task "${task.title}" marked as pending.`, 'info');
        }

        // Save and re-render
        saveTasksToLocalStorage();
        renderTasks();
        updateSummaryStats();
    }
}

/**
 * Deletes a task from the array.
 * @param {number} id - Task ID
 */
function deleteTask(id) {
    const taskIndex = tasks.findIndex(t => t.id === id);

    if (taskIndex !== -1) {
        const deletedTitle = tasks[taskIndex].title;

        // Remove 1 item at taskIndex using array splice
        tasks.splice(taskIndex, 1);

        // If we were editing this specific task, cancel the edit mode
        if (editingTaskId === id) {
            resetFormToAddMode();
        }

        showToast(`Task "${deletedTitle}" deleted.`, 'info');

        // Save and re-render
        saveTasksToLocalStorage();
        renderTasks();
        updateSummaryStats();
    }
}


// ==========================================================================
// 8. FILTERS & SEARCH SYSTEM
// ==========================================================================

/**
 * Sets the active status filter ('All', 'Pending', 'Completed', 'High')
 * @param {string} filterName - Selected status filter
 */
function setStatusFilter(filterName) {
    currentStatusFilter = filterName;

    // Update active class on filter buttons
    filterButtons.forEach(btn => {
        if (btn.getAttribute('data-filter') === filterName) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Update list heading title
    switch (filterName) {
        case 'Pending':
            currentViewHeading.textContent = 'Pending Tasks';
            break;
        case 'Completed':
            currentViewHeading.textContent = 'Completed Tasks';
            break;
        case 'High':
            currentViewHeading.textContent = 'High Priority Tasks';
            break;
        default:
            currentViewHeading.textContent = 'All Tasks';
            break;
    }

    renderTasks();
}

/**
 * Handles category filter dropdown change.
 */
function handleCategoryFilterChange() {
    currentCategoryFilter = filterCategorySelect.value;
    renderTasks();
}

/**
 * Handles live search typing in the search box.
 */
function handleSearchInput(event) {
    searchQuery = event.target.value.toLowerCase().trim();

    // Show or hide clear button based on input length
    if (searchQuery.length > 0) {
        clearSearchBtn.classList.remove('hidden');
    } else {
        clearSearchBtn.classList.add('hidden');
    }

    renderTasks();
}

/**
 * Clears search input and resets search query.
 */
function clearSearch() {
    taskSearchInput.value = '';
    searchQuery = '';
    clearSearchBtn.classList.add('hidden');
    taskSearchInput.focus();
    renderTasks();
}

/**
 * Filters the tasks array according to current status, category, and search query.
 * Uses JavaScript Array.prototype.filter() method.
 * @returns {Array} - Filtered array of task objects
 */
function getFilteredTasks() {
    return tasks.filter(task => {
        // 1. Status Filter Check
        let matchesStatus = true;
        if (currentStatusFilter === 'Pending') {
            matchesStatus = !task.isCompleted;
        } else if (currentStatusFilter === 'Completed') {
            matchesStatus = task.isCompleted;
        } else if (currentStatusFilter === 'High') {
            matchesStatus = task.priority === 'High';
        }

        // 2. Category Filter Check
        let matchesCategory = true;
        if (currentCategoryFilter !== 'All') {
            matchesCategory = task.category === currentCategoryFilter;
        }

        // 3. Search Query Check
        let matchesSearch = true;
        if (searchQuery !== '') {
            const titleMatch = task.title.toLowerCase().includes(searchQuery);
            const descMatch = (task.description || '').toLowerCase().includes(searchQuery);
            matchesSearch = titleMatch || descMatch;
        }

        // Task must satisfy all active filters
        return matchesStatus && matchesCategory && matchesSearch;
    });
}


// ==========================================================================
// 9. RENDERING TASK CARDS TO THE DOM
// ==========================================================================

/**
 * Renders the filtered task list into the HTML container.
 */
function renderTasks() {
    // 1. Get filtered list of tasks
    const filteredTasks = getFilteredTasks();

    // 2. Clear current list content
    tasksListContainer.innerHTML = '';

    // 3. Update showing count badge
    tasksShowingBadge.textContent = `Showing ${filteredTasks.length} of ${tasks.length} tasks`;

    // 4. Check if list is empty
    if (filteredTasks.length === 0) {
        emptyState.classList.remove('hidden');

        // Customize empty state message based on why it's empty
        if (searchQuery !== '') {
            emptyTitle.textContent = 'No matching tasks';
            emptyDesc.textContent = `No tasks matched your search query "${searchQuery}". Try a different keyword.`;
        } else if (currentStatusFilter === 'Completed') {
            emptyTitle.textContent = 'No completed tasks yet';
            emptyDesc.textContent = 'Complete some tasks from your list to see them here!';
        } else if (currentStatusFilter === 'Pending') {
            emptyTitle.textContent = 'All caught up!';
            emptyDesc.textContent = 'You have no pending tasks. Great job staying productive!';
        } else if (currentStatusFilter === 'High') {
            emptyTitle.textContent = 'No high priority tasks';
            emptyDesc.textContent = 'You currently have no tasks marked as High priority.';
        } else {
            emptyTitle.textContent = 'No tasks found';
            emptyDesc.textContent = 'Add your first task using the form on the left to start planning your day!';
        }
        return;
    }

    // Hide empty state if we have tasks to display
    emptyState.classList.add('hidden');

    // 5. Loop over filtered tasks and generate HTML cards
    filteredTasks.forEach(task => {
        // Get visual details using our switch statement helper functions
        const categoryInfo = getCategoryDetails(task.category);
        const priorityInfo = getPriorityDetails(task.priority);

        // Format Date for readable display (e.g. "Oct 4, 2026")
        const dateObj = new Date(task.date + 'T' + task.time);
        let formattedDate = task.date;
        let formattedTime = task.time;

        if (!isNaN(dateObj.getTime())) {
            formattedDate = dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
            formattedTime = dateObj.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
        }

        // Create card element
        const card = document.createElement('div');
        card.className = `task-card ${priorityInfo.cardClass} ${task.isCompleted ? 'completed' : ''} ${task.reminderTriggered ? 'reminder-triggered' : ''}`;
        card.setAttribute('role', 'listitem');
        card.setAttribute('data-task-id', task.id);

        // Build Card HTML
        card.innerHTML = `
            <!-- Card Header: Title & Badges -->
            <div class="task-card-header">
                <div class="task-title-group">
                    <h4 class="task-title">${escapeHTML(task.title)}</h4>
                </div>
                
                <div class="task-badges">
                    <!-- Priority Badge -->
                    <span class="badge badge-priority ${priorityInfo.badgeClass}">
                        ${priorityInfo.icon} ${priorityInfo.label}
                    </span>

                    <!-- Category Badge -->
                    <span class="badge badge-category ${categoryInfo.badgeClass}">
                        ${categoryInfo.icon} ${categoryInfo.label}
                    </span>

                    <!-- Reminder Badge -->
                    ${task.reminder ? `
                        <span class="badge badge-reminder" title="Reminder is active">
                            🔔 ${task.reminderTriggered ? 'Triggered' : 'Reminder'}
                        </span>
                    ` : ''}

                    <!-- Completion Status Badge -->
                    <span class="badge badge-status">
                        ${task.isCompleted ? '✅ Done' : '⏳ Pending'}
                    </span>
                </div>
            </div>

            <!-- Task Description (only shown if provided) -->
            ${task.description ? `
                <p class="task-description">${escapeHTML(task.description)}</p>
            ` : ''}

            <!-- Task Metadata: Date & Time -->
            <div class="task-card-meta">
                <div class="meta-item">
                    <span class="meta-icon">📅</span>
                    <span>${formattedDate}</span>
                </div>
                <div class="meta-item">
                    <span class="meta-icon">⏰</span>
                    <span>${formattedTime}</span>
                </div>
            </div>

            <!-- Task Action Buttons -->
            <div class="task-card-actions">
                <button 
                    type="button" 
                    class="action-btn ${task.isCompleted ? 'btn-undo' : 'btn-complete'}" 
                    onclick="toggleTaskComplete(${task.id})"
                    title="${task.isCompleted ? 'Mark as Pending' : 'Mark as Complete'}"
                >
                    ${task.isCompleted ? '↩️ Undo' : '✔️ Complete'}
                </button>

                <button 
                    type="button" 
                    class="action-btn btn-edit" 
                    onclick="startEditingTask(${task.id})"
                    title="Edit task details"
                >
                    ✏️ Edit
                </button>

                <button 
                    type="button" 
                    class="action-btn btn-delete" 
                    onclick="deleteTask(${task.id})"
                    title="Delete task"
                >
                    🗑️ Delete
                </button>
            </div>
        `;

        tasksListContainer.appendChild(card);
    });
}

/**
 * Escapes HTML characters in user inputs to prevent XSS (Security Best Practice).
 * @param {string} str - Raw text string
 * @returns {string} - Escaped string
 */
function escapeHTML(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}


// ==========================================================================
// 10. SUMMARY & STATISTICS CALCULATION
// ==========================================================================

/**
 * Calculates and updates all summary counts, percentage progress,
 * and filter tab counters.
 */
function updateSummaryStats() {
    const total = tasks.length;
    
    // Count completed tasks using array filter
    const completed = tasks.filter(t => t.isCompleted).length;
    
    // Calculate pending tasks
    const pending = total - completed;
    
    // Count high priority tasks
    const highPriority = tasks.filter(t => t.priority === 'High').length;

    // Calculate progress percentage (0 to 100)
    let percentage = 0;
    if (total > 0) {
        percentage = Math.round((completed / total) * 100);
    }

    // Update DOM summary cards with smooth numbers
    totalTasksCount.textContent = total;
    pendingTasksCount.textContent = pending;
    completedTasksCount.textContent = completed;
    highPriorityTasksCount.textContent = highPriority;

    // Update Progress Bar
    progressPercentage.textContent = `${percentage}% Completed`;
    progressFill.style.width = `${percentage}%`;

    // Update Filter Tab Badge Numbers
    countAll.textContent = total;
    countPending.textContent = pending;
    countCompleted.textContent = completed;
    countHigh.textContent = highPriority;
}


// ==========================================================================
// 11. REMINDER SYSTEM (TIMERS & NOTIFICATIONS)
// ==========================================================================

/**
 * Checks all tasks to see if any reminder date and time match the current time.
 * Runs automatically every 5 seconds via setInterval.
 */
function checkReminders() {
    const now = new Date();
    
    // Current date in YYYY-MM-DD format
    const currentYear = now.getFullYear();
    const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
    const currentDay = String(now.getDate()).padStart(2, '0');
    const todayDateString = `${currentYear}-${currentMonth}-${currentDay}`;

    // Current time in HH:MM format (24-hour)
    const currentHours = String(now.getHours()).padStart(2, '0');
    const currentMinutes = String(now.getMinutes()).padStart(2, '0');
    const currentTimeString = `${currentHours}:${currentMinutes}`;

    // Current timestamp for precise time comparison
    const currentTimestamp = now.getTime();

    // Iterate through all tasks
    tasks.forEach(task => {
        // Only check if:
        // 1. Reminder is enabled
        // 2. Task is NOT completed yet
        // 3. Reminder has NOT already been triggered
        if (task.reminder && !task.isCompleted && !task.reminderTriggered) {
            
            // Build task date object
            const taskDateTime = new Date(`${task.date}T${task.time}`);
            const taskTimestamp = taskDateTime.getTime();

            // If task date is today and time matches current time (or has just passed within the last minute)
            if (task.date === todayDateString && task.time === currentTimeString) {
                triggerReminder(task);
            } 
            // Alternatively, if task timestamp is equal or slightly earlier than now (within 60 seconds)
            else if (!isNaN(taskTimestamp) && taskTimestamp <= currentTimestamp && (currentTimestamp - taskTimestamp) < 60000) {
                triggerReminder(task);
            }
        }
    });
}

/**
 * Executes visual alert, in-app toast, audio chime, and browser notification for a reminder.
 * @param {object} task - The task object being reminded
 */
function triggerReminder(task) {
    // 1. Mark as triggered so it never alerts again repeatedly
    task.reminderTriggered = true;
    saveTasksToLocalStorage();

    // 2. Play a gentle notification sound using Web Audio API (no external file required)
    playChimeSound();

    // 3. Show in-app Toast alert
    showToast(`⏰ REMINDER: "${task.title}" is scheduled now!`, 'reminder', 8000);

    // 4. Try browser Notification if permission is granted
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(`⏰ Task Reminder: ${task.title}`, {
            body: `Scheduled for ${task.time} today (${task.category} - ${task.priority} Priority)`,
            icon: 'favicon.ico'
        });
    } else {
        // Fallback: Browser alert dialog
        setTimeout(() => {
            alert(`⏰ Reminder: "${task.title}"\nTime: ${task.time}\nCategory: ${task.category}`);
        }, 100);
    }

    // 5. Visually highlight the task in the list
    renderTasks();
}

/**
 * Synthesizes a clean two-tone chime sound using the browser's Web Audio API.
 */
function playChimeSound() {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;

        const ctx = new AudioContext();
        
        // First chime note (E5 - 659.25Hz)
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(659.25, ctx.currentTime);
        gain1.gain.setValueAtTime(0.2, ctx.currentTime);
        gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(ctx.currentTime);
        osc1.stop(ctx.currentTime + 0.5);

        // Second chime note (A5 - 880Hz)
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(880, ctx.currentTime + 0.15);
        gain2.gain.setValueAtTime(0.25, ctx.currentTime + 0.15);
        gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(ctx.currentTime + 0.15);
        osc2.stop(ctx.currentTime + 0.8);

    } catch (e) {
        console.log('Audio playback not allowed or not supported yet:', e);
    }
}

/**
 * Requests browser permission for desktop notifications.
 */
function requestNotificationPermission() {
    if (!('Notification' in window)) {
        showToast('Browser notifications are not supported by your browser.', 'error');
        return;
    }

    Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
            showToast('🔔 Browser notifications enabled for reminders!', 'success');
        } else if (permission === 'denied') {
            showToast('Notifications blocked. In-app alerts will be used instead.', 'info');
        }
        updateNotificationButtonState();
    });
}

/**
 * Updates the bell button text in header based on permission state.
 */
function updateNotificationButtonState() {
    if (!('Notification' in window)) {
        notificationPermissionBtn.classList.add('hidden');
        return;
    }

    if (Notification.permission === 'granted') {
        notificationBtnText.textContent = 'Alerts On';
        notificationPermissionBtn.style.background = 'rgba(16, 185, 129, 0.2)';
        notificationPermissionBtn.style.borderColor = 'rgba(16, 185, 129, 0.4)';
    } else {
        notificationBtnText.textContent = 'Enable Alerts';
    }
}


// ==========================================================================
// 12. LOCAL STORAGE (PERSISTENCE)
// ==========================================================================

/**
 * Saves the tasks array to the browser's localStorage as a JSON string.
 */
function saveTasksToLocalStorage() {
    try {
        const jsonString = JSON.stringify(tasks);
        localStorage.setItem(LOCAL_STORAGE_KEY, jsonString);
    } catch (error) {
        console.error('Error saving tasks to localStorage:', error);
    }
}

/**
 * Loads tasks from localStorage and parses them back into JavaScript objects.
 */
function loadTasksFromLocalStorage() {
    try {
        const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (savedData !== null) {
            tasks = JSON.parse(savedData);
        } else {
            tasks = [];
        }
    } catch (error) {
        console.error('Error loading tasks from localStorage:', error);
        tasks = [];
    }
}

/**
 * Loads pre-defined starter tasks if the user opens the app for the very first time.
 */
function loadDemoTasks() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;

    tasks = [
        {
            id: 1,
            title: 'Complete JavaScript Assignment',
            description: 'Practice arrays, objects, functions, and switch statements.',
            date: todayStr,
            time: '10:00',
            priority: 'High',
            category: 'Study',
            reminder: true,
            reminderTriggered: false,
            isCompleted: false,
            createdAt: new Date().toISOString()
        },
        {
            id: 2,
            title: 'Team Morning Standup Meeting',
            description: 'Discuss today sprint goals and review recent progress.',
            date: todayStr,
            time: '11:30',
            priority: 'Medium',
            category: 'Work',
            reminder: false,
            reminderTriggered: false,
            isCompleted: true,
            createdAt: new Date().toISOString()
        },
        {
            id: 3,
            title: '30-Minute Evening Cardio & Workout',
            description: 'Jogging in the park or light gym session.',
            date: todayStr,
            time: '18:00',
            priority: 'Low',
            category: 'Exercise',
            reminder: true,
            reminderTriggered: false,
            isCompleted: false,
            createdAt: new Date().toISOString()
        }
    ];

    saveTasksToLocalStorage();
}


// ==========================================================================
// 13. TOAST NOTIFICATION UTILITY
// ==========================================================================

/**
 * Creates and displays an in-app toast notification.
 * @param {string} message - Message text
 * @param {string} type - 'success' | 'info' | 'reminder' | 'error'
 * @param {number} duration - Milliseconds before fading out
 */
function showToast(message, type = 'info', duration = 3500) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'reminder') icon = '⏰';
    if (type === 'error') icon = '⚠️';

    toast.innerHTML = `<span>${icon}</span> <span>${escapeHTML(message)}</span>`;
    toastContainer.appendChild(toast);

    // Automatically remove toast after duration
    setTimeout(() => {
        toast.style.animation = 'toastFadeOut 0.3s ease-out forwards';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, duration);
}


/* ==========================================================================
   ==========================================================================
   JAVASCRIPT LEARNING NOTES
   ==========================================================================
   This section provides a clear, simple explanation of the core JavaScript
   concepts used in this project to help you master fundamental programming.

   1. HOW A TASK IS STORED IN THE ARRAY:
      - We create a global array called `tasks = []`.
      - Each task is stored as a JavaScript Object containing key-value pairs:
        {
          id: 1712345678901,        // Unique number to identify this exact task
          title: "Learn JS",        // String (text)
          description: "Details",   // String (text)
          date: "2026-10-04",       // String formatted as YYYY-MM-DD
          time: "14:00",            // String formatted as HH:MM
          priority: "High",         // String ("High", "Medium", or "Low")
          category: "Study",        // String ("Study", "Work", etc.)
          reminder: true,           // Boolean (true or false)
          reminderTriggered: false, // Boolean flag to avoid repeating alerts
          isCompleted: false        // Boolean flag (true = completed, false = pending)
        }

   2. HOW A TASK IS ADDED:
      - When the user clicks "Add Task", the form triggers the `submit` event.
      - We call `event.preventDefault()` so the browser does NOT refresh the page.
      - We read values from the HTML inputs using `taskTitleInput.value`.
      - We create a new task object with `Date.now()` as a unique ID.
      - We insert the new object into our array using `tasks.unshift(newTask)`
        (which places it at the beginning of the list).
      - We call `saveTasksToLocalStorage()` and `renderTasks()` to display it.

   3. HOW A TASK IS DISPLAYED (RENDERING):
      - We find the HTML container using `document.getElementById('tasksListContainer')`.
      - We clear previous contents using `tasksListContainer.innerHTML = ''`.
      - We loop over the tasks using `filteredTasks.forEach(task => { ... })`.
      - For each task, we create a `<div>` element, build its inner HTML using
        template literals (backticks `...`), and append it to the container.

   4. HOW A TASK IS MARKED COMPLETED:
      - When the user clicks the "Complete" button, it calls `toggleTaskComplete(task.id)`.
      - We find the task object inside the array using `tasks.find(t => t.id === id)`.
      - We flip its boolean state: `task.isCompleted = !task.isCompleted`.
      - We save the array and re-render the list so the completed card shows
        strikethrough text and updated counter numbers.

   5. HOW A TASK IS DELETED:
      - When the user clicks "Delete", it calls `deleteTask(task.id)`.
      - We find the index of the task using `tasks.findIndex(t => t.id === id)`.
      - We remove the task from the array using `tasks.splice(taskIndex, 1)`.
      - We update localStorage and re-render the view.

   6. HOW THE REMINDER WORKS:
      - A timer runs in the background using `setInterval(checkReminders, 5000)`.
      - Every 5 seconds, `checkReminders()` gets the current Date and Time.
      - It checks if any task has:
        (task.reminder === true && !task.isCompleted && !task.reminderTriggered)
      - When the task's date and time match the current moment, `triggerReminder(task)`
        is called.
      - It sets `task.reminderTriggered = true` so the alert only fires once.
      - It plays a chime sound and triggers a browser Notification / alert / toast.

   7. HOW LOCAL STORAGE WORKS:
      - `localStorage` is a built-in browser database that keeps data even when
        the user refreshes or closes the browser.
      - Because localStorage only stores text (strings), we convert our array
        into a JSON string using `JSON.stringify(tasks)` before saving with:
        `localStorage.setItem('key', jsonString)`.
      - When the page loads, we retrieve the string using `localStorage.getItem('key')`
        and convert it back into real JavaScript objects using `JSON.parse(savedData)`.

   8. WHERE IF / ELSE IF / ELSE IS USED:
      - Validation: `if (title === '') { ... } else if (date === '') { ... }`
      - Hour greetings: `if (hour < 12) { ... } else if (hour < 17) { ... } else { ... }`
      - Filtering tasks: Checking whether a task matches status, category, or search query.

   9. WHERE THE SWITCH STATEMENT IS USED:
      - In `getCategoryDetails(category)`: To assign specific icons, labels, and
        CSS color themes for 'Study', 'Work', 'Personal', 'Exercise', and 'Other'.
      - In `getPriorityDetails(priority)`: To assign priority badges and colors
        for 'High', 'Medium', and 'Low'.
      - WHY SWITCH? Because we are comparing one single variable against known exact
        values. Switch is cleaner and easier to read than multiple `else if` chains.

   10. WHERE FUNCTIONS ARE USED:
       - Functions allow us to group code into reusable, organized blocks.
       - Examples:
         - `initApp()`: Starts the app.
         - `renderTasks()`: Draws cards on screen.
         - `updateSummaryStats()`: Recalculates stats.
         - `handleFormSubmit()`: Processes the form.
         - `showToast()`: Displays temporary pop-up messages.

   ==========================================================================
   ========================================================================== */
