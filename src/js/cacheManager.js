/**
 * cacheManager.js — Caches semi-static lookup data (devices, zones, rules, users, diagnostics)
 * so we can resolve IDs to human-readable names without repeated API calls.
 */
var CacheManager = (function () {
  'use strict';

  var cache = {
    device: {},   // id -> name
    zone: {},     // id -> name
    rule: {},     // id -> name
    user: {},     // id -> display name
    diagnostic: {} // id -> name
  };

  var loaded = false;

  /**
   * Initialize all caches using api.multiCall.
   * @param {object} api — MyGeotab api object
   * @returns {Promise}
   */
  function init(api) {
    if (loaded) return Promise.resolve();

    var calls = [
      ['Get', { typeName: 'Device', resultsLimit: 10000, search: {} }],
      ['Get', { typeName: 'Zone', resultsLimit: 5000, search: {} }],
      ['Get', { typeName: 'Rule', resultsLimit: 5000, search: {} }],
      ['Get', { typeName: 'User', resultsLimit: 5000, search: {} }]
    ];

    return new Promise(function (resolve, reject) {
      api.multiCall(calls, function (results) {
        try {
          // Devices
          var devices = results[0] || [];
          devices.forEach(function (d) {
            cache.device[d.id] = d.name || d.serialNumber || d.id;
          });

          // Zones
          var zones = results[1] || [];
          zones.forEach(function (z) {
            cache.zone[z.id] = z.name || z.id;
          });

          // Rules
          var rules = results[2] || [];
          rules.forEach(function (r) {
            cache.rule[r.id] = r.name || r.id;
          });

          // Users
          var users = results[3] || [];
          users.forEach(function (u) {
            var display = '';
            if (u.firstName || u.lastName) {
              display = ((u.firstName || '') + ' ' + (u.lastName || '')).trim();
            }
            cache.user[u.id] = display || u.name || u.id;
          });

          loaded = true;
          resolve();
        } catch (e) {
          reject(e);
        }
      }, function (err) {
        reject(err);
      });
    });
  }

  /**
   * Resolve an ID to a display name.
   * @param {string} type — "device", "zone", "rule", "user", "diagnostic"
   * @param {string} id
   * @returns {string}
   */
  function resolve(type, id) {
    if (!id) return '';
    if (cache[type] && cache[type][id]) {
      return cache[type][id];
    }
    // For well-known Geotab IDs, clean them up
    if (typeof id === 'string' && id.startsWith('Diagnostic')) {
      return id.replace(/Id$/, '').replace(/([A-Z])/g, ' $1').trim();
    }
    return String(id);
  }

  /** Return the devices cache for populating the device filter dropdown */
  function getDevices() {
    return cache.device;
  }

  /** Return all cached users */
  function getUsers() {
    return cache.user;
  }

  /** Check if caches are loaded */
  function isLoaded() {
    return loaded;
  }

  /** Store a diagnostic name into the cache */
  function cacheDiagnostic(id, name) {
    cache.diagnostic[id] = name;
  }

  return {
    init: init,
    resolve: resolve,
    getDevices: getDevices,
    getUsers: getUsers,
    isLoaded: isLoaded,
    cacheDiagnostic: cacheDiagnostic
  };
})();
