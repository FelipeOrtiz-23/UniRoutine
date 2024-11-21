document.addEventListener('DOMContentLoaded', function () {
    const taskForm = document.getElementById('task-form');
    const taskList = document.getElementById('task-list');
    const ctxProgress = document.getElementById('progress-chart').getContext('2d');
    const ctxPriority = document.getElementById('priority-chart').getContext('2d');

    let tasks = [];

    // Inicializar gráficos
    const progressChart = new Chart(ctxProgress, {
        type: 'doughnut',
        data: {
            labels: ['Completadas', 'Pendientes', 'En Proceso'],
            datasets: [{
                label: 'Progreso de las Tareas',
                data: [0, 0, 0],
                backgroundColor: ['#28a745', '#dc3545', '#ffc107'],
                borderWidth: 1
            }]
        }
    });

    const priorityChart = new Chart(ctxPriority, {
        type: 'bar',
        data: {
            labels: ['Alta', 'Media', 'Baja'],
            datasets: [{
                label: 'Prioridad de las Tareas',
                data: [0, 0, 0],
                backgroundColor: ['#ff5733', '#ffc107', '#28a745'],
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

    taskForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const taskName = document.getElementById('task-name').value;
        const taskCategory = document.getElementById('task-category').value;
        const taskPriority = document.getElementById('task-priority').value;
        const taskStatus = document.getElementById('task-status').value;
        const taskDate = document.getElementById('task-date').value;
        const taskDuration = document.getElementById('task-duration').value;
        const taskNotes = document.getElementById('task-notes').value;

        if (taskName && taskDate && taskDuration) {
            const task = {
                name: taskName,
                category: taskCategory,
                priority: taskPriority,
                status: taskStatus,
                date: taskDate,
                duration: taskDuration,
                notes: taskNotes
            };

            tasks.push(task);
            addTaskToList(task);
            updateCharts();
            taskForm.reset();
        }
    });

    function addTaskToList(task) {
        const li = document.createElement('li');
        li.innerHTML = `
            ${task.name} - ${task.category} - ${task.date} (${task.status})
            <button class="edit-btn">Editar</button>
            <button class="delete-btn">Eliminar</button>
        `;
        const editBtn = li.querySelector('.edit-btn');
        const deleteBtn = li.querySelector('.delete-btn');

        editBtn.addEventListener('click', () => editTask(task, li));
        deleteBtn.addEventListener('click', () => deleteTask(li));

        taskList.appendChild(li);
    }

    function editTask(task, li) {
        document.getElementById('task-name').value = task.name;
        document.getElementById('task-category').value = task.category;
        document.getElementById('task-priority').value = task.priority;
        document.getElementById('task-status').value = task.status;
        document.getElementById('task-date').value = task.date;
        document.getElementById('task-duration').value = task.duration;
        document.getElementById('task-notes').value = task.notes;

        // Eliminar tarea editada de la lista para evitar duplicados
        taskList.removeChild(li);
        tasks = tasks.filter(t => t.name !== task.name);
        updateCharts();
    }

    function deleteTask(li) {
        taskList.removeChild(li);
        tasks = tasks.filter(t => t.name !== li.firstChild.textContent.split(' - ')[0]);
        updateCharts();
    }

    function updateCharts() {
        const completedTasks = tasks.filter(t => t.status === 'Completada').length;
        const pendingTasks = tasks.filter(t => t.status === 'Pendiente').length;
        const inProgressTasks = tasks.filter(t => t.status === 'En Proceso').length;

        const highPriority = tasks.filter(t => t.priority === 'Alta').length;
        const mediumPriority = tasks.filter(t => t.priority === 'Media').length;
        const lowPriority = tasks.filter(t => t.priority === 'Baja').length;

        // Actualizar gráfico de progreso
        progressChart.data.datasets[0].data = [completedTasks, pendingTasks, inProgressTasks];
        progressChart.update();

        // Actualizar gráfico de prioridad
        priorityChart.data.datasets[0].data = [highPriority, mediumPriority, lowPriority];
        priorityChart.update();
    }
});
