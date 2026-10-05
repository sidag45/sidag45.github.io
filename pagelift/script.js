// Pagelift site: confirms downloads and keeps the copy-email affordance working.
(function () {
  var statuses = document.querySelectorAll('.dl-status');
  function say(msg) { statuses.forEach(function (el) { el.textContent = msg; }); }

  document.querySelectorAll('a.dl').forEach(function (link) {
    link.addEventListener('click', function () {
      say('Downloading pagelift.zip. Unzip it and follow the install steps below.');
    });
  });

  // Click the email address to copy it.
  document.querySelectorAll('.copy').forEach(function (el) {
    el.setAttribute('title', 'Click to copy');
    el.style.cursor = 'copy';
    el.addEventListener('click', function () {
      var text = el.textContent.trim();
      if (!navigator.clipboard) return;
      navigator.clipboard.writeText(text).then(function () {
        var original = el.textContent;
        el.textContent = 'Copied';
        setTimeout(function () { el.textContent = original; }, 1400);
      }).catch(function () {});
    });
  });
})();
