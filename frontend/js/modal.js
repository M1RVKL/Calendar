import { createEvent, getEvents, deleteEvent } from './api.js';

let modalLoaded = false;
let events = [];

export async function openModalForDay(day, month, year, currentMonth, currentYear, callbackRefreshCalendar) {
  if (!modalLoaded) {
    const resp = await fetch('modal.html');
    const html = await resp.text();
    document.body.insertAdjacentHTML('beforeend', html);
    modalLoaded = true;

    if (window.MicroModal) {
      MicroModal.init();
    }
  }

  const closeBtn = document.querySelector('.modal__close');
    if (closeBtn && !closeBtn.dataset.listenerAdded) {
      closeBtn.removeAttribute('data-micromodal-close');
      closeBtn.addEventListener('click', () => {
        if (document.activeElement) document.activeElement.blur();
        MicroModal.close('modal-1');
      });
      closeBtn.dataset.listenerAdded = true;
    }
    
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
    timeInputContainer.style.display = this.checked ? 'block' : 'none';
    if (!this.checked) planTime.value = '';
  };

  savePlanBtn.onclick = async () => {
    const planText = planInput.value.trim();
    if (planText) {
      const importance = importanceSelect.value;
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isScheduled = scheduledCheckbox.checked;
      const time = isScheduled ? planTime.value : undefined;

      try {
        const event = { date: dateStr, note: planText, importance };
        if (isScheduled && time) event.startTime = time;
        await createEvent(event);

        planInput.value = '';
        planTime.value = '';
        scheduledCheckbox.checked = false;
        timeInputContainer.style.display = 'none';
        planInputContainer.style.display = 'none';

        events = await getEvents();
        renderPlansList();
        await callbackRefreshCalendar(currentMonth, currentYear);
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
      delBtn.onclick = async (e) => {
        e.stopPropagation();
        try {
          await deleteEvent(event._id);
          events = await getEvents();
          renderPlansList();
          await callbackRefreshCalendar(currentMonth, currentYear);
        } catch (err) {
          alert('Failed to delete event');
        }
      };

      div.appendChild(delBtn);
      plansList.appendChild(div);
    });
  }

  events = await getEvents();
  renderPlansList();

  const date = new Date(year, month, day);
  const formattedDate = date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  document.getElementById('modal-1-title').textContent = formattedDate;

  MicroModal.show('modal-1');
}

export function setModalEvents(data) {
  events = data;
}