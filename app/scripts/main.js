/**
 * Flexible Data Reporter — MyGeotab Add-In (Generation 1 pattern)
 *
 * Query fleet data across 20+ categories, view sortable/paginated results,
 * export CSV, and render bar/line/pie charts. All in a single factory function.
 */

(function () {
  'use strict';

  // ====================================================================
  //  DATA TYPES — category registry, field definitions
  // ====================================================================

  var categories = {
    Trip: {
      label: 'Trips',
      typeName: 'Trip',
      needsDateRange: true,
      fields: [
        { key: 'id', label: 'Trip ID', defaultOn: false, type: 'string' },
        { key: 'device.id', label: 'Device', defaultOn: true, type: 'id', resolve: 'device' },
        { key: 'driver.id', label: 'Driver', defaultOn: true, type: 'id', resolve: 'user' },
        { key: 'start', label: 'Start Time', defaultOn: true, type: 'date' },
        { key: 'stop', label: 'Stop Time', defaultOn: true, type: 'date' },
        { key: 'distance', label: 'Distance (km)', defaultOn: true, type: 'number' },
        { key: 'drivingDuration', label: 'Driving Duration', defaultOn: true, type: 'duration' },
        { key: 'stopDuration', label: 'Stop Duration', defaultOn: false, type: 'duration' },
        { key: 'idlingDuration', label: 'Idling Duration', defaultOn: false, type: 'duration' },
        { key: 'maximumSpeed', label: 'Max Speed (km/h)', defaultOn: true, type: 'number' },
        { key: 'averageSpeed', label: 'Avg Speed (km/h)', defaultOn: false, type: 'number' },
        { key: 'stopPoint.x', label: 'Stop Longitude', defaultOn: false, type: 'number' },
        { key: 'stopPoint.y', label: 'Stop Latitude', defaultOn: false, type: 'number' },
        { key: 'nextTripDrivingDuration', label: 'Next Trip Driving Duration', defaultOn: false, type: 'duration' }
      ]
    },
    Device: {
      label: 'Devices',
      typeName: 'Device',
      needsDateRange: false,
      fields: [
        { key: 'id', label: 'Device ID', defaultOn: false, type: 'string' },
        { key: 'name', label: 'Name', defaultOn: true, type: 'string' },
        { key: 'serialNumber', label: 'Serial Number', defaultOn: true, type: 'string' },
        { key: 'deviceType', label: 'Device Type', defaultOn: true, type: 'string' },
        { key: 'vehicleIdentificationNumber', label: 'VIN', defaultOn: true, type: 'string' },
        { key: 'licensePlate', label: 'License Plate', defaultOn: true, type: 'string' },
        { key: 'comment', label: 'Comment', defaultOn: false, type: 'string' },
        { key: 'engineVehicleIdentificationNumber', label: 'Engine VIN', defaultOn: false, type: 'string' },
        { key: 'activeFrom', label: 'Active From', defaultOn: true, type: 'date' },
        { key: 'activeTo', label: 'Active To', defaultOn: false, type: 'date' },
        { key: 'productId', label: 'Product ID', defaultOn: false, type: 'number' }
      ]
    },
    FaultData: {
      label: 'Faults',
      typeName: 'FaultData',
      needsDateRange: true,
      fields: [
        { key: 'id', label: 'Fault ID', defaultOn: false, type: 'string' },
        { key: 'device.id', label: 'Device', defaultOn: true, type: 'id', resolve: 'device' },
        { key: 'diagnostic.id', label: 'Diagnostic', defaultOn: true, type: 'id', resolve: 'diagnostic' },
        { key: 'dateTime', label: 'Date/Time', defaultOn: true, type: 'date' },
        { key: 'failureMode.id', label: 'Failure Mode', defaultOn: true, type: 'string' },
        { key: 'faultState', label: 'Fault State', defaultOn: true, type: 'string' },
        { key: 'controller.id', label: 'Controller', defaultOn: false, type: 'string' },
        { key: 'count', label: 'Count', defaultOn: false, type: 'number' },
        { key: 'malfunction', label: 'Malfunction', defaultOn: false, type: 'boolean' }
      ]
    },
    ExceptionEvent: {
      label: 'Exception Events',
      typeName: 'ExceptionEvent',
      needsDateRange: true,
      fields: [
        { key: 'id', label: 'Event ID', defaultOn: false, type: 'string' },
        { key: 'device.id', label: 'Device', defaultOn: true, type: 'id', resolve: 'device' },
        { key: 'driver.id', label: 'Driver', defaultOn: true, type: 'id', resolve: 'user' },
        { key: 'rule.id', label: 'Rule', defaultOn: true, type: 'id', resolve: 'rule' },
        { key: 'activeFrom', label: 'Start', defaultOn: true, type: 'date' },
        { key: 'activeTo', label: 'End', defaultOn: true, type: 'date' },
        { key: 'duration', label: 'Duration', defaultOn: true, type: 'duration' },
        { key: 'distance', label: 'Distance (km)', defaultOn: false, type: 'number' },
        { key: 'state', label: 'State', defaultOn: true, type: 'string' }
      ]
    },
    LogRecord: {
      label: 'GPS Logs',
      typeName: 'LogRecord',
      needsDateRange: true,
      fields: [
        { key: 'id', label: 'Log ID', defaultOn: false, type: 'string' },
        { key: 'device.id', label: 'Device', defaultOn: true, type: 'id', resolve: 'device' },
        { key: 'dateTime', label: 'Date/Time', defaultOn: true, type: 'date' },
        { key: 'latitude', label: 'Latitude', defaultOn: true, type: 'number' },
        { key: 'longitude', label: 'Longitude', defaultOn: true, type: 'number' },
        { key: 'speed', label: 'Speed (km/h)', defaultOn: true, type: 'number' }
      ]
    },
    StatusData: {
      label: 'Engine / Status Data',
      typeName: 'StatusData',
      needsDateRange: true,
      needsDiagnostic: true,
      fields: [
        { key: 'id', label: 'Record ID', defaultOn: false, type: 'string' },
        { key: 'device.id', label: 'Device', defaultOn: true, type: 'id', resolve: 'device' },
        { key: 'diagnostic.id', label: 'Diagnostic', defaultOn: true, type: 'id', resolve: 'diagnostic' },
        { key: 'dateTime', label: 'Date/Time', defaultOn: true, type: 'date' },
        { key: 'data', label: 'Value', defaultOn: true, type: 'number' }
      ]
    },
    Zone: {
      label: 'Zones',
      typeName: 'Zone',
      needsDateRange: false,
      fields: [
        { key: 'id', label: 'Zone ID', defaultOn: false, type: 'string' },
        { key: 'name', label: 'Name', defaultOn: true, type: 'string' },
        { key: 'comment', label: 'Comment', defaultOn: false, type: 'string' },
        { key: 'displayed', label: 'Displayed', defaultOn: true, type: 'boolean' },
        { key: 'mustIdentifyStops', label: 'Must Identify Stops', defaultOn: false, type: 'boolean' },
        { key: 'activeFrom', label: 'Active From', defaultOn: true, type: 'date' },
        { key: 'activeTo', label: 'Active To', defaultOn: false, type: 'date' },
        { key: 'externalReference', label: 'External Reference', defaultOn: false, type: 'string' },
        { key: 'zoneTypes', label: 'Zone Types', defaultOn: true, type: 'string' }
      ]
    },
    User: {
      label: 'Drivers',
      typeName: 'User',
      needsDateRange: false,
      isDriverOnly: true,
      fields: [
        { key: 'id', label: 'User ID', defaultOn: false, type: 'string' },
        { key: 'name', label: 'Username', defaultOn: true, type: 'string' },
        { key: 'firstName', label: 'First Name', defaultOn: true, type: 'string' },
        { key: 'lastName', label: 'Last Name', defaultOn: true, type: 'string' },
        { key: 'employeeNo', label: 'Employee #', defaultOn: true, type: 'string' },
        { key: 'isDriver', label: 'Is Driver', defaultOn: false, type: 'boolean' },
        { key: 'driverGroups', label: 'Driver Groups', defaultOn: false, type: 'string' },
        { key: 'activeFrom', label: 'Active From', defaultOn: true, type: 'date' },
        { key: 'activeTo', label: 'Active To', defaultOn: false, type: 'date' },
        { key: 'phoneNumber', label: 'Phone', defaultOn: false, type: 'string' }
      ]
    },
    DriverChange: {
      label: 'Driver Changes',
      typeName: 'DriverChange',
      needsDateRange: true,
      fields: [
        { key: 'id', label: 'Change ID', defaultOn: false, type: 'string' },
        { key: 'device.id', label: 'Device', defaultOn: true, type: 'id', resolve: 'device' },
        { key: 'driver.id', label: 'Driver', defaultOn: true, type: 'id', resolve: 'user' },
        { key: 'dateTime', label: 'Date/Time', defaultOn: true, type: 'date' },
        { key: 'type', label: 'Type', defaultOn: true, type: 'string' }
      ]
    },
    DutyStatusLog: {
      label: 'HOS / Duty Status',
      typeName: 'DutyStatusLog',
      needsDateRange: true,
      fields: [
        { key: 'id', label: 'Log ID', defaultOn: false, type: 'string' },
        { key: 'driver.id', label: 'Driver', defaultOn: true, type: 'id', resolve: 'user' },
        { key: 'device.id', label: 'Device', defaultOn: true, type: 'id', resolve: 'device' },
        { key: 'dateTime', label: 'Date/Time', defaultOn: true, type: 'date' },
        { key: 'status', label: 'Status', defaultOn: true, type: 'string' },
        { key: 'origin', label: 'Origin', defaultOn: true, type: 'string' },
        { key: 'state', label: 'State', defaultOn: false, type: 'string' },
        { key: 'location.x', label: 'Longitude', defaultOn: false, type: 'number' },
        { key: 'location.y', label: 'Latitude', defaultOn: false, type: 'number' },
        { key: 'annotations', label: 'Annotations', defaultOn: false, type: 'string' },
        { key: 'malfunction', label: 'Malfunction', defaultOn: false, type: 'boolean' }
      ]
    },
    DVIRLog: {
      label: 'DVIR Logs',
      typeName: 'DVIRLog',
      needsDateRange: true,
      fields: [
        { key: 'id', label: 'DVIR ID', defaultOn: false, type: 'string' },
        { key: 'device.id', label: 'Device', defaultOn: true, type: 'id', resolve: 'device' },
        { key: 'driver.id', label: 'Driver', defaultOn: true, type: 'id', resolve: 'user' },
        { key: 'dateTime', label: 'Date/Time', defaultOn: true, type: 'date' },
        { key: 'logType', label: 'Log Type', defaultOn: true, type: 'string' },
        { key: 'isSafe', label: 'Is Safe', defaultOn: true, type: 'boolean' },
        { key: 'certifiedBy.id', label: 'Certified By', defaultOn: false, type: 'id', resolve: 'user' },
        { key: 'repairedBy.id', label: 'Repaired By', defaultOn: false, type: 'id', resolve: 'user' },
        { key: 'certifyDate', label: 'Certify Date', defaultOn: false, type: 'date' },
        { key: 'repairDate', label: 'Repair Date', defaultOn: false, type: 'date' }
      ]
    },
    FuelTransaction: {
      label: 'Fuel Transactions',
      typeName: 'FuelTransaction',
      needsDateRange: true,
      fields: [
        { key: 'id', label: 'Transaction ID', defaultOn: false, type: 'string' },
        { key: 'device.id', label: 'Device', defaultOn: true, type: 'id', resolve: 'device' },
        { key: 'driver.id', label: 'Driver', defaultOn: true, type: 'id', resolve: 'user' },
        { key: 'dateTime', label: 'Date/Time', defaultOn: true, type: 'date' },
        { key: 'volume', label: 'Volume (L)', defaultOn: true, type: 'number' },
        { key: 'cost', label: 'Cost', defaultOn: true, type: 'number' },
        { key: 'currencyCode', label: 'Currency', defaultOn: false, type: 'string' },
        { key: 'odometer', label: 'Odometer (km)', defaultOn: true, type: 'number' },
        { key: 'productType', label: 'Product Type', defaultOn: true, type: 'string' },
        { key: 'siteName', label: 'Site Name', defaultOn: true, type: 'string' },
        { key: 'sourceData', label: 'Source', defaultOn: false, type: 'string' },
        { key: 'serialNumber', label: 'Card Number', defaultOn: false, type: 'string' },
        { key: 'description', label: 'Description', defaultOn: false, type: 'string' }
      ]
    },
    TextMessage: {
      label: 'Text Messages',
      typeName: 'TextMessage',
      needsDateRange: true,
      fields: [
        { key: 'id', label: 'Message ID', defaultOn: false, type: 'string' },
        { key: 'device.id', label: 'Device', defaultOn: true, type: 'id', resolve: 'device' },
        { key: 'user.id', label: 'User', defaultOn: true, type: 'id', resolve: 'user' },
        { key: 'dateTime', label: 'Date/Time', defaultOn: true, type: 'date' },
        { key: 'sent', label: 'Sent', defaultOn: true, type: 'date' },
        { key: 'delivered', label: 'Delivered', defaultOn: false, type: 'date' },
        { key: 'read', label: 'Read', defaultOn: false, type: 'date' },
        { key: 'isDirectionToVehicle', label: 'To Vehicle', defaultOn: true, type: 'boolean' },
        { key: 'messageContent.message', label: 'Message', defaultOn: true, type: 'string' },
        { key: 'messageContent.contentType', label: 'Content Type', defaultOn: false, type: 'string' }
      ]
    },
    Route: {
      label: 'Routes',
      typeName: 'Route',
      needsDateRange: false,
      fields: [
        { key: 'id', label: 'Route ID', defaultOn: false, type: 'string' },
        { key: 'name', label: 'Name', defaultOn: true, type: 'string' },
        { key: 'comment', label: 'Comment', defaultOn: true, type: 'string' },
        { key: 'device.id', label: 'Device', defaultOn: true, type: 'id', resolve: 'device' },
        { key: 'routeType', label: 'Route Type', defaultOn: true, type: 'string' }
      ]
    },
    Group: {
      label: 'Groups',
      typeName: 'Group',
      needsDateRange: false,
      fields: [
        { key: 'id', label: 'Group ID', defaultOn: false, type: 'string' },
        { key: 'name', label: 'Name', defaultOn: true, type: 'string' },
        { key: 'comments', label: 'Comments', defaultOn: true, type: 'string' },
        { key: 'reference', label: 'Reference', defaultOn: false, type: 'string' },
        { key: 'parent.id', label: 'Parent Group', defaultOn: true, type: 'string' },
        { key: 'color.a', label: 'Color Alpha', defaultOn: false, type: 'number' },
        { key: 'children', label: 'Children', defaultOn: false, type: 'string' }
      ]
    },
    Trailer: {
      label: 'Trailers',
      typeName: 'Trailer',
      needsDateRange: false,
      fields: [
        { key: 'id', label: 'Trailer ID', defaultOn: false, type: 'string' },
        { key: 'name', label: 'Name', defaultOn: true, type: 'string' },
        { key: 'comment', label: 'Comment', defaultOn: true, type: 'string' },
        { key: 'activeFrom', label: 'Active From', defaultOn: true, type: 'date' },
        { key: 'activeTo', label: 'Active To', defaultOn: false, type: 'date' }
      ]
    },
    Audit: {
      label: 'Audit Logs',
      typeName: 'Audit',
      needsDateRange: true,
      fields: [
        { key: 'id', label: 'Audit ID', defaultOn: false, type: 'string' },
        { key: 'user.id', label: 'User', defaultOn: true, type: 'id', resolve: 'user' },
        { key: 'userName', label: 'Username', defaultOn: true, type: 'string' },
        { key: 'dateTime', label: 'Date/Time', defaultOn: true, type: 'date' },
        { key: 'name', label: 'Event', defaultOn: true, type: 'string' },
        { key: 'comment', label: 'Comment', defaultOn: true, type: 'string' }
      ]
    },
    Rule: {
      label: 'Rules',
      typeName: 'Rule',
      needsDateRange: false,
      fields: [
        { key: 'id', label: 'Rule ID', defaultOn: false, type: 'string' },
        { key: 'name', label: 'Name', defaultOn: true, type: 'string' },
        { key: 'comment', label: 'Comment', defaultOn: true, type: 'string' },
        { key: 'baseType', label: 'Base Type', defaultOn: true, type: 'string' },
        { key: 'activeFrom', label: 'Active From', defaultOn: true, type: 'date' },
        { key: 'activeTo', label: 'Active To', defaultOn: false, type: 'date' }
      ]
    },
    ChargeEvent: {
      label: 'EV Charge Events',
      typeName: 'ChargeEvent',
      needsDateRange: true,
      fields: [
        { key: 'id', label: 'Event ID', defaultOn: false, type: 'string' },
        { key: 'device.id', label: 'Device', defaultOn: true, type: 'id', resolve: 'device' },
        { key: 'startTime', label: 'Start Time', defaultOn: true, type: 'date' },
        { key: 'duration', label: 'Duration', defaultOn: true, type: 'duration' },
        { key: 'startStateOfCharge', label: 'Start SoC (%)', defaultOn: true, type: 'number' },
        { key: 'maxStateOfCharge', label: 'Max SoC (%)', defaultOn: true, type: 'number' },
        { key: 'energyConsumedKwh', label: 'Energy (kWh)', defaultOn: true, type: 'number' },
        { key: 'energyUsedSinceLastChargeKwh', label: 'Energy Since Last Charge (kWh)', defaultOn: false, type: 'number' },
        { key: 'peakPowerKw', label: 'Peak Power (kW)', defaultOn: false, type: 'number' },
        { key: 'chargeType', label: 'Charge Type', defaultOn: true, type: 'string' },
        { key: 'chargeIsEstimated', label: 'Estimated', defaultOn: false, type: 'boolean' }
      ]
    },
    DriverRegulation: {
      label: 'Driver Regulation',
      typeName: 'DriverRegulation',
      needsDateRange: false,
      fields: [
        { key: 'id', label: 'Regulation ID', defaultOn: false, type: 'string' },
        { key: 'driver.id', label: 'Driver', defaultOn: true, type: 'id', resolve: 'user' },
        { key: 'driverGroups', label: 'Driver Groups', defaultOn: false, type: 'string' },
        { key: 'workDay', label: 'Work Day (hrs)', defaultOn: true, type: 'number' },
        { key: 'workWeek', label: 'Work Week (hrs)', defaultOn: true, type: 'number' },
        { key: 'dailyRest', label: 'Daily Rest (hrs)', defaultOn: true, type: 'number' },
        { key: 'weeklyRest', label: 'Weekly Rest (hrs)', defaultOn: false, type: 'number' },
        { key: 'dayStart', label: 'Day Start', defaultOn: false, type: 'number' },
        { key: 'cycleDuration', label: 'Cycle Duration', defaultOn: false, type: 'number' }
      ]
    },
    DeviceStatusInfo: {
      label: 'Asset Status',
      typeName: 'DeviceStatusInfo',
      needsDateRange: false,
      fields: [
        { key: 'device.id', label: 'Device', defaultOn: true, type: 'id', resolve: 'device' },
        { key: 'dateTime', label: 'Last Comm', defaultOn: true, type: 'date' },
        { key: 'latitude', label: 'Latitude', defaultOn: true, type: 'number' },
        { key: 'longitude', label: 'Longitude', defaultOn: true, type: 'number' },
        { key: 'bearing', label: 'Bearing', defaultOn: false, type: 'number' },
        { key: 'speed', label: 'Speed (km/h)', defaultOn: true, type: 'number' },
        { key: 'isDeviceCommunicating', label: 'Communicating', defaultOn: true, type: 'boolean' },
        { key: 'isDriving', label: 'Driving', defaultOn: true, type: 'boolean' },
        { key: 'currentStateDuration', label: 'State Duration', defaultOn: true, type: 'duration' },
        { key: 'isHistoricLastDriver', label: 'Historic Last Driver', defaultOn: false, type: 'boolean' },
        { key: 'driver.id', label: 'Driver', defaultOn: true, type: 'id', resolve: 'user' }
      ]
    }
  };

  var MAX_SELECTIONS = 15;

  function getCategoryKeys() {
    return Object.keys(categories);
  }

  function getCategory(key) {
    return categories[key] || null;
  }

  function getDefaultFields(categoryKey) {
    var cat = categories[categoryKey];
    if (!cat) return [];
    return cat.fields.filter(function (f) { return f.defaultOn; });
  }

  function resolvePath(obj, path) {
    if (!obj || !path) return undefined;
    var parts = path.split('.');
    var current = obj;
    for (var i = 0; i < parts.length; i++) {
      if (current == null) return undefined;
      current = current[parts[i]];
    }
    return current;
  }

  // ====================================================================
  //  CACHE MANAGER — device/zone/rule/user/diagnostic lookup cache
  // ====================================================================

  var cache = {
    device: {},
    zone: {},
    rule: {},
    user: {},
    diagnostic: {}
  };
  var cacheLoaded = false;

  function initCache(api) {
    if (cacheLoaded) return Promise.resolve();

    var calls = [
      ['Get', { typeName: 'Device', resultsLimit: 10000, search: {} }],
      ['Get', { typeName: 'Zone', resultsLimit: 5000, search: {} }],
      ['Get', { typeName: 'Rule', resultsLimit: 5000, search: {} }],
      ['Get', { typeName: 'User', resultsLimit: 5000, search: {} }]
    ];

    return new Promise(function (resolve, reject) {
      api.multiCall(calls, function (results) {
        try {
          (results[0] || []).forEach(function (d) {
            cache.device[d.id] = d.name || d.serialNumber || d.id;
          });
          (results[1] || []).forEach(function (z) {
            cache.zone[z.id] = z.name || z.id;
          });
          (results[2] || []).forEach(function (r) {
            cache.rule[r.id] = r.name || r.id;
          });
          (results[3] || []).forEach(function (u) {
            var display = '';
            if (u.firstName || u.lastName) {
              display = ((u.firstName || '') + ' ' + (u.lastName || '')).trim();
            }
            cache.user[u.id] = display || u.name || u.id;
          });
          cacheLoaded = true;
          resolve();
        } catch (e) {
          reject(e);
        }
      }, function (err) {
        reject(err);
      });
    });
  }

  function cacheResolve(type, id) {
    if (!id) return '';
    if (cache[type] && cache[type][id]) return cache[type][id];
    if (typeof id === 'string' && id.startsWith('Diagnostic')) {
      return id.replace(/Id$/, '').replace(/([A-Z])/g, ' $1').trim();
    }
    return String(id);
  }

  // ====================================================================
  //  QUERY ENGINE — build & execute multiCall queries
  // ====================================================================

  function runQueries(api, opts, onProgress) {
    var calls = [];
    var callMap = [];

    opts.categories.forEach(function (catKey) {
      var catDef = getCategory(catKey);
      if (!catDef) return;

      var search = {};
      var limit = opts.resultsLimit || 500;

      if (catDef.needsDateRange) {
        search.fromDate = opts.fromDate;
        search.toDate = opts.toDate;
      }
      if (opts.deviceId) {
        search.deviceSearch = { id: opts.deviceId };
      }
      if (catDef.isDriverOnly) {
        search.isDriver = true;
      }
      if (catDef.needsDiagnostic && opts.diagnosticId) {
        search.diagnosticSearch = { id: opts.diagnosticId };
      }

      calls.push(['Get', { typeName: catDef.typeName, search: search, resultsLimit: limit }]);
      callMap.push(catKey);
    });

    if (calls.length === 0) return Promise.resolve({});

    if (onProgress) onProgress('Querying ' + calls.length + ' data type(s)...');

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

  // ====================================================================
  //  TABLE RENDERER — sortable, paginated, filterable data table
  // ====================================================================

  var tableState = {
    opts: null,
    page: 0,
    sortCol: -1,
    sortDir: 'asc',
    filteredRows: [],
    filterQuery: ''
  };

  function renderTable(opts) {
    tableState.opts = opts;
    tableState.page = 0;
    tableState.sortCol = -1;
    tableState.sortDir = 'asc';
    tableState.filterQuery = '';
    tableState.filteredRows = opts.rows.slice();
    drawTable();
  }

  function drawTable() {
    var opts = tableState.opts;
    if (!opts) return;

    var container = document.getElementById(opts.containerId);
    var fields = opts.fields;
    var pageSize = opts.pageSize || 50;

    if (tableState.filteredRows.length === 0) {
      container.innerHTML = '<div class="fdr-no-data">No data found.</div>';
      updatePagination(0, 0, 0);
      return;
    }

    var totalPages = Math.ceil(tableState.filteredRows.length / pageSize);
    if (tableState.page >= totalPages) tableState.page = totalPages - 1;
    if (tableState.page < 0) tableState.page = 0;

    var start = tableState.page * pageSize;
    var end = Math.min(start + pageSize, tableState.filteredRows.length);
    var pageRows = tableState.filteredRows.slice(start, end);

    var html = '<div class="fdr-table-wrap"><table class="fdr-table"><thead><tr>';
    fields.forEach(function (f, idx) {
      var arrowClass = idx === tableState.sortCol ? tableState.sortDir : '';
      html += '<th data-col="' + idx + '">' + escapeHtml(f.label) +
        '<span class="sort-arrow ' + arrowClass + '"></span></th>';
    });
    html += '</tr></thead><tbody>';

    pageRows.forEach(function (row) {
      html += '<tr>';
      fields.forEach(function (f) {
        var val = resolvePath(row, f.key);
        var display = formatValue(val, f);
        html += '<td title="' + escapeHtml(display) + '">' + escapeHtml(display) + '</td>';
      });
      html += '</tr>';
    });
    html += '</tbody></table></div>';
    container.innerHTML = html;

    // Bind sort via event delegation on the table container
    container.addEventListener('click', function (e) {
      var th = e.target.closest('th[data-col]');
      if (!th) return;
      var col = parseInt(th.dataset.col, 10);
      if (tableState.sortCol === col) {
        tableState.sortDir = tableState.sortDir === 'asc' ? 'desc' : 'asc';
      } else {
        tableState.sortCol = col;
        tableState.sortDir = 'asc';
      }
      var field = opts.fields[col];
      tableState.filteredRows.sort(function (a, b) {
        return compareValues(resolvePath(a, field.key), resolvePath(b, field.key), field.type, tableState.sortDir);
      });
      tableState.page = 0;
      drawTable();
    });

    updatePagination(start + 1, end, tableState.filteredRows.length);
  }

  function compareValues(a, b, type, dir) {
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
    if (field.resolve) return cacheResolve(field.resolve, val);
    switch (field.type) {
      case 'date':
        try {
          var d = new Date(val);
          if (isNaN(d.getTime())) return String(val);
          return d.toLocaleString();
        } catch (e) { return String(val); }
      case 'number':
        if (typeof val === 'number') return val % 1 === 0 ? String(val) : val.toFixed(2);
        return String(val);
      case 'duration':
        return formatDuration(val);
      case 'boolean':
        return val ? 'Yes' : 'No';
      default:
        if (Array.isArray(val)) {
          return val.map(function (v) {
            return typeof v === 'object' ? (v.name || v.id || JSON.stringify(v)) : String(v);
          }).join(', ');
        }
        if (typeof val === 'object') return val.name || val.id || JSON.stringify(val);
        return String(val);
    }
  }

  function formatDuration(val) {
    if (typeof val === 'string') {
      var match = val.match(/PT?(\d+H)?(\d+M)?(\d+\.?\d*S)?/i);
      if (match) {
        var h = parseInt(match[1]) || 0;
        var m = parseInt(match[2]) || 0;
        var s = parseFloat(match[3]) || 0;
        return h + 'h ' + m + 'm ' + Math.round(s) + 's';
      }
      var tsMatch = val.match(/(?:(\d+)\.)?(\d+):(\d+):(\d+)/);
      if (tsMatch) {
        var days = parseInt(tsMatch[1]) || 0;
        return (days > 0 ? days + 'd ' : '') + tsMatch[2] + 'h ' + tsMatch[3] + 'm ' + tsMatch[4] + 's';
      }
      return val;
    }
    if (typeof val === 'number') {
      var hrs = Math.floor(val / 3600);
      var mins = Math.floor((val % 3600) / 60);
      var secs = Math.round(val % 60);
      return hrs + 'h ' + mins + 'm ' + secs + 's';
    }
    return String(val);
  }

  function filterTable(query) {
    tableState.filterQuery = (query || '').toLowerCase().trim();
    if (!tableState.opts) return;

    if (!tableState.filterQuery) {
      tableState.filteredRows = tableState.opts.rows.slice();
    } else {
      tableState.filteredRows = tableState.opts.rows.filter(function (row) {
        return tableState.opts.fields.some(function (f) {
          var val = resolvePath(row, f.key);
          var display = formatValue(val, f);
          return display.toLowerCase().indexOf(tableState.filterQuery) >= 0;
        });
      });
    }

    if (tableState.sortCol >= 0 && tableState.opts.fields[tableState.sortCol]) {
      var field = tableState.opts.fields[tableState.sortCol];
      tableState.filteredRows.sort(function (a, b) {
        return compareValues(resolvePath(a, field.key), resolvePath(b, field.key), field.type, tableState.sortDir);
      });
    }
    tableState.page = 0;
    drawTable();
  }

  function tableNextPage() {
    if (!tableState.opts) return;
    var pageSize = tableState.opts.pageSize || 50;
    var totalPages = Math.ceil(tableState.filteredRows.length / pageSize);
    if (tableState.page < totalPages - 1) { tableState.page++; drawTable(); }
  }

  function tablePrevPage() {
    if (tableState.page > 0) { tableState.page--; drawTable(); }
  }

  function updatePagination(start, end, total) {
    if (!tableState.opts) return;
    var info = document.getElementById(tableState.opts.pageInfoId);
    var prev = document.getElementById(tableState.opts.prevBtnId);
    var next = document.getElementById(tableState.opts.nextBtnId);
    if (total === 0) {
      info.textContent = 'No results';
      prev.disabled = true;
      next.disabled = true;
      return;
    }
    info.textContent = 'Showing ' + start + ' - ' + end + ' of ' + total;
    prev.disabled = tableState.page === 0;
    var pageSize = tableState.opts.pageSize || 50;
    next.disabled = tableState.page >= Math.ceil(total / pageSize) - 1;
  }

  // ====================================================================
  //  CSV EXPORTER — UTF-8 BOM CSV download
  // ====================================================================

  function exportCsv(fields, rows, filenameBase) {
    if (!fields || fields.length === 0 || !rows) return;

    var exportRows = tableState.filteredRows.length > 0 ? tableState.filteredRows : rows;
    var lines = [];

    lines.push(fields.map(function (f) { return csvEscape(f.label); }).join(','));
    exportRows.forEach(function (row) {
      var cells = fields.map(function (f) {
        var val = resolvePath(row, f.key);
        return csvEscape(formatValue(val, f));
      });
      lines.push(cells.join(','));
    });

    var bom = '\uFEFF';
    var blob = new Blob([bom + lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });

    var now = new Date();
    var ts = now.getFullYear() +
      String(now.getMonth() + 1).padStart(2, '0') +
      String(now.getDate()).padStart(2, '0') + '_' +
      String(now.getHours()).padStart(2, '0') +
      String(now.getMinutes()).padStart(2, '0');

    var filename = (filenameBase || 'export').replace(/[^a-zA-Z0-9_-]/g, '_') + '_' + ts + '.csv';
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
  }

  function csvEscape(val) {
    if (val == null) return '';
    var str = String(val);
    if (str.indexOf(',') >= 0 || str.indexOf('"') >= 0 || str.indexOf('\n') >= 0 || str.indexOf('\r') >= 0) {
      return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
  }

  // ====================================================================
  //  CHART RENDERER — canvas bar/line/pie charts
  // ====================================================================

  var CHART_COLORS = [
    '#4a90d9', '#2e7d32', '#e65100', '#7b1fa2', '#00838f',
    '#c62828', '#f57f17', '#546e7a', '#1565c0', '#283593',
    '#3a7bc8', '#d32f2f', '#827717', '#37474f', '#0277bd',
    '#455a64', '#607d8b', '#90a4ae', '#b0bec5', '#263238'
  ];

  function renderChart(opts) {
    var canvas = document.getElementById(opts.canvasId);
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    var groups = {};
    var maxGroups = opts.maxGroups || 20;

    opts.rows.forEach(function (row) {
      var rawGroup = resolvePath(row, opts.groupFieldKey);
      var groupLabel;
      if (opts.groupFieldDef && opts.groupFieldDef.resolve) {
        groupLabel = cacheResolve(opts.groupFieldDef.resolve, rawGroup);
      } else if (opts.groupFieldDef && opts.groupFieldDef.type === 'date') {
        try { groupLabel = new Date(rawGroup).toLocaleDateString(); }
        catch (e) { groupLabel = String(rawGroup || '(empty)'); }
      } else {
        groupLabel = String(rawGroup || '(empty)');
      }
      var num = parseFloat(resolvePath(row, opts.valueFieldKey)) || 0;
      if (!groups[groupLabel]) groups[groupLabel] = { sum: 0, count: 0 };
      groups[groupLabel].sum += num;
      groups[groupLabel].count += 1;
    });

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

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (sorted.length === 0) {
      ctx.fillStyle = '#999';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('No data to chart.', canvas.width / 2, canvas.height / 2);
      return;
    }

    switch (opts.chartType) {
      case 'bar':  drawBarChart(ctx, canvas, sorted); break;
      case 'line': drawLineChart(ctx, canvas, sorted); break;
      case 'pie':  drawPieChart(ctx, canvas, sorted); break;
    }
  }

  function drawBarChart(ctx, canvas, data) {
    var w = canvas.width, h = canvas.height;
    var pad = { top: 30, right: 20, bottom: 80, left: 70 };
    var cW = w - pad.left - pad.right, cH = h - pad.top - pad.bottom;
    var maxVal = Math.max.apply(null, data.map(function (d) { return d.sum; }));
    if (maxVal === 0) maxVal = 1;
    var barW = Math.max(10, (cW / data.length) - 4);
    var gap = (cW - barW * data.length) / (data.length + 1);

    ctx.strokeStyle = '#eee'; ctx.lineWidth = 1;
    ctx.fillStyle = '#666'; ctx.font = '11px sans-serif'; ctx.textAlign = 'right';
    for (var i = 0; i <= 5; i++) {
      var yVal = (maxVal / 5) * i;
      var yPos = pad.top + cH - (cH * (yVal / maxVal));
      ctx.beginPath(); ctx.moveTo(pad.left, yPos); ctx.lineTo(w - pad.right, yPos); ctx.stroke();
      ctx.fillText(chartFormatNum(yVal), pad.left - 8, yPos + 4);
    }
    data.forEach(function (d, idx) {
      var x = pad.left + gap + idx * (barW + gap);
      var barH = (d.sum / maxVal) * cH;
      var y = pad.top + cH - barH;
      ctx.fillStyle = CHART_COLORS[idx % CHART_COLORS.length];
      ctx.fillRect(x, y, barW, barH);
      ctx.fillStyle = '#333'; ctx.font = '10px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(chartFormatNum(d.sum), x + barW / 2, y - 4);
      ctx.save();
      ctx.translate(x + barW / 2, pad.top + cH + 10);
      ctx.rotate(Math.PI / 4);
      ctx.fillStyle = '#666'; ctx.font = '10px sans-serif'; ctx.textAlign = 'left';
      ctx.fillText(truncLabel(d.label, 18), 0, 0);
      ctx.restore();
    });
  }

  function drawLineChart(ctx, canvas, data) {
    var w = canvas.width, h = canvas.height;
    var pad = { top: 30, right: 20, bottom: 80, left: 70 };
    var cW = w - pad.left - pad.right, cH = h - pad.top - pad.bottom;
    var maxVal = Math.max.apply(null, data.map(function (d) { return d.sum; }));
    if (maxVal === 0) maxVal = 1;

    ctx.strokeStyle = '#eee'; ctx.lineWidth = 1;
    ctx.fillStyle = '#666'; ctx.font = '11px sans-serif'; ctx.textAlign = 'right';
    for (var i = 0; i <= 5; i++) {
      var yVal = (maxVal / 5) * i;
      var yPos = pad.top + cH - (cH * (yVal / maxVal));
      ctx.beginPath(); ctx.moveTo(pad.left, yPos); ctx.lineTo(w - pad.right, yPos); ctx.stroke();
      ctx.fillText(chartFormatNum(yVal), pad.left - 8, yPos + 4);
    }

    var step = data.length > 1 ? cW / (data.length - 1) : cW / 2;
    ctx.beginPath(); ctx.strokeStyle = CHART_COLORS[0]; ctx.lineWidth = 2;
    data.forEach(function (d, idx) {
      var x = pad.left + idx * step;
      var y = pad.top + cH - (d.sum / maxVal) * cH;
      idx === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();

    data.forEach(function (d, idx) {
      var x = pad.left + idx * step;
      var y = pad.top + cH - (d.sum / maxVal) * cH;
      ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = CHART_COLORS[0]; ctx.fill();
      ctx.save();
      ctx.translate(x, pad.top + cH + 10);
      ctx.rotate(Math.PI / 4);
      ctx.fillStyle = '#666'; ctx.font = '10px sans-serif'; ctx.textAlign = 'left';
      ctx.fillText(truncLabel(d.label, 18), 0, 0);
      ctx.restore();
    });
  }

  function drawPieChart(ctx, canvas, data) {
    var w = canvas.width, h = canvas.height;
    var cx = w * 0.4, cy = h / 2;
    var radius = Math.min(cx - 40, cy - 40);
    if (radius < 30) radius = 30;
    var total = data.reduce(function (acc, d) { return acc + d.sum; }, 0);
    if (total === 0) return;

    var startAngle = -Math.PI / 2;
    data.forEach(function (d, idx) {
      var slice = (d.sum / total) * Math.PI * 2;
      ctx.beginPath(); ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, startAngle, startAngle + slice);
      ctx.closePath();
      ctx.fillStyle = CHART_COLORS[idx % CHART_COLORS.length]; ctx.fill();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
      startAngle += slice;
    });

    var legendX = w * 0.65, legendY = 30, rowH = 20;
    ctx.font = '11px sans-serif'; ctx.textAlign = 'left';
    data.forEach(function (d, idx) {
      var y = legendY + idx * rowH;
      if (y + rowH > h) return;
      ctx.fillStyle = CHART_COLORS[idx % CHART_COLORS.length];
      ctx.fillRect(legendX, y, 12, 12);
      ctx.fillStyle = '#333';
      var pct = ((d.sum / total) * 100).toFixed(1);
      ctx.fillText(truncLabel(d.label, 16) + ' (' + pct + '%)', legendX + 18, y + 10);
    });
  }

  function chartFormatNum(n) {
    if (Math.abs(n) >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (Math.abs(n) >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n % 1 === 0 ? String(n) : n.toFixed(1);
  }

  function truncLabel(str, max) {
    if (!str) return '';
    return str.length <= max ? str : str.substring(0, max - 1) + '\u2026';
  }

  // ====================================================================
  //  UTILITY
  // ====================================================================

  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // ====================================================================
  //  FACTORY FUNCTION — MyGeotab Add-In lifecycle
  // ====================================================================

  var api, state;
  var selectedCategories = [];
  var selectedFields = {};
  var results = {};
  var activeTab = null;
  var chartVisible = false;

  geotab.addin.flexibleDataReporter = function () {
    return {
      initialize: function (freshApi, freshState, callback) {
        api = freshApi;
        state = freshState;

        initUI();

        setStatus('Loading fleet data...');
        initCache(api)
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

      focus: function (freshApi, freshState) {
        api = freshApi;
        state = freshState;
      },

      blur: function () {
        // Nothing to clean up
      }
    };
  };

  // ====================================================================
  //  UI INITIALIZATION & EVENTS
  // ====================================================================

  function initUI() {
    buildCategoryCheckboxes();
    setDefaultDates();
    wireEvents();
  }

  function wireEvents() {
    document.getElementById('fdrRunBtn').addEventListener('click', runReport);
    document.getElementById('fdrExportCsvBtn').addEventListener('click', exportCurrentTab);
    document.getElementById('fdrToggleChartBtn').addEventListener('click', toggleChart);
    document.getElementById('fdrHideChartBtn').addEventListener('click', hideChart);
    document.getElementById('fdrRenderChartBtn').addEventListener('click', doRenderChart);
    document.getElementById('fdrSearch').addEventListener('input', function () {
      filterTable(document.getElementById('fdrSearch').value);
    });
    document.getElementById('fdrPrevBtn').addEventListener('click', tablePrevPage);
    document.getElementById('fdrNextBtn').addEventListener('click', tableNextPage);
  }

  function buildCategoryCheckboxes() {
    var container = document.getElementById('fdrCategoryChecks');
    container.innerHTML = '';
    getCategoryKeys().forEach(function (key) {
      var cat = getCategory(key);
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
    document.getElementById('fdrDateTo').value = fmtDate(now);
    document.getElementById('fdrDateFrom').value = fmtDate(weekAgo);
  }

  function fmtDate(d) {
    return d.getFullYear() + '-' +
      String(d.getMonth() + 1).padStart(2, '0') + '-' +
      String(d.getDate()).padStart(2, '0');
  }

  function populateDeviceDropdown() {
    var select = document.getElementById('fdrDeviceSelect');
    var devices = cache.device;
    var ids = Object.keys(devices);
    ids.sort(function (a, b) { return (devices[a] || '').localeCompare(devices[b] || ''); });
    ids.forEach(function (id) {
      var opt = document.createElement('option');
      opt.value = id;
      opt.textContent = devices[id];
      select.appendChild(opt);
    });
  }

  // ---- Category Toggle & Column Pickers ----

  function onCategoryToggle() {
    selectedCategories = [];
    var checks = document.querySelectorAll('#fdrCategoryChecks input[type=checkbox]');
    checks.forEach(function (cb) { if (cb.checked) selectedCategories.push(cb.value); });

    var atLimit = selectedCategories.length >= MAX_SELECTIONS;
    checks.forEach(function (cb) {
      if (!cb.checked) {
        cb.disabled = atLimit;
        cb.parentElement.style.opacity = atLimit ? '0.45' : '';
        cb.parentElement.style.cursor = atLimit ? 'not-allowed' : '';
      }
    });

    var counter = document.getElementById('fdrCategoryCounter');
    if (counter) {
      counter.textContent = selectedCategories.length + ' / ' + MAX_SELECTIONS + ' selected';
    }

    buildColumnPickers();
    updateDiagnosticPicker();
  }

  function buildColumnPickers() {
    var container = document.getElementById('fdrColumnPickers');
    container.innerHTML = '';
    selectedFields = {};

    selectedCategories.forEach(function (catKey) {
      var cat = getCategory(catKey);
      if (!cat) return;
      selectedFields[catKey] = cat.fields.filter(function (f) { return f.defaultOn; });

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
        cb.addEventListener('change', function () { updateSelectedFields(catKey, cat.fields); });
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
    var boxes = document.querySelectorAll('#fdrColumnPickers input[data-category="' + catKey + '"]');
    boxes.forEach(function (cb) {
      if (cb.checked) {
        var match = allFields.find(function (f) { return f.key === cb.dataset.fieldKey; });
        if (match) checked.push(match);
      }
    });
    selectedFields[catKey] = checked;
  }

  function updateDiagnosticPicker() {
    var picker = document.getElementById('fdrDiagnosticPicker');
    if (selectedCategories.indexOf('StatusData') >= 0) {
      picker.classList.add('visible');
    } else {
      picker.classList.remove('visible');
    }
  }

  // ---- Run Report ----

  function runReport() {
    if (selectedCategories.length === 0) {
      setStatus('Select at least one data category.', true);
      return;
    }

    if (selectedCategories.indexOf('StatusData') >= 0) {
      if (!document.getElementById('fdrDiagnosticSelect').value) {
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

    runQueries(api, {
      categories: selectedCategories,
      fromDate: fromDate,
      toDate: toDate,
      deviceId: deviceId,
      resultsLimit: limit,
      diagnosticId: document.getElementById('fdrDiagnosticSelect').value || null
    }, function (msg) {
      setStatus('<span class="fdr-spinner"></span>' + msg, false, true);
    })
    .then(function (data) {
      results = data;
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
    document.getElementById('fdrResultsPanel').classList.add('visible');
    buildTabs();
    activateTab(selectedCategories[0]);
  }

  function buildTabs() {
    var container = document.getElementById('fdrTabs');
    container.innerHTML = '';

    selectedCategories.forEach(function (catKey) {
      var cat = getCategory(catKey);
      var count = (results[catKey] || []).length;
      var btn = document.createElement('button');
      btn.className = 'fdr-tab';
      btn.dataset.category = catKey;
      btn.innerHTML = cat.label + '<span class="fdr-tab-count">(' + count + ')</span>';
      btn.addEventListener('click', function () { activateTab(catKey); });
      container.appendChild(btn);
    });
  }

  function activateTab(catKey) {
    activeTab = catKey;

    var tabs = document.querySelectorAll('#fdrTabs .fdr-tab');
    tabs.forEach(function (t) { t.classList.toggle('active', t.dataset.category === catKey); });

    document.getElementById('fdrSearch').value = '';

    var fields = selectedFields[catKey] || getDefaultFields(catKey);
    var rows = results[catKey] || [];

    renderTable({
      containerId: 'fdrTableContainer',
      paginationId: 'fdrPagination',
      pageInfoId: 'fdrPageInfo',
      prevBtnId: 'fdrPrevBtn',
      nextBtnId: 'fdrNextBtn',
      fields: fields,
      rows: rows,
      pageSize: 50
    });

    updateChartFieldOptions(catKey, fields);
  }

  // ---- CSV Export ----

  function exportCurrentTab() {
    if (!activeTab) return;
    var fields = selectedFields[activeTab] || getDefaultFields(activeTab);
    var rows = results[activeTab] || [];
    var cat = getCategory(activeTab);
    exportCsv(fields, rows, cat ? cat.label : 'export');
  }

  // ---- Chart ----

  function toggleChart() {
    chartVisible = !chartVisible;
    document.getElementById('fdrChartPanel').classList.toggle('visible', chartVisible);
    document.getElementById('fdrToggleChartBtn').textContent = chartVisible ? 'Hide Chart' : 'Show Chart';
  }

  function hideChart() {
    chartVisible = false;
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

  function doRenderChart() {
    if (!activeTab) return;
    var chartType = document.getElementById('fdrChartType').value;
    var valueField = document.getElementById('fdrChartValueField').value;
    var groupField = document.getElementById('fdrChartGroupField').value;

    if (!valueField || !groupField) {
      setStatus('Select both a value field and group-by field for charting.', true);
      return;
    }

    var rows = results[activeTab] || [];
    var fields = selectedFields[activeTab] || [];
    var groupFieldDef = fields.find(function (f) { return f.key === groupField; });

    renderChart({
      canvasId: 'fdrCanvas',
      chartType: chartType,
      rows: rows,
      valueFieldKey: valueField,
      groupFieldKey: groupField,
      groupFieldDef: groupFieldDef,
      maxGroups: 20
    });
  }

  // ---- Status Helper ----

  function setStatus(msg, isError, isHtml) {
    var el = document.getElementById('fdrStatus');
    if (isHtml) { el.innerHTML = msg; } else { el.textContent = msg; }
    el.className = 'fdr-status' + (isError ? ' error' : '');
  }

  // ====================================================================
  //  STANDALONE FALLBACK — auto-invoke if not inside MyGeotab
  // ====================================================================

  setTimeout(function () {
    if (typeof geotab !== 'undefined' && geotab.addin && geotab.addin.flexibleDataReporter &&
        typeof geotab.addin.flexibleDataReporter === 'function') {
      var addin = geotab.addin.flexibleDataReporter();
      if (addin && typeof addin.initialize === 'function' && !api) {
        var mockApi = {
          multiCall: function (calls, ok, fail) {
            var results = calls.map(function () { return []; });
            ok(results);
          },
          call: function (method, params, ok, fail) { ok([]); }
        };
        addin.initialize(mockApi, {}, function () {
          console.log('Flexible Data Reporter running in standalone mode (no live data).');
        });
      }
    }
  }, 2000);

})();
