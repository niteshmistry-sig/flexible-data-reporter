/**
 * main.js — Add-in entry point and lifecycle.
 * MyGeotab calls the global `geotab.addin.flexibleDataReporter` hooks.
 */
(function () {
  'use strict';

  // State
  var state = {
    api: null,
    page: null,
    selectedCategories: [],
    selectedFields: {},    // { categoryKey: [field objects] }
    results: {},           // { categoryKey: [rows] }
    activeTab: null,
    chartVisible: false
  };

  // ---- Lifecycle hooks expected by MyGeotab ----

  if (!window.geotab) window.geotab = {};
  if (!window.geotab.addin) window.geotab.addin = {};

  window.geotab.addin.flexibleDataReporter = {
    initialize: function (api, page, callback) {
      state.api = api;
      state.page = page;

      initUI();

      // Load caches then populate device dropdown
      setStatus('Loading fleet data...');
      CacheManager.init(api)
        .then(function () {
          populateDeviceDropdown();
          setStatus('');
          callback();
        })
        .catch(function (err) {
          setStatus('Cache load error: ' + (err.message || err), true);
          callback();
        });
    },

    focus: function (api, page) {
      state.api = api;
      state.page = page;
    },

    blur: function () {
      // Nothing to clean up
    }
  };

  // ---- UI Initialization ----

  function initUI() {
    buildCategoryCheckboxes();
    setDefaultDates();
    bindEvents();
  }

  function buildCategoryCheckboxes() {
    var container = document.getElementById('fdrCategoryChecks');
    container.innerHTML = '';

    DataTypes.getCategoryKeys().forEach(function (key) {
      var cat = DataTypes.getCategory(key);
      var label = document.createElement('label');

      var cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.value = key;
      cb.addEventListener('change', onCategoryToggle);

      label.appendChild(cb);
      label.appendChild(document.createTextNode(cat.label));
      container.appendChild(label);
    });
  }

  function setDefaultDates() {
    var now = new Date();
    var weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);

    document.getElementById('fdrDateTo').value = formatDateInput(now);
    document.getElementById('fdrDateFrom').value = formatDateInput(weekAgo);
  }

  function formatDateInput(d) {
    var y = d.getFullYear();
    var m = String(d.getMonth() + 1).padStart(2, '0');
    var day = String(d.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + day;
  }

  function populateDeviceDropdown() {
    var select = document.getElementById('fdrDeviceSelect');
    var devices = CacheManager.getDevices();
    var ids = Object.keys(devices);
    ids.sort(function (a, b) {
      return (devices[a] || '').localeCompare(devices[b] || '');
    });

    ids.forEach(function (id) {
      var opt = document.createElement('option');
      opt.value = id;
      opt.textContent = devices[id];
      select.appendChild(opt);
    });
  }

  // ---- Event Binding ----

  function bindEvents() {
    document.getElementById('fdrRunBtn').addEventListener('click', runReport);
    document.getElementById('fdrExportCsvBtn').addEventListener('click', exportCurrentTab);
    document.getElementById('fdrToggleChartBtn').addEventListener('click', toggleChart);
    document.getElementById('fdrHideChartBtn').addEventListener('click', hideChart);
    document.getElementById('fdrRenderChartBtn').addEventListener('click', renderChart);
    document.getElementById('fdrSearch').addEventListener('input', onSearchInput);
    document.getElementById('fdrPrevBtn').addEventListener('click', function () { TableRenderer.prevPage(); });
    document.getElementById('fdrNextBtn').addEventListener('click', function () { TableRenderer.nextPage(); });
  }

  // ---- Category Toggle & Column Pickers ----

  function onCategoryToggle() {
    var max = DataTypes.MAX_SELECTIONS;
    state.selectedCategories = [];
    var checks = document.querySelectorAll('#fdrCategoryChecks input[type=checkbox]');
    checks.forEach(function (cb) {
      if (cb.checked) state.selectedCategories.push(cb.value);
    });

    // Enforce max selection limit — disable unchecked boxes when at limit
    var atLimit = state.selectedCategories.length >= max;
    checks.forEach(function (cb) {
      if (!cb.checked) {
        cb.disabled = atLimit;
        cb.parentElement.style.opacity = atLimit ? '0.45' : '';
        cb.parentElement.style.cursor = atLimit ? 'not-allowed' : '';
      }
    });

    // Update counter
    var counter = document.getElementById('fdrCategoryCounter');
    if (counter) {
      counter.textContent = state.selectedCategories.length + ' / ' + max + ' selected';
      counter.style.color = atLimit ? 'var(--action-primary--default, #0078D3)' : '';
      counter.style.fontWeight = atLimit ? '500' : '';
    }

    buildColumnPickers();
    updateDiagnosticPicker();
  }

  function buildColumnPickers() {
    var container = document.getElementById('fdrColumnPickers');
    container.innerHTML = '';
    state.selectedFields = {};

    state.selectedCategories.forEach(function (catKey) {
      var cat = DataTypes.getCategory(catKey);
      if (!cat) return;

      state.selectedFields[catKey] = cat.fields.filter(function (f) { return f.defaultOn; });

      var group = document.createElement('div');
      group.className = 'fdr-column-group';

      var title = document.createElement('div');
      title.className = 'fdr-column-group-title';
      title.textContent = cat.label + ' — Columns';
      group.appendChild(title);

      var cols = document.createElement('div');
      cols.className = 'fdr-columns';

      cat.fields.forEach(function (field) {
        var lbl = document.createElement('label');
        var cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.checked = field.defaultOn;
        cb.dataset.category = catKey;
        cb.dataset.fieldKey = field.key;
        cb.addEventListener('change', function () {
          updateSelectedFields(catKey, cat.fields);
        });

        lbl.appendChild(cb);
        lbl.appendChild(document.createTextNode(field.label));
        cols.appendChild(lbl);
      });

      group.appendChild(cols);
      container.appendChild(group);
    });
  }

  function updateSelectedFields(catKey, allFields) {
    var checked = [];
    var boxes = document.querySelectorAll(
      '#fdrColumnPickers input[data-category="' + catKey + '"]'
    );
    boxes.forEach(function (cb) {
      if (cb.checked) {
        var match = allFields.find(function (f) { return f.key === cb.dataset.fieldKey; });
        if (match) checked.push(match);
      }
    });
    state.selectedFields[catKey] = checked;
  }

  function updateDiagnosticPicker() {
    var picker = document.getElementById('fdrDiagnosticPicker');
    if (state.selectedCategories.indexOf('StatusData') >= 0) {
      picker.classList.add('visible');
    } else {
      picker.classList.remove('visible');
    }
  }

  // ---- Run Report ----

  function runReport() {
    if (state.selectedCategories.length === 0) {
      setStatus('Select at least one data category.', true);
      return;
    }

    // Validate StatusData needs a diagnostic
    if (state.selectedCategories.indexOf('StatusData') >= 0) {
      var diagId = document.getElementById('fdrDiagnosticSelect').value;
      if (!diagId) {
        setStatus('Please select a diagnostic for Engine/Status Data.', true);
        return;
      }
    }

    var fromDate = document.getElementById('fdrDateFrom').value;
    var toDate = document.getElementById('fdrDateTo').value;
    var deviceId = document.getElementById('fdrDeviceSelect').value || null;
    var limit = parseInt(document.getElementById('fdrResultsLimit').value, 10) || 500;
    if (limit > 50000) limit = 50000;

    var runBtn = document.getElementById('fdrRunBtn');
    runBtn.disabled = true;
    setStatus('<span class="fdr-spinner"></span>Running report...', false, true);

    QueryEngine.runQueries(state.api, {
      categories: state.selectedCategories,
      fromDate: fromDate,
      toDate: toDate,
      deviceId: deviceId,
      resultsLimit: limit,
      diagnosticId: document.getElementById('fdrDiagnosticSelect').value || null
    }, function (msg) {
      setStatus('<span class="fdr-spinner"></span>' + msg, false, true);
    })
    .then(function (results) {
      state.results = results;
      runBtn.disabled = false;

      var total = 0;
      Object.keys(results).forEach(function (k) { total += results[k].length; });

      if (total === 0) {
        setStatus('No data found for the selected criteria.', true);
        document.getElementById('fdrResultsPanel').classList.remove('visible');
        return;
      }

      setStatus('Done — ' + total + ' records loaded.');
      showResults();
    })
    .catch(function (err) {
      runBtn.disabled = false;
      setStatus('Error: ' + (err.message || err), true);
    });
  }

  // ---- Results Display ----

  function showResults() {
    var panel = document.getElementById('fdrResultsPanel');
    panel.classList.add('visible');

    buildTabs();

    // Activate first tab
    var firstCat = state.selectedCategories[0];
    activateTab(firstCat);
  }

  function buildTabs() {
    var container = document.getElementById('fdrTabs');
    container.innerHTML = '';

    state.selectedCategories.forEach(function (catKey) {
      var cat = DataTypes.getCategory(catKey);
      var count = (state.results[catKey] || []).length;

      var btn = document.createElement('button');
      btn.className = 'fdr-tab';
      btn.dataset.category = catKey;
      btn.innerHTML = cat.label + '<span class="fdr-tab-count">(' + count + ')</span>';
      btn.addEventListener('click', function () { activateTab(catKey); });
      container.appendChild(btn);
    });
  }

  function activateTab(catKey) {
    state.activeTab = catKey;

    // Highlight active tab
    var tabs = document.querySelectorAll('#fdrTabs .fdr-tab');
    tabs.forEach(function (t) {
      t.classList.toggle('active', t.dataset.category === catKey);
    });

    // Clear search
    document.getElementById('fdrSearch').value = '';

    // Render table
    var fields = state.selectedFields[catKey] || DataTypes.getDefaultFields(catKey);
    var rows = state.results[catKey] || [];

    TableRenderer.render({
      containerId: 'fdrTableContainer',
      paginationId: 'fdrPagination',
      pageInfoId: 'fdrPageInfo',
      prevBtnId: 'fdrPrevBtn',
      nextBtnId: 'fdrNextBtn',
      fields: fields,
      rows: rows,
      pageSize: 50
    });

    // Update chart field dropdowns
    updateChartFieldOptions(catKey, fields);
  }

  // ---- Search ----

  function onSearchInput() {
    var query = document.getElementById('fdrSearch').value;
    TableRenderer.filter(query);
  }

  // ---- CSV Export ----

  function exportCurrentTab() {
    if (!state.activeTab) return;
    var fields = state.selectedFields[state.activeTab] || DataTypes.getDefaultFields(state.activeTab);
    var rows = state.results[state.activeTab] || [];
    var cat = DataTypes.getCategory(state.activeTab);
    CsvExporter.exportCsv(fields, rows, (cat ? cat.label : 'export'));
  }

  // ---- Chart ----

  function toggleChart() {
    var panel = document.getElementById('fdrChartPanel');
    state.chartVisible = !state.chartVisible;
    panel.classList.toggle('visible', state.chartVisible);
    document.getElementById('fdrToggleChartBtn').textContent =
      state.chartVisible ? 'Hide Chart' : 'Show Chart';
  }

  function hideChart() {
    state.chartVisible = false;
    document.getElementById('fdrChartPanel').classList.remove('visible');
    document.getElementById('fdrToggleChartBtn').textContent = 'Show Chart';
  }

  function updateChartFieldOptions(catKey, fields) {
    var valueSelect = document.getElementById('fdrChartValueField');
    var groupSelect = document.getElementById('fdrChartGroupField');

    valueSelect.innerHTML = '';
    groupSelect.innerHTML = '';

    fields.forEach(function (f) {
      if (f.type === 'number') {
        var opt = document.createElement('option');
        opt.value = f.key;
        opt.textContent = f.label;
        valueSelect.appendChild(opt);
      }
    });

    fields.forEach(function (f) {
      if (f.type === 'string' || f.type === 'id' || f.type === 'date') {
        var opt = document.createElement('option');
        opt.value = f.key;
        opt.textContent = f.label;
        groupSelect.appendChild(opt);
      }
    });
  }

  function renderChart() {
    if (!state.activeTab) return;

    var chartType = document.getElementById('fdrChartType').value;
    var valueField = document.getElementById('fdrChartValueField').value;
    var groupField = document.getElementById('fdrChartGroupField').value;

    if (!valueField || !groupField) {
      setStatus('Select both a value field and group-by field for charting.', true);
      return;
    }

    var rows = state.results[state.activeTab] || [];
    var fields = state.selectedFields[state.activeTab] || [];
    var groupFieldDef = fields.find(function (f) { return f.key === groupField; });

    ChartRenderer.render({
      canvasId: 'fdrCanvas',
      chartType: chartType,
      rows: rows,
      valueFieldKey: valueField,
      groupFieldKey: groupField,
      groupFieldDef: groupFieldDef,
      maxGroups: 20
    });
  }

  // ---- Status Helpers ----

  function setStatus(msg, isError, isHtml) {
    var el = document.getElementById('fdrStatus');
    if (isHtml) {
      el.innerHTML = msg;
    } else {
      el.textContent = msg;
    }
    el.className = 'fdr-status' + (isError ? ' error' : '');
  }

})();
