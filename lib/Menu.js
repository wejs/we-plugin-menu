/**
 * We.js menu prototype
 *
 * Links is organized by this.link[weight][link.id] = linkObject
 */

function Menu(menu) {
  this.links = [];
  this.allLinks = {};
  this.submenuTemplate = 'menu/submenu-dropdown';

  if (menu) {
    this.id = menu.id;
    this.class = menu.class;
    this.name = menu.mane;
    this.type = menu.type;
    this.roles = menu.roles;
    this.permission = menu.permission;
    // flag to set parent as active, defaults to false
    this.setParentLinkActiveClass = menu.setParentLinkActiveClass || false;

    if (menu.submenuTemplate)
      this.submenuTemplate = menu.submenuTemplate;

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
Menu.prototype.addLink = function addLink (link){
  if (!link.weight) link.weight = 0;

  if (link.parent) {
    this._addSubLink(link);
  } else {
    this._addRootLink(link);
  }
};

/**
 * [addLinks description]
 * @param {[type]} links [description]
 */
Menu.prototype.addLinks = function addLinks (links){
  if (links) {
    for (var i = 0; i < links.length; i++) {
      this.addLink(links[i]);
    }
  }
};

/**
 * Private function to add an sublink, ex this link have one parent
 *
 * @param {Object} link
 */
Menu.prototype._addSubLink = function _addSubLink (link){
  if (!this.allLinks[link.parent])
    this.allLinks[link.parent] = { links: [] };

  if (!this.allLinks[link.parent].links[link.weight])
    this.allLinks[link.parent].links[link.weight] = {};

  this.allLinks[link.parent].links[link.weight][link.id] = link;
}

/**
 * Private function to add an root link, ex this link dont have parents
 *
 * @param {Object} link
 */
Menu.prototype._addRootLink = function _addRootLink (link){
  if (!this.links[link.weight])
    this.links[link.weight] = {};

  this.links[link.weight][link.id] = link;

  var links = [];
  if (this.allLinks[link.id])
    links = this.allLinks[link.id].links;

  link.links = links;
  this.allLinks[link.id] = link;
}

/**
 * Getter for get all link, same as menu.links
 *
 * @return {Array}
 */
Menu.prototype.getLinks = function getLinks (){
  return this.links;
}

/**
 * Get all menu links ordered by parent and weight and with updated depth
 */
Menu.prototype.getLinksList = function getLinksList (){
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
Menu.prototype.getLinkLinks = function getLinkLinks (link, links, depth){
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

Menu.prototype.removeLink = function removeLink() {
  console.log('TODO!');
};

/**
 * Render the menu
 *
 * @param  {Object} req express request
 * @return {String} menu html
 */
Menu.prototype.render = function render(req) {
  var html = '<ul class="'+(this.class || '')+'">';

  for (var i = 0; i < this.links.length; i++) {
    for(var id in this.links[i]) {
      if (this.links[i][id].links && this.links[i][id].links.length) {
        html += this.renderSubmenu(req, this.links[i][id], this);
      } else {
        html += this.renderLink(req, this.links[i][id], this);
      }
    }
  }

  html += '</ul>';

  return html;
};

/**
 * Render one menu submenu
 *
 * @param  {Object} req express request
 * @param  {Object} link
 * @param  {Object} menu
 * @return {String}
 */
Menu.prototype.renderSubmenu = function renderSubmenu(req, submenu, menu){
  var linksHTML = '';

  for (var i = 0; i < submenu.links.length; i++) {
    for(var id in submenu.links[i]) {
      if (submenu.links[i][id].links && submenu.links[i][id].links.length) {
        linksHTML += this.renderSubmenu(req, submenu.links[i][id], menu);
      } else {
        linksHTML += this.renderLink(req, submenu.links[i][id], menu);
      }
    }
  }

  return req.we.view.renderTemplate(menu.submenuTemplate, req.res.locals.theme, {
    req: req,
    menu: menu,
    active: this.linkIsActive(req, submenu),
    submenu: submenu,
    linksHTML: linksHTML
  });
}

/**
 * Render one menu link
 *
 * @param  {Object} req express request
 * @param  {Object} link
 * @param  {Object} menu
 * @return {String}
 */
Menu.prototype.renderLink = function renderLink(req, link) {
  if (!this.userCanAccessLink(req, link))
    return '';

  var html = '';
  var linkClass = (link.class||'');
  // we menu link divider feature
  if (link.dividerAfter) html += '<li class="divider"></li>';

  if (this.linkIsActive(req, link)) {
    // active link
    linkClass += ' active ';
    html += '<li class="active">';
  } else {
    // not active
    html += '<li>';
  }

  html += '<a href="'+link.href+'" ';

  this.setLinkHTMLAttrs(link, html, linkClass);

  html += '>' + link.text + '</a></li>';

  return html;
}

/**
 * Set HTML attributes, split from render link to make render link simpler
 *
 * @param {Object} link
 * @param {String} html
 * @param {String} linkClass
 */
Menu.prototype.setLinkHTMLAttrs = function setLinkHTMLAttrs(link, html, linkClass) {
  // link attrs
  if (link.title) html+= 'title="'+link.title+'" ';
  if (link.class) html+= 'class="'+linkClass+'" ';
  if (link.style) html+= 'style="'+link.style+'" ';
  if (link.target) html+= 'target="'+link.target+'" ';
  if (link.rel) html+= 'rel="'+link.rel+'" ';
}

/**
 * Check if current user can access one link
 *
 * @param  {Object} req  Express.js request
 * @param  {Object} link link
 * @return {Boolean}
 */
Menu.prototype.userCanAccessLink = function userCanAccessLink(req, link) {
  // check role permission
  if (link.role) {
    if (
      !req.userRoleNames ||
      (req.userRoleNames.indexOf(link.role) == -1)
    ) return false;
  }

  return true
}

/**
 * Check if link is activem if setParentLinkActiveClass is true will check is is parent and returns true
 *
 * @param  {Object} req  Express.js request
 * @param  {Object} link link
 * @return {Boolean}
 */
Menu.prototype.linkIsActive = function(req, link) {
  if (this.setParentLinkActiveClass) {
    return (req.urlBeforeAlias.indexOf(link.href) === 0);
  } else {
    return req.urlBeforeAlias == link.href;
  }
}

module.exports = Menu;
