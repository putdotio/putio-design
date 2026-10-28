/* Demo forms submit nowhere: Enter and the submit button both land here,
   so a card never reloads itself. */
document.querySelectorAll('form').forEach(function (form) {
  form.addEventListener('submit', function (event) { event.preventDefault(); });
});
