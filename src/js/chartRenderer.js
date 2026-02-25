/**
 * chartRenderer.js — Canvas-based bar, line, and pie charts. No external libraries.
 */
var ChartRenderer = (function () {
  'use strict';

  // Zenith categorical data palette
  var COLORS = [
    '#428AFF', '#06C989', '#F98C41', '#8256E5', '#3CCDE5',
    '#E56A6A', '#F5BD60', '#8A94A2', '#0078D3', '#2B6436',
    '#25477B', '#A01F0E', '#59480D', '#4E677E', '#005AA8',
    '#3E5265', '#748FAA', '#C0CCD8', '#D9E1E8', '#1F2833'
  ];

  /**
   * Render a chart on a canvas element.
   * @param {object} opts
   *   opts.canvasId       — DOM id of the canvas
   *   opts.chartType      — "bar" | "line" | "pie"
   *   opts.rows           — data rows
   *   opts.valueFieldKey  — dot-path to numeric value
   *   opts.groupFieldKey  — dot-path to group-by value
   *   opts.groupFieldDef  — field definition for group field (for resolving)
   *   opts.maxGroups      — max number of groups to show (default 20)
   */
  function render(opts) {
    var canvas = document.getElementById(opts.canvasId);
    if (!canvas) return;

    var ctx = canvas.getContext('2d');
    var container = canvas.parentElement;

    // Set canvas size to match container
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    // Aggregate data: group -> sum of values
    var groups = {};
    var maxGroups = opts.maxGroups || 20;

    opts.rows.forEach(function (row) {
      var rawGroup = DataTypes.resolvePath(row, opts.groupFieldKey);
      var groupLabel;

      if (opts.groupFieldDef && opts.groupFieldDef.resolve) {
        groupLabel = CacheManager.resolve(opts.groupFieldDef.resolve, rawGroup);
      } else if (opts.groupFieldDef && opts.groupFieldDef.type === 'date') {
        try {
          var d = new Date(rawGroup);
          groupLabel = d.toLocaleDateString();
        } catch (e) {
          groupLabel = String(rawGroup || '(empty)');
        }
      } else {
        groupLabel = String(rawGroup || '(empty)');
      }

      var val = DataTypes.resolvePath(row, opts.valueFieldKey);
      var num = parseFloat(val) || 0;

      if (!groups[groupLabel]) {
        groups[groupLabel] = { sum: 0, count: 0 };
      }
      groups[groupLabel].sum += num;
      groups[groupLabel].count += 1;
    });

    // Sort by sum descending, limit groups
    var sorted = Object.keys(groups).map(function (label) {
      return { label: label, sum: groups[label].sum, count: groups[label].count };
    });
    sorted.sort(function (a, b) { return b.sum - a.sum; });

    if (sorted.length > maxGroups) {
      var others = sorted.slice(maxGroups).reduce(function (acc, g) {
        return { label: 'Others', sum: acc.sum + g.sum, count: acc.count + g.count };
      }, { label: 'Others', sum: 0, count: 0 });
      sorted = sorted.slice(0, maxGroups);
      sorted.push(others);
    }

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (sorted.length === 0) {
      ctx.fillStyle = '#868e96';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('No data to chart.', canvas.width / 2, canvas.height / 2);
      return;
    }

    switch (opts.chartType) {
      case 'bar':
        drawBarChart(ctx, canvas, sorted);
        break;
      case 'line':
        drawLineChart(ctx, canvas, sorted);
        break;
      case 'pie':
        drawPieChart(ctx, canvas, sorted);
        break;
    }
  }

  // ---- Bar Chart ----
  function drawBarChart(ctx, canvas, data) {
    var w = canvas.width;
    var h = canvas.height;
    var padding = { top: 30, right: 20, bottom: 80, left: 70 };
    var chartW = w - padding.left - padding.right;
    var chartH = h - padding.top - padding.bottom;

    var maxVal = Math.max.apply(null, data.map(function (d) { return d.sum; }));
    if (maxVal === 0) maxVal = 1;

    var barWidth = Math.max(10, (chartW / data.length) - 4);
    var gap = (chartW - barWidth * data.length) / (data.length + 1);

    // Y axis
    ctx.strokeStyle = '#dee2e6';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#495057';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'right';

    var yTicks = 5;
    for (var i = 0; i <= yTicks; i++) {
      var yVal = (maxVal / yTicks) * i;
      var yPos = padding.top + chartH - (chartH * (yVal / maxVal));
      ctx.beginPath();
      ctx.moveTo(padding.left, yPos);
      ctx.lineTo(w - padding.right, yPos);
      ctx.stroke();
      ctx.fillText(formatNumber(yVal), padding.left - 8, yPos + 4);
    }

    // Bars
    data.forEach(function (d, idx) {
      var x = padding.left + gap + idx * (barWidth + gap);
      var barH = (d.sum / maxVal) * chartH;
      var y = padding.top + chartH - barH;

      ctx.fillStyle = COLORS[idx % COLORS.length];
      ctx.fillRect(x, y, barWidth, barH);

      // Value label on top
      ctx.fillStyle = '#343a40';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(formatNumber(d.sum), x + barWidth / 2, y - 4);

      // X label
      ctx.save();
      ctx.translate(x + barWidth / 2, padding.top + chartH + 10);
      ctx.rotate(Math.PI / 4);
      ctx.fillStyle = '#495057';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'left';
      var label = truncateLabel(d.label, 18);
      ctx.fillText(label, 0, 0);
      ctx.restore();
    });
  }

  // ---- Line Chart ----
  function drawLineChart(ctx, canvas, data) {
    var w = canvas.width;
    var h = canvas.height;
    var padding = { top: 30, right: 20, bottom: 80, left: 70 };
    var chartW = w - padding.left - padding.right;
    var chartH = h - padding.top - padding.bottom;

    var maxVal = Math.max.apply(null, data.map(function (d) { return d.sum; }));
    if (maxVal === 0) maxVal = 1;

    // Grid
    ctx.strokeStyle = '#dee2e6';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#495057';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'right';

    var yTicks = 5;
    for (var i = 0; i <= yTicks; i++) {
      var yVal = (maxVal / yTicks) * i;
      var yPos = padding.top + chartH - (chartH * (yVal / maxVal));
      ctx.beginPath();
      ctx.moveTo(padding.left, yPos);
      ctx.lineTo(w - padding.right, yPos);
      ctx.stroke();
      ctx.fillText(formatNumber(yVal), padding.left - 8, yPos + 4);
    }

    // Line
    var step = data.length > 1 ? chartW / (data.length - 1) : chartW / 2;

    ctx.beginPath();
    ctx.strokeStyle = COLORS[0];
    ctx.lineWidth = 2;

    data.forEach(function (d, idx) {
      var x = padding.left + idx * step;
      var y = padding.top + chartH - (d.sum / maxVal) * chartH;
      if (idx === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    // Points + labels
    data.forEach(function (d, idx) {
      var x = padding.left + idx * step;
      var y = padding.top + chartH - (d.sum / maxVal) * chartH;

      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = COLORS[0];
      ctx.fill();

      // X label
      ctx.save();
      ctx.translate(x, padding.top + chartH + 10);
      ctx.rotate(Math.PI / 4);
      ctx.fillStyle = '#495057';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(truncateLabel(d.label, 18), 0, 0);
      ctx.restore();
    });
  }

  // ---- Pie Chart ----
  function drawPieChart(ctx, canvas, data) {
    var w = canvas.width;
    var h = canvas.height;
    var cx = w * 0.4;
    var cy = h / 2;
    var radius = Math.min(cx - 40, cy - 40);
    if (radius < 30) radius = 30;

    var total = data.reduce(function (acc, d) { return acc + d.sum; }, 0);
    if (total === 0) {
      ctx.fillStyle = '#868e96';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('No data to chart.', w / 2, h / 2);
      return;
    }

    var startAngle = -Math.PI / 2;

    data.forEach(function (d, idx) {
      var slice = (d.sum / total) * Math.PI * 2;

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, startAngle, startAngle + slice);
      ctx.closePath();
      ctx.fillStyle = COLORS[idx % COLORS.length];
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();

      startAngle += slice;
    });

    // Legend
    var legendX = w * 0.65;
    var legendY = 30;
    var legendRowH = 20;

    ctx.font = '11px sans-serif';
    ctx.textAlign = 'left';

    data.forEach(function (d, idx) {
      var y = legendY + idx * legendRowH;
      if (y + legendRowH > h) return; // overflow protection

      ctx.fillStyle = COLORS[idx % COLORS.length];
      ctx.fillRect(legendX, y, 12, 12);

      ctx.fillStyle = '#343a40';
      var pct = total > 0 ? ((d.sum / total) * 100).toFixed(1) : '0';
      var text = truncateLabel(d.label, 16) + ' (' + pct + '%)';
      ctx.fillText(text, legendX + 18, y + 10);
    });
  }

  // ---- Helpers ----
  function formatNumber(n) {
    if (Math.abs(n) >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (Math.abs(n) >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n % 1 === 0 ? String(n) : n.toFixed(1);
  }

  function truncateLabel(str, max) {
    if (!str) return '';
    if (str.length <= max) return str;
    return str.substring(0, max - 1) + '\u2026';
  }

  return {
    render: render
  };
})();
