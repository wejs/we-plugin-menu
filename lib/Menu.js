/**
 * We.js menu prototype
 */

function Menu(menu) {
  this.links = [];
  this.allLinks = {};

  if (menu) {
    this.id = menu.id;
    this.class = menu.class;
    this.name = menu.mane;
    this.type = menu.type;
    this.roles = menu.roles;
    this.permission = menu.permission;

    if (menu.links) {
      this.addLinks(menu.links);
    }
  }
}

/**
 * Add one link in this menu and sort it baset in parent and weight attrs
 *
 * @param {Object} link
 */
Menu.prototype.addLink = function(link) {
  if (!link.weight) link.weight = 0;

  if (link.parent) {
    if (!this.allLinks[link.parent])
      this.allLinks[link.parent] = { links: [] };

    if (!this.allLinks[link.parent].links[link.weight])
      this.allLinks[link.parent].links[link.weight] = {};

    this.allLinks[link.parent].links[link.weight][link.id] = link;
  } else {
    if (!this.links[link.weight])
      this.links[link.weight] = {};

    this.links[link.weight][link.id] = link;

    var links = [];
    if (this.allLinks[link.id])
      links = this.allLinks[link.id].links;

    link.links = links;
    this.allLinks[link.id] = link;
  }
};

Menu.prototype.addLinks = function(links) {
  if (links) {
    for (var i = 0; i < links.length; i++) {
      this.addLink(links[i]);
    }
  }
};

Menu.prototype.getLinks = function() {
  return this.links;
}

/**
 * Get all menu links ordered by parent and weight and with updated depth
 */
Menu.prototype.getLinksList = function() {
  var links = [];

  this.getLinkLinks(this, links, 0);

  return links;
}

/**
 * get links insede one link do getLinksList
 * @param  {Object} link  link record
 * @param  {Array} links links list
 * @param  {Number} depth  depth number
 */
Menu.prototype.getLinkLinks = function(link, links, depth) {
  if (link.links) {
    for (var i = 0; i < link.links.length; i++) {
      if (!link.links[i]) continue;

      for (var id in link.links[i]) {
        // set updated depth
        link.links[i][id].depth = depth;
        // push to links array
        links.push(link.links[i][id]);
        // run same FN for sub links
        if (link.links[i][id].links) {
          this.getLinkLinks(link.links[i][id], links, depth+1);
        }
      }
    }
  }
}

Menu.prototype.removeLink = function() {
  console.log('TODO!');
};

/**
 * Render the menu
 *
 * @param  {Object} req express request
 * @return {String} menu html
 */
Menu.prototype.render = function(req) {
  return req.we.view.renderTemplate('menu/menu', req.res.locals.theme, {
    menu: this, req: req
  });
};

module.exports = Menu;