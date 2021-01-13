window.addEventListener('load', function () {
  function itemKey(item) {
    var pieces = item.title.split(/[–|]/);
    var candidate = pieces[pieces.length - 1];
    return candidate
      .toLowerCase()
      .replace(/[^a-z]/, '')
      .substring(0, 20);
  }

  function normalizeDate(dateString) {
    if (dateString.length === 8) {
      return dateFns.parse(dateString, 'YYYYMMDD');
    }
    return dateFns.parse(dateString, 'YYYY-MM-DD');
  }

  function normalizeTime(timeString) {
    if (timeString.length === 8) {
      return timeString.slice(0, 5);
    }
    return timeString;
  }

  function getDateString(item) {
    var start = [];
    var end = [];
    if (item.startdate) {
      start.push(dateFns.format(item.startdate, 'YYYY-MM-DD'));
    }
    if (item.starttime) {
      start.push(item.starttime);
    }
    if (item.enddate && item.enddate.getTime() !== item.startdate.getTime()) {
      end.push(dateFns.format(item.enddate, 'YYYY-MM-DD'));
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
    var half = Math.ceil(items.length / 2);
    var firstHalf = items.splice(0, half);
    var secondHalf = items.splice(-half);

    for (var column of [firstHalf, secondHalf]) {
      var columnDiv = document.createElement('div');
      columnDiv.setAttribute('class', 'tmc-calendar-column');
      for (var item of column) {
        var div = document.createElement('div');
        div.setAttribute('class', 'tmc-calendar-item');
        div.innerHTML =
          '<a href="' +
          (item.canonicalurl || item.link) +
          '" target="_blank">' +
          '<div class="tmc-calendar-item__date">' +
          getDateString(item) +
          '</div>' +
          '<div class="tmc-calendar-item__label">' +
          item.title +
          '</div>';
        ('</a>');
        columnDiv.appendChild(div);
      }

      node.appendChild(columnDiv);
    }
  }
  var nodes = document.body.querySelectorAll('[data-trotzig-multi-calendar]');
  if (!nodes.length) {
    return;
  }

  nodes.forEach(function (el) {
    var urls = el.getAttribute('data-trotzig-multi-calendar').split(',');
    var limit = parseInt(
      el.getAttribute('data-trotzig-multi-calendar-limit') || '100',
      10,
    );
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
      // Normalize dates
      allItems.forEach(function (item) {
        item.startdate = normalizeDate(item.startdate);
        item.enddate = item.enddate && normalizeDate(item.enddate);
      });

      // Normalize times
      allItems.forEach(function (item) {
        item.starttime = item.starttime && normalizeTime(item.starttime);
        item.endtime = item.endtime && normalizeTime(item.endtime);
      });

      // Filter out ones that are in the past
      allItems = allItems.filter(function (item) {
        return (
          item.startdate > new Date(new Date().getTime() - 24 * 60 * 60 * 1000)
        );
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

      // filter out duplicates
      var seenKeys = [];
      allItems = allItems.filter(function (item) {
        var key = itemKey(item);
        if (seenKeys.indexOf(key) !== -1) {
          return false;
        }
        seenKeys.push(key);
        return true;
      });

      // Reduce the size if necessary
      allItems = allItems.slice(0, limit);

      render({ items: allItems, node: el, limit: limit });
    });
  });
});
