"use strict";

var needle = require('needle');
var os_functions;
switch (process.platform) {
  case 'win32':
    os_functions = require('./win32');
    break;
  case 'linux':
    os_functions = require('./linux');
    break;
  case 'darwin':
    os_functions = require('./darwin');
    break;
}
// var ip_regex = /((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){3}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})/;
var ip_regex = /(\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b)/;

var public_ip_urls = [
  'http://checkip.dyndns.org',
  'http://wtfismyip.com/text',
  'http://ipecho.net/plain',
  'http://ifconfig.me/ip'
];

function is_ip_address(str) {
  return ip_regex.test(str);
};

function nic_by_name(name, cb) {
  os_functions.get_network_interfaces_list(function(err, list) {
    if (err) return cb(err);

    var nics = list.filter(function(nic) { return nic.name === name; });

    if (nics.length > 0)
      cb(null, nics[0]);
    else
      cb(new Error('No network interface named ' + name));
  });
};

exports.get_public_ip = function(options, cb) {

  if (typeof options == 'function') { // no options passed
    cb = options;
    options = {};
  }

  var urls = options.urls || public_ip_urls;

  function get(i) {
    var url = urls[i];
    if (!url) return cb(new Error('Unable to fetch IP address.'));

    needle.get(url, function(err, resp) {
      var body = resp && resp.body.toString();
      if (body && body.match(ip_regex)) {
        return cb(null, body.match(ip_regex)[1]);
      }

      get(i+1);
    })
  };

  get(0);
}

exports.get_private_ip = function(cb) {
  os_functions.get_network_interfaces_list(function(err, list) {
    if (err || !list)
      return cb(err || new Error('No network interfaces found.'));

    os_functions.get_active_network_interface_name(function(err, active_nic) {
      if (err) return cb(err);

      var ips = list.filter(function(nic) {
        if (is_ip_address(nic.ip_address))
          return active_nic ? active_nic == nic.name : true;
      });

      if (ips.length > 0)
        cb(null, ips[0].ip_address);
      else
        cb(new Error('No private IPs found (' + list.length + ' interfaces)'));
    });
  });
};

exports.get_gateway_ip = function(cb) {
  os_functions.get_active_network_interface_name(function(err, nic_name) {
    if (err || nic_name.trim() == '')
      return cb(err || new Error('No active network interface found.'));

    os_functions.gateway_ip_for(nic_name, function(err, out) {
      if (err || !out || out.toString() == '')
        return cb(err || new Error('No gateway IP assigned to ' + nic_name));

      cb(null, out.toString().trim())
    })
  });
};

exports.get_active_interface = function(cb) {
  os_functions.get_active_network_interface_name(function(err, nic_name) {
    if (err || !nic_name) return cb(err || new Error("No active interfaces detected."));

    nic_by_name(nic_name, function(err, nic) {
      if (err) return cb(err);

      os_functions.netmask_for(nic_name, function(err, netmask) {
        if (!err && netmask)
          nic.netmask = netmask.trim();

        os_functions.gateway_ip_for(nic_name, function(err, ip) {
          if (!err && ip)
            nic.gateway_ip = ip.toString().trim();

          cb(null, nic);
        })
      });
    });
  });
};

exports.get_interfaces_list = os_functions.get_network_interfaces_list;
exports.mac_address_for = os_functions.mac_address_for;
exports.gateway_ip_for = os_functions.gateway_ip_for;
