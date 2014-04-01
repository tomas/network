"use strict";

//////////////////////////////////////////
// by Tomas Pollak - http://forkhq.com
//////////////////////////////////////////

var os_functions = require('./' + process.platform);

var ip_address_regex = /^((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){3}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})$/;

var is_ip_address = function(str) {
  return ip_address_regex.test(str);
};


var nic_by_name = function(name, cb) {

  os_functions.get_network_interfaces_list(function(err, list) {
    if (err) return cb(err);

    var nics = list.filter(function(nic) { return nic.name === name; });

    if (nics.length > 0)
      cb(null, nics[0]);
    else
      cb(new Error('No network interface named ' + name));
  });

};

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
    if (err) return cb(err);

    os_functions.gateway_ip_for(nic_name, function(err, out) {
      if (err || !out || out.toString() == '')
        return cb(err || new Error('No gateway IP assigned to ' + nic_name));

      cb(null, out.toString().trim())
    })

  });

};

exports.get_active_network_interface = function(cb) {

  os_functions.get_active_network_interface_name(function(err, nic_name) {
    if (err) return cb(err);

    nic_by_name(nic_name, function(err, nic) {
      if (err) return cb(err);

      os_functions.netmask_for(nic_name, function(err, netmask) {
        if (!err && netmask)
          nic.netmask = netmask.trim();

        cb(null, nic);
      });
    });

  });

};
