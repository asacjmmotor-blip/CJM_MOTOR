/**
 * CS Search & History Logic
 * CJM Motor - Sistem Informasi Service Bengkel Motor
 */

function formatPlateInput(inputEl) {
  if (!inputEl) return;
  inputEl.addEventListener('input', function () {
    let start = this.selectionStart;
    let end = this.selectionEnd;
    this.value = this.value.toUpperCase();
    this.setSelectionRange(start, end);
  });
}
