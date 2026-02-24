/**
 * queryEngine.js — Builds and executes API queries via api.multiCall().
 * Handles batching, date range injection, device filtering, and results limiting.
 */
var QueryEngine = (function () {
  'use strict';

  /**
   * Run queries for all selected categories.
   * @param {object} api — MyGeotab api object
   * @param {object} opts
   *   opts.categories  — array of category keys (e.g. ["Trip", "Device"])
   *   opts.fromDate    — ISO date string
   *   opts.toDate      — ISO date string
   *   opts.deviceId    — optional specific device ID
   *   opts.resultsLimit — max results per category
   *   opts.diagnosticId — optional diagnostic ID for StatusData
   * @param {function} onProgress — called with (message) during execution
   * @returns {Promise<object>} — { categoryKey: [rows], ... }
   */
  function runQueries(api, opts, onProgress) {
    var calls = [];
    var callMap = []; // maps each call index to its category key

    opts.categories.forEach(function (catKey) {
      var catDef = DataTypes.getCategory(catKey);
      if (!catDef) return;

      var search = {};
      var limit = opts.resultsLimit || 500;

      // Date range
      if (catDef.needsDateRange) {
        search.fromDate = opts.fromDate;
        search.toDate = opts.toDate;
      }

      // Device filter
      if (opts.deviceId) {
        search.deviceSearch = { id: opts.deviceId };
      }

      // Driver-only filter for User type
      if (catDef.isDriverOnly) {
        search.isDriver = true;
      }

      // Diagnostic filter for StatusData
      if (catDef.needsDiagnostic && opts.diagnosticId) {
        search.diagnosticSearch = { id: opts.diagnosticId };
      }

      calls.push(['Get', {
        typeName: catDef.typeName,
        search: search,
        resultsLimit: limit
      }]);
      callMap.push(catKey);
    });

    if (calls.length === 0) {
      return Promise.resolve({});
    }

    if (onProgress) {
      onProgress('Querying ' + calls.length + ' data type(s)...');
    }

    return new Promise(function (resolve, reject) {
      api.multiCall(calls, function (results) {
        var data = {};
        for (var i = 0; i < callMap.length; i++) {
          data[callMap[i]] = results[i] || [];
        }
        if (onProgress) {
          var total = 0;
          Object.keys(data).forEach(function (k) { total += data[k].length; });
          onProgress('Retrieved ' + total + ' total records.');
        }
        resolve(data);
      }, function (err) {
        reject(err);
      });
    });
  }

  return {
    runQueries: runQueries
  };
})();
