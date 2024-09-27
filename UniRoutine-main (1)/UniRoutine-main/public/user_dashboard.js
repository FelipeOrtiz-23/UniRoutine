let totalTasks = 0;
let totalEvents = 0;
let tasks = [];

const ctx = document.getElementById('taskChart').getContext('2d');
let taskChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: ['High', 'Medium', 'Low'],
        datasets: [{
            label: 'Prioridad',
            data: [0, 0, 0], // High, Medium, Low counts
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(75, 192, 192, 0.2)'
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(75, 192, 192, 1)'
            ],
            borderWidth: 1
        }]
    },
    options: {
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});

document.getElementById('saveButton').addEventListener('click', function() {
    const title = document.getElementById('taskTitle').value;
    const description = document.getElementById('taskDescription').value;
    const date = document.getElementById('taskDate').value;
    const duration = document.getElementById('taskDuration').value;
    const priority = document.querySelector('input[name="priority"]:checked').value;
    const category = document.querySelector('input[name="category"]:checked').value;

    if (title && description && date && duration) {
        const task = {
            title,
            description,
            date,
            duration,
            priority,
            category,
            status: 'Pending'
        };

        tasks.push(task);
        totalTasks++;
        if (category === "Event") {
            totalEvents++;
        }

        updateTaskList();
        updateTotalCounts();
        updateChart();
        clearInputs();
    }
});

function updateTaskList() {
    const tasksDisplay = document.getElementById('tasksDisplay');
    tasksDisplay.innerHTML = '';

    tasks.forEach((task, index) => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `
            <strong>${task.category}:</strong> ${task.title}<br>
            Descripción: ${task.description}<br>
            Fecha: ${task.date} - Duración: ${task.duration} mins<br>
            Prioridad: ${task.priority} - Estado: ${task.status}
            <button class="edit" onclick="editTask(${index})">Editar</button>
            <button class="delete" onclick="deleteTask(${index})">Eliminar</button>
        `;
        tasksDisplay.appendChild(listItem);
    });
}

function updateTotalCounts() {
    document.getElementById('totalTasks').innerText = totalTasks;
    document.getElementById('totalEvents').innerText = totalEvents;
}

function updateChart() {
    const priorityCounts = {
        High: 0,
        Medium: 0,
        Low: 0
    };

    tasks.forEach(task => {
        priorityCounts[task.priority]++;
    });

    taskChart.data.datasets[0].data = [priorityCounts.High, priorityCounts.Medium, priorityCounts.Low];
    taskChart.update();
}

function clearInputs() {
    document.getElementById('taskTitle').value = '';
    document.getElementById('taskDescription').value = '';
    document.getElementById('taskDate').value = '';
    document.getElementById('taskDuration').value = '';
}

function deleteTask(index) {
    tasks.splice(index, 1);
    totalTasks = tasks.filter(task => task.category === "Task").length;
    totalEvents = tasks.filter(task => task.category === "Event").length;

    updateTaskList();
    updateTotalCounts();
    updateChart();
}

function editTask(index) {
    const task = tasks[index];
    document.getElementById('taskTitle').value = task.title;
    document.getElementById('taskDescription').value = task.description;
    document.getElementById('taskDate').value = task.date;
    document.getElementById('taskDuration').value = task.duration;

    // Set priority
    document.querySelector(`input[name="priority"][value="${task.priority}"]`).checked = true;
    // Set category
    document.querySelector(`input[name="category"][value="${task.category}"]`).checked = true;

    // Remove task from the list
    deleteTask(index);
}


// Fetch tasks from the database
async function fetchTasks() {
    const response = await fetch('/tasks');
    const tasks = await response.json();
    return tasks;
}

async function initializeDashboard() {
    tasks = await fetchTasks();
    totalTasks = tasks.length;
    updateTaskList();
    updateTotalCounts();
    updateChart();
}