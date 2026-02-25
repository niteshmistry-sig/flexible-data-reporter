/**
 * dataTypes.js — Central registry of all data categories, API mappings, and field definitions.
 * Every other module references this to know what can be queried and displayed.
 */
var DataTypes = (function () {
  'use strict';

  /**
   * Field definition shape:
   *   { key, label, defaultOn, type, resolve? }
   *
   * key        — dot-path into the API result object (e.g. "device.id")
   * label      — human-readable column header
   * defaultOn  — whether the column is checked by default
   * type       — "string" | "number" | "date" | "boolean" | "id"
   * resolve    — optional resolver name used by CacheManager ("device", "zone", "rule", "user", "diagnostic")
   */

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

  /** Max categories that can be selected at once */
  var MAX_SELECTIONS = 15;

  /** Return ordered list of category keys */
  function getCategoryKeys() {
    return Object.keys(categories);
  }

  /** Return category definition by key */
  function getCategory(key) {
    return categories[key] || null;
  }

  /** Return only the default-on fields for a category */
  function getDefaultFields(categoryKey) {
    var cat = categories[categoryKey];
    if (!cat) return [];
    return cat.fields.filter(function (f) { return f.defaultOn; });
  }

  /** Resolve a dot-path value from an object (e.g. "device.id" from row) */
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

  return {
    categories: categories,
    MAX_SELECTIONS: MAX_SELECTIONS,
    getCategoryKeys: getCategoryKeys,
    getCategory: getCategory,
    getDefaultFields: getDefaultFields,
    resolvePath: resolvePath
  };
})();
