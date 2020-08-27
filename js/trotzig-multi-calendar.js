window.addEventListener('load', function () {
  function getDateString(item) {
    var start = [];
    var end = [];
    if (item.startdate) {
      start.push(item.startdate);
    }
    if (item.starttime) {
      start.push(item.starttime);
    }
    if (item.enddate && item.enddate !== item.startdate) {
      end.push(item.enddate);
    }
    if (item.endtime) {
      end.push(item.endtime);
    }
    var startStr = start.join(', ');
    if (!end.length) {
      return startStr;
    }
    var endStr = end.join(', ');
    return startStr + ' - ' + endStr;
  }

  function render({ node, items }) {
    node.innerHTML = '';
    for (var item of items) {
      var div = document.createElement('div');
      div.setAttribute('class', 'tmc-calendar-item');
      div.innerHTML =
        '<a href="' +
        item.link +
        '" target="_blank">' +
        '<div class="tmc-calendar-item__date">' +
        getDateString(item) +
        '</div>' +
        '<div class="tmc-calendar-item__label">' +
        item.title +
        '</div>';
      ('</a>');
      node.appendChild(div);
    }
  }
  var nodes = document.body.querySelectorAll('[data-trotzig-multi-calendar]');
  if (!nodes.length) {
    return;
  }

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
            allItems = allItems.concat(json);
          });
      }),
    ).then(function () {
      // First, filter out ones that are in the past
      allItems = allItems.filter(function (item) {
        var start = new Date(item.startdate);
        return start > new Date();
      });

      // Sort items, upcoming first
      allItems.sort(function (a, b) {
        var aStart = new Date(a.startdate);
        var bStart = new Date(b.startdate);
        if (aStart > bStart) {
          return 1;
        }
        if (bStart > aStart) {
          return -1;
        }
        return 0;
      });
      render({ items: allItems, node: el });
    });
  });
});
