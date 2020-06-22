window.addEventListener('load', function () {
  function render({ node, items }) {
    node.innerHTML = '';
    for (var item of items) {
      var div = document.createElement('div');
      div.innerHTML = '<h3>' + item.title + '</h3>';
      node.appendChild(div);
    }
  }
  var nodes = document.body.querySelectorAll('[data-trotzig-multi-calendar]');
  nodes.forEach(function (el) {
    var urls = el.getAttribute('data-trotzig-multi-calendar').split(',');
    var base = document.head
      .querySelector('link[rel="https://api.w.org/"]')
      .getAttribute('href');
    var allItems = [];
    Promise.all(
      urls.map(function (url) {
        return fetch(
          base +
            'trotzig-multi-calendar/get-feed?url=' +
            encodeURIComponent(url),
        )
          .then(function (res) {
            if (!res.ok) {
              throw new Error('Failed to fetch feed');
            }
            return res.json();
          })
          .then(function (json) {
            allItems = allItems.concat(json.channel.item);
          });
      }),
    ).then(function () {
      render({ items: allItems, node: el });
    });
  });
});
