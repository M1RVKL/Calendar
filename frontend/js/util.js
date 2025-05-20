function formatDate(year, month, day) {
    // Returns YYYY-MM-DD
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }
  
  function parseDate(str) {
    // Expects YYYY-MM-DD
    const [year, month, day] = str.split('-').map(Number);
    return { year, month: month - 1, day };
  }
  
  export { formatDate, parseDate }; 