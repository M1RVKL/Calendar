import { getToken, createEvent, getEvents, deleteEvent } from './api.js';
// import { openModal } from './modal.js';

let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let events = [];

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
  const startYear = 2020;
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
    const dayEvents = events.filter(ev => {
  // Normal event on this date
  if (ev.date && ev.date.startsWith(dateStr)) return true;
  // Repeat logic
  if (ev.repeat && ev.repeat.type && ev.repeat.type !== 'none') {
    const eventDate = new Date(ev.date);
    const thisDate = new Date(year, month, d);
    if (ev.repeat.type === 'weekly') {
      // Check weekday match
      const weekday = thisDate.getDay();
      if (ev.repeat.daysOfWeek && ev.repeat.daysOfWeek.includes(weekday)) {
        // Optionally check endDate
        if (!ev.repeat.endDate || thisDate <= new Date(ev.repeat.endDate)) {
          // Only show if event started before this date
          if (eventDate <= thisDate) return true;
        }
      }
    }
    // Add daily/monthly logic as needed
  }
  return false;
});
    const eventsContainer = document.createElement('div');
    eventsContainer.className = 'calendar-events';
    dayEvents.forEach(ev => {
      const evDiv = document.createElement('div');
      evDiv.className = `event ${ev.importance}`;
      eventsContainer.appendChild(evDiv);
    });
    cell.appendChild(eventsContainer);
    grid.appendChild(cell);
  }
  document.getElementById('month-label').textContent = `${new Date(year, month).toLocaleString('default', { month: 'long' })} ${year}`;
}


let modalLoaded = false;

async function openModalForDay(day, month, year) {
  if (!modalLoaded) {
    const resp = await fetch('modal.html');
    const html = await resp.text();
    document.body.insertAdjacentHTML('beforeend', html);
    modalLoaded = true;
  }
  // Always re-init MicroModal after modal is inserted
  if (window.MicroModal) MicroModal.init();

  // Add event listeners for the plan functionality
  const addPlanBtn = document.getElementById('add-plan-btn');
  const planInputContainer = document.getElementById('plan-input-container');
  const savePlanBtn = document.getElementById('save-plan-btn');
  const planInput = document.getElementById('plan-input');
  const importanceSelect = document.getElementById('importance-select');
  const plansList = document.getElementById('plans-list');
  const scheduledCheckbox = document.getElementById('scheduled-checkbox');
  const timeInputContainer = document.getElementById('time-input-container');
  const planTime = document.getElementById('plan-time');

  addPlanBtn.onclick = () => {
    planInputContainer.style.display = 'block';
    planInput.focus();
  };

  scheduledCheckbox.onchange = function() {
    if (this.checked) {
      timeInputContainer.style.display = 'block';
    } else {
      timeInputContainer.style.display = 'none';
      planTime.value = '';
    }
  };

  savePlanBtn.onclick = async () => {
    const planText = planInput.value.trim();
    if (planText) {
      const importance = importanceSelect.value;
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isScheduled = scheduledCheckbox.checked;
      const time = isScheduled ? planTime.value : undefined;

  const repeat = {
    type: repeatType.value,
    daysOfWeek: [],
    interval: 1
  };
  if (repeat.type === 'weekly') {
   repeat.daysOfWeek = Array.from(repeatWeekdays.querySelectorAll('input:checked')).map(cb => Number(cb.value));
  }

      try {
        const event = {
          date: dateStr,
          note: planText,
          importance: importance,
          repeat
        };
        if (isScheduled && time) {
          event.startTime = time;
        }
        await createEvent(event);
        // Add the plan to the list
        const planItem = document.createElement('div');
        planItem.className = `plan-item ${importance}`;
        planItem.innerHTML = `
          <span>${planText}${isScheduled && time ? ' <span style=\'color:#1976d2;font-size:0.95em\'>' + time + '</span>' : ''}</span>
          <span class="importance-badge">${importance}</span>
        `;
        plansList.appendChild(planItem);
        // Clear and hide the input
        planInput.value = '';
        planTime.value = '';
        scheduledCheckbox.checked = false;
        timeInputContainer.style.display = 'none';
        planInputContainer.style.display = 'none';
        // Refresh the calendar to show the new event
        events = await getEvents();
        renderPlansList();
        await loadAndRenderCalendar(currentMonth, currentYear);
      } catch (error) {
        console.error('Error saving plan:', error);
      }
    }
  };

  function renderPlansList() {
    plansList.innerHTML = '';
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayEvents = events.filter(ev => ev.date && ev.date.startsWith(dateStr));
    dayEvents.forEach(event => {
      const div = document.createElement('div');
      div.className = `plan-item ${event.importance}`;
      div.textContent = event.note + (event.startTime ? ` (${event.startTime})` : '');
      
      const delBtn = document.createElement('button');
    delBtn.textContent = '🗑️';
    delBtn.className = 'delete';
    delBtn.style.marginLeft = '10px';
    delBtn.onclick = async (clickEvent) => {
      clickEvent.stopPropagation();
      try {
        await deleteEvent(event._id);
        events = await getEvents();
        renderPlansList();
        await loadAndRenderCalendar(currentMonth, currentYear);
      } catch (err) {
        alert('Failed to delete event');
      }
    };
      div.appendChild(delBtn);
      plansList.appendChild(div);
    });
  }
 
  const repeatType = document.getElementById('repeat-type');
const repeatWeekdays = document.getElementById('repeat-weekdays');

repeatType.onchange = function() {
  repeatWeekdays.style.display = this.value === 'weekly' ? 'block' : 'none';
};
  renderPlansList();
  // Format the date nicely
  const date = new Date(year, month, day);
  const formattedDate = date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  document.getElementById('modal-1-title').textContent = formattedDate;
  // Load existing plans for this day
  MicroModal.show('modal-1');
}