/**
 * csvExporter.js — Exports table data as CSV with UTF-8 BOM for Excel compatibility.
 */
var CsvExporter = (function () {
  'use strict';

  /**
   * Export data as a CSV file download.
   * @param {Array} fields — field definitions (same as table columns)
   * @param {Array} rows — data rows
   * @param {string} filenameBase — base name for the file
   */
  function exportCsv(fields, rows, filenameBase) {
    if (!fields || fields.length === 0 || !rows) return;

    // Use filtered rows from the table if available
    var exportRows = TableRenderer.getFilteredRows();
    if (!exportRows || exportRows.length === 0) {
      exportRows = rows;
    }

    var lines = [];

    // Header row
    var header = fields.map(function (f) {
      return csvEscape(f.label);
    });
    lines.push(header.join(','));

    // Data rows
    exportRows.forEach(function (row) {
      var cells = fields.map(function (f) {
        var val = DataTypes.resolvePath(row, f.key);
        var display = TableRenderer.formatValue(val, f);
        return csvEscape(display);
      });
      lines.push(cells.join(','));
    });

    var csvContent = lines.join('\r\n');

    // UTF-8 BOM for Excel
    var bom = '\uFEFF';
    var blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });

    // Generate filename with timestamp
    var now = new Date();
    var ts = now.getFullYear() +
      String(now.getMonth() + 1).padStart(2, '0') +
      String(now.getDate()).padStart(2, '0') + '_' +
      String(now.getHours()).padStart(2, '0') +
      String(now.getMinutes()).padStart(2, '0');

    var filename = (filenameBase || 'export').replace(/[^a-zA-Z0-9_-]/g, '_') + '_' + ts + '.csv';

    // Trigger download
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();

    // Cleanup
    setTimeout(function () {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }

  function csvEscape(val) {
    if (val == null) return '';
    var str = String(val);
    // Wrap in quotes if it contains comma, quote, or newline
    if (str.indexOf(',') >= 0 || str.indexOf('"') >= 0 || str.indexOf('\n') >= 0 || str.indexOf('\r') >= 0) {
      return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
  }

  return {
    exportCsv: exportCsv
  };
})();
