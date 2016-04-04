# We.js Menu plugin

> Add menu features to your project

[![Dependency Status](https://david-dm.org/wejs/we-plugin-menu.png)](https://david-dm.org/wejs/we-plugin-menu)

## Requirements in project:

- we-core

## Avaible URLS:
```
get /admin/menu
get /admin/menu/create
post /admin/menu/create
get /admin/menu/:menuId
get /admin/menu/:menuId/edit
get /admin/menu/:menuId/post
get /admin/menu/:menuId/delete
post /admin/menu/:menuId/delete
```

## Menu class / prototype:

```js
// first create one menu
var menu = new we.class.Menu({ 
  id: 'anOptionalId',
  class: 'your-menu-class',
  name: 'menuName',
  // access is check if menu is rendered with we-menu helper
  roles: ['authenticated'],
  // show this menu only for users with the permission:
  permission: 'can_do_something', // default: null
  // add active class in partent links if curent page?
  setParentLinkActiveClass: false // default false
});

// Then add links:
// 

// Add links for add multiple links
menu.addLinks([
  {
      id: 'edit',
      text: '<i class="fa fa-edit"></i> '+req.__('menu.user.edit'),
      href: '/user/'+res.locals.user.id+'/edit',
      class: null,
      weight: 4,
      name: 'menu.user.edit'
  },
  {
      id: 'create',
      text: '<i class="fa fa-edit"></i> '+req.__('menu.user.create'),
      href: '/user/'+res.locals.user.id+'/criate',
      class: null,
      weight: 5,
      name: 'menu.user.create'
  },  
);

// or add one linke
menu.addLink({
  id: 'edit',
  text: '<i class="fa fa-edit"></i> '+req.__('menu.user.edit'),
  href: '/user/'+res.locals.user.id+'/edit',
  class: null,
  weight: 4,
  name: 'menu.user.edit'
});

```

### For render your menu use:

```hbs
<!-- locals is res.locals object -->
{{we-menu menu locals=this}}
```

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
