$(function() {

  var type = /(canvas|webgl)/.test(url.type) ? url.type : 'svg';
  var two = new Two({
    type: Two.Types[type],
    fullscreen: true
  }).appendTo(document.body);

  $.get('img/pebblecode-logo-pink.svg', function(doc) {

    var logo = two.interpret($(doc).find('svg')[0]);
    logo.subdivide();
    var t = 0;
    var startOver = false;
    var clearT = function() {
      t = 0;
      setEnding(logo, 0);
      startOver = _.after(60, clearT);
    };

    logo.center().translation.set(two.width / 2, two.height / 2);
    logo.distances = calculateDistances(logo);
    logo.total = 0;  logo.stroke = 'white';
    logo.linewidth = 1;
    _.each(logo.distances, function(d) {
      logo.total += d;
    });

    clearT();

    resize();
    two
      .bind('resize', resize)
      .bind('update', function() {

        if (t < 0.9999) {
          t += 0.00625;
        } else {
          startOver();
        }

        setEnding(logo, t);

      }).play();

    function resize() {
      logo.translation.set(two.width / 2, two.height / 2);
    }

    function setEnding(group, t) {

      var i = 0;
      var traversed = t * group.total;
      var current = 0;

      _.each(group.children, function(child) {
        var distance = group.distances[i];
        var min = current;
        var max = current + distance;
        var pct = cmap(traversed, min, max, 0, 1);
        child.ending = pct;
        current = max;
        i++;
      });

    }

  });

});

function calculateDistances(group) {
  return _.map(group.children, function(child) {
    var d = 0, a;
    _.each(child.vertices, function(b, i) {
      if (i > 0) {
        d += a.distanceTo(b);
      }
      a = b;
    });
    return d;
  });
}

function clamp(v, min, max) {
  return Math.max(Math.min(v, max), min);
}

function map(v, i1, i2, o1, o2) {
  return o1 + (o2 - o1) * ((v - i1) / (i2 - i1));
}

function cmap(v, i1, i2, o1, o2) {
  return clamp(map(v, i1, i2, o1, o2), o1, o2);
}
