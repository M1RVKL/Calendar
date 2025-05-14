function openModal({ day, month, year, event = null }) {
document.getElementById('modal-root');
  document.getElementById('close-modal').onclick = closeModal;
  // TODO
}

function closeModal() {
  document.getElementById('modal-root').innerHTML = '';
}
