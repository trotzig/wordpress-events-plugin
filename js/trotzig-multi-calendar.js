window.addEventListener('load', function () {
  const nodes = document.body.querySelectorAll('[data-trotzig-multi-calendar]');
  nodes.forEach(function (el) {
    const urls = el.getAttribute('data-trotzig-multi-calendar').split('|');
    fetch(urls[0]).then(function (data) {
      console.log('data', data);
    });
  });
});
