import { getToken, getEvents } from './api.js';
// import { openModal } from './modal.js';

let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let events = [];

document.addEventListener('DOMContentLoaded', async () => {
  // Protect page
  if (!getToken()) {
    window.location.href = 'index.html';
    return;
  }
  await loadAndRenderCalendar(currentMonth, currentYear);
});

document.getElementById('prev-month').addEventListener('click', async () => {
  currentMonth--;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }
  await loadAndRenderCalendar(currentMonth, currentYear);
});
document.getElementById('next-month').addEventListener('click', async () => {
  currentMonth++;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  await loadAndRenderCalendar(currentMonth, currentYear);
});

// Year dropdown logic
const monthLabel = document.getElementById('month-label');
const yearDropdown = document.getElementById('year-dropdown');

function populateYearDropdown(selectedYear) {
  const startYear = 1980;
  const endYear = new Date().getFullYear() + 10;
  yearDropdown.innerHTML = '';
  for (let y = startYear; y <= endYear; y++) {
    const yearDiv = document.createElement('div');
    yearDiv.textContent = y;
    yearDiv.className = 'year-option' + (y === selectedYear ? ' selected' : '');
    yearDiv.style.padding = '4px 12px';
    yearDiv.style.cursor = 'pointer';
    yearDiv.addEventListener('mousedown', async (e) => {
      // Use mousedown so it triggers before blur
      currentYear = y;
      yearDropdown.style.display = 'none';
      await loadAndRenderCalendar(currentMonth, currentYear);
    });
    yearDropdown.appendChild(yearDiv);
  }
}

monthLabel.addEventListener('click', (e) => {
  populateYearDropdown(currentYear);
  // Position the dropdown right below the button
  yearDropdown.style.display = 'block';
  const parentRect = monthLabel.parentElement.getBoundingClientRect();
  const labelRect = monthLabel.getBoundingClientRect();
  yearDropdown.style.position = 'absolute';
  yearDropdown.style.left = (labelRect.left - parentRect.left) + 'px';
  yearDropdown.style.top = (labelRect.bottom - parentRect.top) + 'px';
});

document.addEventListener('mousedown', (e) => {
  if (!yearDropdown.contains(e.target) && e.target !== monthLabel) {
    yearDropdown.style.display = 'none';
  }
});

document.addEventListener('DOMContentLoaded', async () => {
  if (!getToken()) {
    window.location.href = 'index.html';
    return;
  }
  MicroModal.init(); // Initialize MicroModal once
  await loadAndRenderCalendar(currentMonth, currentYear);
});

async function loadAndRenderCalendar(month, year) {
  events = await getEvents();
  renderCalendar(month, year);
}

function renderCalendar(month, year) {
  const grid = document.getElementById('calendar-grid');
  grid.innerHTML = '';
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // Render day headers
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  days.forEach(day => {
    const cell = document.createElement('div');
    cell.className = 'calendar-day calendar-header-day';
    cell.textContent = day;
    grid.appendChild(cell);
  });
  // Empty cells before first day
  for (let i = 0; i < firstDay; i++) {
    const cell = document.createElement('div');
    cell.className = 'calendar-day empty';
    grid.appendChild(cell);
  }
  // Days of month
  for (let d = 1; d <= daysInMonth; d++) {
    const cell = document.createElement('div');
    cell.className = 'calendar-day';
    cell.textContent = d;
    cell.addEventListener('click', () => openModalForDay(d, month, year));
    // Render events for this day
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const dayEvents = events.filter(ev => ev.date && ev.date.startsWith(dateStr));
    dayEvents.forEach(ev => {
      const evDiv = document.createElement('div');
      evDiv.className = `event ${ev.importance}`;
      evDiv.textContent = ev.note;
      cell.appendChild(evDiv);
    });
    grid.appendChild(cell);
  }
  document.getElementById('month-label').textContent = `${new Date(year, month).toLocaleString('default', { month: 'long' })} ${year}`;
}

function openModalForDay(day, month, year) {
  document.getElementById('modal-1-title').textContent = `${month + 1}/${day}/${year}`;
  MicroModal.show('modal-1');
} 