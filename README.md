Network Utilies for Node.js
===========================

# Install

    $ npm install network

# Usage

## Get public IP

Returns your public IP address, as reported by DynDNS.org or other services.

``` js
var network = require('network');

network.get_public_ip(function(err, ip) {
  console.log(err || ip); // should return your public IP address
})
```

##### CLI

    $ network public_ip

## Get private IP

Returns the IP address assigned to your first active network inteface.

``` js
network.get_private_ip(function(err, ip) {
  console.log(err || ip); // err may be 'No active network interface found'.
})
```

##### CLI

    $ network private_ip

## Get gateway IP

Returns the IP of the gateway that your active network interface is linked to.

``` js
network.get_gateway_ip(function(err, ip) {
  console.log(err || ip); // err may be 'No active network interface found.'
})
```

##### CLI

    $ network gateway_ip

## Get active interface

Returns the IP, MAC address and interface type for the active network
interface. On OS X and Linux you also get the IP of its assigned gateway.

``` js
network.get_active_interface(function(err, obj) {

  /* obj should be:

  { name: 'eth0',
    ip_address: '10.0.1.3',
    mac_address: '56:e5:f9:e4:38:1d',
    type: 'Wired',
    netmask: '255.255.255.0',
    gateway_ip: '10.0.1.1' }

  */
})
```

##### CLI

    $ network active_interface

## Get interfaces list

Returns list of network interfaces, including MAC addresses and the such, just
as in the example above.

``` js
network.get_interfaces_list(function(err, list) {

  /* list should be:

  [{
    name: 'eth0',
    ip_address: '10.0.1.3',
    mac_address: '56:e5:f9:e4:38:1d',
    type: 'Wired',
    netmask: '255.255.255.0',
    gateway_ip: '10.0.1.1' 
   },
   { ... }, { ... }]

  */
})
```

##### CLI

    $ network interfaces_list

# Copyright

Written by Tomás Pollak. Copyright (c) Fork, Ltd.

# License

MIT.
