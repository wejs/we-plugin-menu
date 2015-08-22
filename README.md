# We.js Menu plugin

> Add menu features to your project

[![Dependency Status](https://david-dm.org/wejs/we-plugin-menu.png)](https://david-dm.org/wejs/we-plugin-menu)

## Requirements in project:

- we-core

## Avaible URLS:

get /admin/menu
get /admin/menu/create
post /admin/menu/create
get /admin/menu/:menuId
get /admin/menu/:menuId/edit
get /admin/menu/:menuId/post
get /admin/menu/:menuId/delete
post /admin/menu/:menuId/delete

## Hooks and events:

Hooks and events avaible in this plugin

##### EVENT we-plugin-menu:after:set:menu:class
This event run in we.js bootstrap after load all plugins

```sh
we.events.on('we-plugin-menu:after:set:menu:class', function (we){
  // your code here ...
});
```

##### HOOK we-plugin-menu:after:set:core:menus
This hook run in load context step of request/response

```sh
we.hooks.on('we-plugin-menu:after:set:core:menus', function (data, done){
  var req = data.req;
  var res = data.res;

  // your code here ...

  done();
});
```

## How to install:

In one we.js project:

```sh
npm install we-plugin-menu --save
```


#### NPM Info:
[![NPM](https://nodei.co/npm/we-plugin-menu.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/we-plugin-menu/)

## Copyright and license

Copyright 2013-2014 Alberto Souza <alberto.souza.99@gmail.com> and contributors , under [the MIT license](LICENSE).
