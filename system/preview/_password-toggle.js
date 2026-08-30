document.querySelectorAll('[data-password-toggle]').forEach(function (button) {
  var container = button.parentElement;
  var input = container && container.querySelector('input');
  var icon = button.querySelector('i');
  if (!(input instanceof HTMLInputElement)) return;

  button.addEventListener('click', function () {
    var visible = input.type === 'password';
    input.type = visible ? 'text' : 'password';
    button.setAttribute('aria-label', visible ? 'Hide password' : 'Show password');
    if (icon) {
      icon.classList.toggle('ph-eye', !visible);
      icon.classList.toggle('ph-eye-slash', visible);
    }
  });
});
