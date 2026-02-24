/**
 * tableRenderer.js — Renders sortable, paginated, filterable data tables.
 */
var TableRenderer = (function () {
  'use strict';

  var currentOpts = null;
  var currentPage = 0;
  var sortCol = -1;
  var sortDir = 'asc'; // 'asc' | 'desc'
  var filteredRows = [];
  var filterQuery = '';

  /**
   * Render a data table.
   * @param {object} opts
   *   opts.containerId   — DOM id for table container
   *   opts.paginationId  — DOM id for pagination wrapper
   *   opts.pageInfoId    — DOM id for page info text
   *   opts.prevBtnId     — DOM id for prev button
   *   opts.nextBtnId     — DOM id for next button
   *   opts.fields        — array of field definitions
   *   opts.rows          — array of data objects
   *   opts.pageSize      — rows per page (default 50)
   */
  function render(opts) {
    currentOpts = opts;
    currentPage = 0;
    sortCol = -1;
    sortDir = 'asc';
    filterQuery = '';
    filteredRows = opts.rows.slice();
    drawTable();
  }

  function drawTable() {
    var opts = currentOpts;
    if (!opts) return;

    var container = document.getElementById(opts.containerId);
    var fields = opts.fields;
    var pageSize = opts.pageSize || 50;

    if (filteredRows.length === 0) {
      container.innerHTML = '<div class="fdr-no-data">No data found.</div>';
      updatePagination(0, 0, 0);
      return;
    }

    var totalPages = Math.ceil(filteredRows.length / pageSize);
    if (currentPage >= totalPages) currentPage = totalPages - 1;
    if (currentPage < 0) currentPage = 0;

    var start = currentPage * pageSize;
    var end = Math.min(start + pageSize, filteredRows.length);
    var pageRows = filteredRows.slice(start, end);

    // Build table HTML
    var html = '<div class="fdr-table-wrap"><table class="fdr-table"><thead><tr>';

    fields.forEach(function (f, idx) {
      var arrowClass = '';
      if (idx === sortCol) {
        arrowClass = sortDir;
      }
      html += '<th data-col="' + idx + '">' +
        escapeHtml(f.label) +
        '<span class="sort-arrow ' + arrowClass + '"></span></th>';
    });

    html += '</tr></thead><tbody>';

    pageRows.forEach(function (row) {
      html += '<tr>';
      fields.forEach(function (f) {
        var val = DataTypes.resolvePath(row, f.key);
        var display = formatValue(val, f);
        html += '<td title="' + escapeHtml(display) + '">' + escapeHtml(display) + '</td>';
      });
      html += '</tr>';
    });

    html += '</tbody></table></div>';
    container.innerHTML = html;

    // Bind header sort clicks
    var headers = container.querySelectorAll('th[data-col]');
    headers.forEach(function (th) {
      th.addEventListener('click', function () {
        var col = parseInt(th.dataset.col, 10);
        onSort(col);
      });
    });

    updatePagination(start + 1, end, filteredRows.length);
  }

  function onSort(colIndex) {
    if (sortCol === colIndex) {
      sortDir = (sortDir === 'asc') ? 'desc' : 'asc';
    } else {
      sortCol = colIndex;
      sortDir = 'asc';
    }

    var field = currentOpts.fields[colIndex];
    filteredRows.sort(function (a, b) {
      var va = DataTypes.resolvePath(a, field.key);
      var vb = DataTypes.resolvePath(b, field.key);
      return compareValues(va, vb, field.type, sortDir);
    });

    currentPage = 0;
    drawTable();
  }

  function compareValues(a, b, type, dir) {
    // Handle nulls
    if (a == null && b == null) return 0;
    if (a == null) return 1;
    if (b == null) return -1;

    var result = 0;
    if (type === 'number' || type === 'duration') {
      result = (Number(a) || 0) - (Number(b) || 0);
    } else if (type === 'date') {
      result = new Date(a) - new Date(b);
    } else {
      result = String(a).localeCompare(String(b));
    }

    return dir === 'desc' ? -result : result;
  }

  function formatValue(val, field) {
    if (val == null || val === '') return '';

    // Resolve IDs through cache
    if (field.resolve) {
      return CacheManager.resolve(field.resolve, val);
    }

    switch (field.type) {
      case 'date':
        try {
          var d = new Date(val);
          if (isNaN(d.getTime())) return String(val);
          return d.toLocaleString();
        } catch (e) {
          return String(val);
        }
      case 'number':
        if (typeof val === 'number') {
          return val % 1 === 0 ? String(val) : val.toFixed(2);
        }
        return String(val);
      case 'duration':
        return formatDuration(val);
      case 'boolean':
        return val ? 'Yes' : 'No';
      default:
        // Handle arrays (e.g. zoneTypes)
        if (Array.isArray(val)) {
          return val.map(function (v) {
            return typeof v === 'object' ? (v.name || v.id || JSON.stringify(v)) : String(v);
          }).join(', ');
        }
        if (typeof val === 'object') {
          return val.name || val.id || JSON.stringify(val);
        }
        return String(val);
    }
  }

  function formatDuration(val) {
    if (typeof val === 'string') {
      // ISO 8601 duration or .NET TimeSpan format
      var match = val.match(/PT?(\d+H)?(\d+M)?(\d+\.?\d*S)?/i);
      if (match) {
        var h = parseInt(match[1]) || 0;
        var m = parseInt(match[2]) || 0;
        var s = parseFloat(match[3]) || 0;
        return h + 'h ' + m + 'm ' + Math.round(s) + 's';
      }
      // Try .NET TimeSpan: d.hh:mm:ss
      var tsMatch = val.match(/(?:(\d+)\.)?(\d+):(\d+):(\d+)/);
      if (tsMatch) {
        var days = parseInt(tsMatch[1]) || 0;
        return (days > 0 ? days + 'd ' : '') +
          tsMatch[2] + 'h ' + tsMatch[3] + 'm ' + tsMatch[4] + 's';
      }
      return val;
    }
    if (typeof val === 'number') {
      // Assume seconds
      var hrs = Math.floor(val / 3600);
      var mins = Math.floor((val % 3600) / 60);
      var secs = Math.round(val % 60);
      return hrs + 'h ' + mins + 'm ' + secs + 's';
    }
    return String(val);
  }

  /** Filter rows by search query */
  function filter(query) {
    filterQuery = (query || '').toLowerCase().trim();
    if (!currentOpts) return;

    if (!filterQuery) {
      filteredRows = currentOpts.rows.slice();
    } else {
      filteredRows = currentOpts.rows.filter(function (row) {
        return currentOpts.fields.some(function (f) {
          var val = DataTypes.resolvePath(row, f.key);
          var display = formatValue(val, f);
          return display.toLowerCase().indexOf(filterQuery) >= 0;
        });
      });
    }

    // Re-apply sort if active
    if (sortCol >= 0 && currentOpts.fields[sortCol]) {
      var field = currentOpts.fields[sortCol];
      filteredRows.sort(function (a, b) {
        var va = DataTypes.resolvePath(a, field.key);
        var vb = DataTypes.resolvePath(b, field.key);
        return compareValues(va, vb, field.type, sortDir);
      });
    }

    currentPage = 0;
    drawTable();
  }

  function nextPage() {
    if (!currentOpts) return;
    var pageSize = currentOpts.pageSize || 50;
    var totalPages = Math.ceil(filteredRows.length / pageSize);
    if (currentPage < totalPages - 1) {
      currentPage++;
      drawTable();
    }
  }

  function prevPage() {
    if (currentPage > 0) {
      currentPage--;
      drawTable();
    }
  }

  function updatePagination(start, end, total) {
    if (!currentOpts) return;
    var info = document.getElementById(currentOpts.pageInfoId);
    var prev = document.getElementById(currentOpts.prevBtnId);
    var next = document.getElementById(currentOpts.nextBtnId);

    if (total === 0) {
      info.textContent = 'No results';
      prev.disabled = true;
      next.disabled = true;
      return;
    }

    info.textContent = 'Showing ' + start + ' - ' + end + ' of ' + total;
    prev.disabled = currentPage === 0;

    var pageSize = currentOpts.pageSize || 50;
    var totalPages = Math.ceil(total / pageSize);
    next.disabled = currentPage >= totalPages - 1;
  }

  /** Get the currently filtered rows (for CSV export) */
  function getFilteredRows() {
    return filteredRows;
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  return {
    render: render,
    filter: filter,
    nextPage: nextPage,
    prevPage: prevPage,
    getFilteredRows: getFilteredRows,
    formatValue: formatValue
  };
})();
