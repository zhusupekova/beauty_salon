const appointmentForm = document.querySelector('#appointmentForm');
const expenseForm = document.querySelector('#expenseForm');
const clientForm = document.querySelector('#clientForm');
const inventoryForm = document.querySelector('.inventory-form');
const appointmentList = document.querySelector('#appointmentList');
const clientsList = document.querySelector('#clientsList');
const scheduleList = document.querySelector('#scheduleList');
const loyaltyInfo = document.querySelector('#loyaltyInfo');
const inventoryList = document.querySelector('#inventoryList');
const reportOutput = document.querySelector('#reportOutput');
const clientModal = document.querySelector('#clientModal');
const searchInput = document.querySelector('#searchInput');
const statusFilter = document.querySelector('#statusFilter');
const exportBtn = document.querySelector('.export-btn');
const financialFilter = document.querySelector('#financialFilter');
const financialSummary = document.querySelector('#financialSummary');
const reportType = document.querySelector('#reportType');

let appointments = JSON.parse(localStorage.getItem('appointments')) || [];
let clients = JSON.parse(localStorage.getItem('clients')) || [];
let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
let inventory = JSON.parse(localStorage.getItem('inventory')) || [];
let loyalty = JSON.parse(localStorage.getItem('loyalty')) || {};

function saveToLocalStorage() {
    try {
        localStorage.setItem('appointments', JSON.stringify(appointments));
        localStorage.setItem('clients', JSON.stringify(clients));
        localStorage.setItem('expenses', JSON.stringify(expenses));
        localStorage.setItem('inventory', JSON.stringify(inventory));
        localStorage.setItem('loyalty', JSON.stringify(loyalty));
    } catch (e) {
        console.error('Ошибка сохранения в localStorage:', e);
        showNotification('Ошибка сохранения данных', 'error');
    }
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `${message} <button class="close-notification">×</button>`;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 300);
    }, 3000);

    notification
        .querySelector('.close-notification')
        .addEventListener('click', () => notification.remove());
}

// Appointments
function addAppointment(e) {
    e.preventDefault();
    const clientName = document.querySelector('#clientName').value.trim();
    const service = document.querySelector('#service').value;
    const master = document.querySelector('#master').value;
    const date = document.querySelector('#date').value;
    const time = document.querySelector('#time').value;

    if (!clientName || !service || !master || !date || !time) {
        showNotification('Заполните все поля', 'error');
        return;
    }

    const [serviceName, price] = service.split(' - ');
    const appointment = {
        id: Date.now(),
        clientName,
        service: serviceName,
        price: parseFloat(price),
        master,
        date,
        time,
        status: 'pending'
    };

    appointments.push(appointment);
    updateLoyalty(clientName, parseFloat(price) / 100);
    saveToLocalStorage();
    displayAppointments();
    showNotification('Запись добавлена', 'success');
    appointmentForm.reset();
}

function cancelAppointment(id) {
    appointments = appointments.map(app =>
        app.id === id ? { ...app, status: 'canceled' } : app
    );
    saveToLocalStorage();
    displayAppointments();
    showNotification('Запись отменена', 'warning');
}

function completeAppointment(id) {
    appointments = appointments.map(app =>
        app.id === id ? { ...app, status: 'completed' } : app
    );
    saveToLocalStorage();
    displayAppointments();
    showNotification('Запись завершена', 'success');
}

function sendReminder(id) {
    const appointment = appointments.find(app => app.id === id);
    if (appointment) {
        showNotification(`Напоминание для ${appointment.clientName} отправлено`, 'info');
    } else {
        showNotification('Запись не найдена', 'error');
    }
}

function displayAppointments(filteredAppointments = appointments) {
    appointmentList.innerHTML = '';
    filteredAppointments.forEach(app => {
        const card = document.createElement('div');
        card.className = 'appointment-card';
        card.innerHTML = `
            <h4>${app.clientName}</h4>
            <p>Услуга: ${app.service}</p>
            <p>Цена: ${app.price} ₽</p>
            <p>Мастер: ${app.master}</p>
            <p>Дата: ${app.date}</p>
            <p>Время: ${app.time}</p>
            <p>Статус: ${
                app.status === 'pending'
                    ? 'Ожидает'
                    : app.status === 'completed'
                    ? 'Завершено'
                    : 'Отменено'
            }</p>
            <div class="appointment-actions">
                ${
                    app.status === 'pending'
                        ? `
                    <button class="complete-btn" onclick="completeAppointment(${app.id})">
                        <i class="fas fa-check"></i> Завершить
                    </button>
                    <button class="cancel-btn" onclick="cancelAppointment(${app.id})">
                        <i class="fas fa-times"></i> Отменить
                    </button>
                    <button class="reminder-btn" onclick="sendReminder(${app.id})">
                        <i class="fas fa-bell"></i> Напомнить
                    </button>
                `
                        : ''
                }
            </div>
        `;
        appointmentList.appendChild(card);
    });
    displaySchedules();
}

// Clients
function addClient(e) {
    e.preventDefault();
    const name = document.querySelector('#modalName').value.trim();
    const phone = document.querySelector('#modalPhone').value.trim();
    const email = document.querySelector('#modalEmail').value.trim();

    if (!name || !phone) {
        showNotification('Имя и телефон обязательны', 'error');
        return;
    }

    const client = { id: Date.now(), name, phone, email, visits: [] };
    clients.push(client);
    saveToLocalStorage();
    displayClients();
    closeModal();
    showNotification('Клиент добавлен', 'success');
}

function editClient(id) {
    const client = clients.find(c => c.id === id);
    if (!client) {
        showNotification('Клиент не найден', 'error');
        return;
    }

    document.querySelector('#modalName').value = client.name;
    document.querySelector('#modalPhone').value = client.phone;
    document.querySelector('#modalEmail').value = client.email;

    clientForm.onsubmit = e => {
        e.preventDefault();
        const name = document.querySelector('#modalName').value.trim();
        const phone = document.querySelector('#modalPhone').value.trim();
        const email = document.querySelector('#modalEmail').value.trim();

        if (!name || !phone) {
            showNotification('Имя и телефон обязательны', 'error');
            return;
        }

        clients = clients.map(c =>
            c.id === id
                ? {
                      ...c,
                      name,
                      phone,
                      email
                  }
                : c
        );

        saveToLocalStorage();
        displayClients();
        closeModal();
        showNotification('Клиент обновлен', 'success');
        clientForm.onsubmit = addClient;
    };

    clientModal.style.display = 'flex';
}

function deleteClient(id) {
    clients = clients.filter(c => c.id !== id);
    saveToLocalStorage();
    displayClients();
    showNotification('Клиент удален', 'error');
}

function displayClients() {
    clientsList.innerHTML = '';
    clients.forEach(client => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${client.name}</td>
            <td>${client.phone}</td>
            <td>${client.email || '-'}</td>
            <td>
                <button class="action-btn" onclick="editClient(${client.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn" onclick="deleteClient(${client.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        clientsList.appendChild(row);
    });
}

// Financials
function addExpense(e) {
    e.preventDefault();
    const description = document.querySelector('#expenseDescription').value.trim();
    const amount = parseFloat(document.querySelector('#expenseAmount').value);
    const date = document.querySelector('#expenseDate').value;

    if (!description || isNaN(amount) || !date) {
        showNotification('Заполните все поля для расхода', 'error');
        return;
    }

    const expense = { id: Date.now(), description, amount, date };
    expenses.push(expense);
    saveToLocalStorage();
    displayFinancialSummary();
    showNotification('Расход добавлен', 'success');
    expenseForm.reset();
}

function displayFinancialSummary() {
    const filter = financialFilter.value;
    const today = new Date().toISOString().split('T')[0];
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];

    const filteredAppointments = appointments.filter(app => {
        if (filter === 'today') return app.date === today;
        if (filter === 'week') return app.date >= weekAgo;
        if (filter === 'month') return app.date >= monthAgo;
        return true;
    });

    const filteredExpenses = expenses.filter(exp => {
        if (filter === 'today') return exp.date === today;
        if (filter === 'week') return exp.date >= weekAgo;
        if (filter === 'month') return exp.date >= monthAgo;
        return true;
    });

    const revenue = filteredAppointments
        .filter(app => app.status === 'completed')
        .reduce((sum, app) => sum + (app.price || 0), 0);

    const expenseTotal = filteredExpenses.reduce(
        (sum, exp) => sum + (exp.amount || 0),
        0
    );

    const profit = revenue - expenseTotal;

    financialSummary.innerHTML = `
        <p>Выручка: ${revenue.toFixed(2)} ₽</p>
        <p>Расходы: ${expenseTotal.toFixed(2)} ₽</p>
        <p>Прибыль: ${profit.toFixed(2)} ₽</p>
    `;
}

// Schedules
function displaySchedules() {
    scheduleList.innerHTML = '';
    appointments.forEach(app => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${app.master}</td>
            <td>${app.date}</td>
            <td>${app.time}</td>
            <td>${
                app.status === 'pending'
                    ? 'Запланировано'
                    : app.status === 'completed'
                    ? 'Завершено'
                    : 'Отменено'
            }</td>
        `;
        scheduleList.appendChild(row);
    });
}

// Loyalty
function updateLoyalty(clientName, points) {
    loyalty[clientName] = (loyalty[clientName] || 0) + points;
    displayLoyalty();
}

function displayLoyalty() {
    loyaltyInfo.innerHTML = Object.entries(loyalty)
        .map(
            ([client, points]) =>
                `<p>${client}: ${points.toFixed(2)} бонусов</p>`
        )
        .join('');
}

// Inventory
function addInventoryItem(e) {
    e.preventDefault();
    const name = document.querySelector('#itemName').value.trim();
    const quantity = parseInt(document.querySelector('#itemQuantity').value);

    if (!name || isNaN(quantity)) {
        showNotification('Заполните все поля для инвентаря', 'error');
        return;
    }

    const item = { id: Date.now(), name, quantity };
    inventory.push(item);
    saveToLocalStorage();
    displayInventory();
    showNotification('Товар добавлен', 'success');
    inventoryForm.reset();
}

function deleteInventoryItem(id) {
    inventory = inventory.filter(item => item.id !== id);
    saveToLocalStorage();
    displayInventory();
    showNotification('Товар удален', 'error');
}

function displayInventory() {
    inventoryList.innerHTML = '';
    inventory.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.name}</td>
            <td>${item.quantity}</td>
            <td>
                <button class="action-btn" onclick="deleteInventoryItem(${item.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        inventoryList.appendChild(row);
    });
}

// Reports
function displayReports() {
    const type = reportType.value;
    let output = '';

    try {
        if (type === 'revenue') {
            const revenue = appointments
                .filter(app => app.status === 'completed')
                .reduce((sum, app) => sum + (app.price || 0), 0);
            output = `<p>Общая выручка: ${revenue.toFixed(2)} ₽</p>`;
        } else if (type === 'workload') {
            const masters = [...new Set(appointments.map(app => app.master))];
            output = masters
                .map(master => {
                    const count = appointments.filter(
                        app =>
                            app.master === master &&
                            app.status !== 'canceled'
                    ).length;
                    return `<p>${master}: ${count} записей</p>`;
                })
                .join('');
        } else if (type === 'services') {
            const services = [...new Set(appointments.map(app => app.service))];
            output = services
                .map(service => {
                    const count = appointments.filter(
                        app =>
                            app.service === service &&
                            app.status !== 'canceled'
                    ).length;
                    return `<p>${service}: ${count} заказов</p>`;
                })
                .join('');
        }
        reportOutput.innerHTML = output;
    } catch (e) {
        console.error('Ошибка генерации отчета:', e);
        showNotification('Ошибка генерации отчета', 'error');
    }
}

// Export to CSV
function exportToCSV() {
    try {
        if (!appointments.length) {
            showNotification('Нет записей для экспорта', 'warning');
            return;
        }

        const escapeCSV = str => {
            if (!str) return '';
            const escaped = str.toString().replace(/"/g, '""');
            return `"${escaped}"`;
        };

        const headers = [
            'ID',
            'Клиент',
            'Услуга',
            'Цена',
            'Мастер',
            'Дата',
            'Время',
            'Статус'
        ];

        const rows = appointments.map(app =>
            [
                app.id,
                escapeCSV(app.clientName),
                escapeCSV(app.service),
                app.price || 0,
                escapeCSV(app.master),
                escapeCSV(app.date),
                escapeCSV(app.time),
                escapeCSV(app.status)
            ].join(',')
        );

        const csvContent = [headers.join(','), ...rows].join('\n');

        const bom = '\uFEFF';
        const blob = new Blob([bom + csvContent], {
            type: 'text/csv;charset=utf-8;'
        });

        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `appointments_${new Date()
            .toISOString()
            .split('T')[0]}.csv`;
        link.style.display = 'none';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showNotification('Данные экспортированы', 'success');
    } catch (e) {
        console.error('Ошибка экспорта CSV:', e);
        showNotification('Ошибка экспорта данных', 'error');
    }
}

// Modal
function openModal() {
    clientForm.onsubmit = addClient;
    document.querySelector('#modalName').value = '';
    document.querySelector('#modalPhone').value = '';
    document.querySelector('#modalEmail').value = '';
    clientModal.style.display = 'flex';
}

function closeModal() {
    clientModal.style.display = 'none';
}

// Navigation
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', e => {
        e.preventDefault();
        document
            .querySelectorAll('.nav-link')
            .forEach(l => l.classList.remove('active'));
        document
            .querySelectorAll('.content')
            .forEach(c => c.classList.remove('active'));

        link.classList.add('active');
        const sectionId = link.getAttribute('href').substring(1);
        document.querySelector(`#${sectionId}`).classList.add('active');
    });
});

// Event Listeners
try {
    appointmentForm.addEventListener('submit', addAppointment);
    expenseForm.addEventListener('submit', addExpense);
    clientForm.addEventListener('submit', addClient);
    inventoryForm.addEventListener('submit', addInventoryItem);

    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.toLowerCase();
        const filtered = appointments.filter(app =>
            (app.clientName || '').toLowerCase().includes(searchTerm) ||
            (app.service || '').toLowerCase().includes(searchTerm)
        );
        displayAppointments(filtered);
    });

    statusFilter.addEventListener('change', () => {
        const status = statusFilter.value;
        const filtered =
            status === 'all'
                ? appointments
                : appointments.filter(app => app.status === status);
        displayAppointments(filtered);
    });

    exportBtn.addEventListener('click', exportToCSV);
    financialFilter.addEventListener('change', displayFinancialSummary);
    reportType.addEventListener('change', displayReports);
} catch (e) {
    console.error('Ошибка привязки событий:', e);
    showNotification('Ошибка инициализации приложения', 'error');
}

// Initialize
try {
    displayAppointments();
    displayClients();
    displayFinancialSummary();
    displaySchedules();
    displayLoyalty();
    displayInventory();
    displayReports();
} catch (e) {
    console.error('Ошибка инициализации:', e);
    showNotification('Ошибка загрузки данных', 'error');
}