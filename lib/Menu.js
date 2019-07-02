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
    if (menu.id) this.id = menu.id;
    if (menu.class) this.class = menu.class;
    if (menu.liClass) this.liClass = menu.liClass;
    if (menu.aClass) this.aClass = menu.aClass;
    if (menu.mane) this.name = menu.mane;
    if (menu.type) this.type = menu.type;
    if (menu.liTag) this.liTag = menu.liTag;

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

Menu.prototype = {
  class: '',
  liClass: '',
  aClass: '',
  lTag: 'ul',
  liTag: 'li',

  /**
   * Add one link in this menu and sort it baset in parent and weight attrs
   *
   * @param {Object} link
   */
  addLink(link) {
    if (!link.weight) link.weight = 0;

    if (link.parent) {
      this._addSubLink(link);
    } else {
      this._addRootLink(link);
    }
  },

  /**
   * [addLinks description]
   * @param {[type]} links [description]
   */
  addLinks(links) {
    if (links) {
      for (let i = 0; i < links.length; i++) {
        this.addLink(links[i]);
      }
    }
  },
  /**
   * Private function to add an sublink, ex this link have one parent
   *
   * @param {Object} link
   */
  _addSubLink(link) {
    if (!this.allLinks[link.parent])
      this.allLinks[link.parent] = { links: [] };

    if (!this.allLinks[link.parent].links[link.weight])
      this.allLinks[link.parent].links[link.weight] = {};

    this.allLinks[link.parent].links[link.weight][link.id] = link;
  },
  /**
   * Private function to add an root link, ex this link dont have parents
   *
   * @param {Object} link
   */
  _addRootLink(link) {
    if (!this.links[link.weight])
      this.links[link.weight] = {};

    this.links[link.weight][link.id] = link;

    let links = [];
    if (this.allLinks[link.id])
      links = this.allLinks[link.id].links;

    link.links = links;
    this.allLinks[link.id] = link;
  },

  /**
   * Getter for get all link, same as menu.links
   *
   * @return {Array}
   */
  getLinks() {
    return this.links;
  },

  /**
   * Get all menu links ordered by parent and weight and with updated depth
   */
  getLinksList() {
    const links = [];

    this.getLinkLinks(this, links, 0);

    return links;
  },

  /**
   * get links insede one link do getLinksList
   * @param  {Object} link  link record
   * @param  {Array} links links list
   * @param  {Number} depth  depth number
   */
  getLinkLinks(link, links, depth) {
    if (link.links) {
      for (let i = 0; i < link.links.length; i++) {
        if (!link.links[i]) continue;

        for (let id in link.links[i]) {
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
  },
  removeLink() {
    console.log('TODO!');
  },

  /**
   * Render the menu
   *
   * @param  {Object} req express request
   * @return {String} menu html
   */
  render(req, opts) {
    if (!opts) opts = {};

    let html = '<'+this.lTag+' class="'+(this.class || '')+' '+(opts.class || '')+'">';

    for (let i = 0; i < this.links.length; i++) {
      for(let id in this.links[i]) {
        if (this.links[i][id].links && this.links[i][id].links.length) {
          html += this.renderSubmenu(req, this.links[i][id], this);
        } else {
          html += this.renderItemAndLink(req, this.links[i][id], this);
        }
      }
    }

    html += '</'+this.lTag+'>';

    return html;
  },

  /**
   * Render one menu submenu
   *
   * @param  {Object} req express request
   * @param  {Object} link
   * @param  {Object} menu
   * @return {String}
   */
  renderSubmenu(req, submenu, menu){
    let linksHTML = '';

    for (let i = 0; i < submenu.links.length; i++) {
      for(let id in submenu.links[i]) {
        if (submenu.links[i][id].links && submenu.links[i][id].links.length) {
          linksHTML += this.renderSubmenu(req, submenu.links[i][id], menu);
        } else {
          linksHTML += this.renderItemAndLink(req, submenu.links[i][id], menu);
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
  },

  /**
   * Render one menu link
   *
   * Link = a html tag
   *
   * @param  {Object} req express request
   * @param  {Object} link
   * @param  {Object} menu
   * @return {String}
   */
  renderLink(req, link) {
    if (!this.userCanAccessLink(req, link))
      return '';

    let html = '';
    let linkClass = (link.class||'');
    // we menu link divider feature
    if (link.dividerAfter) html += '<'+this.liTag+' class="divider"></'+this.liTag+'>';

    if (this.linkIsActive(req, link)) {
      // active link
      linkClass += ' active ';
    }

    html += '<a href="'+link.href+'" ';
    html += this.setLinkHTMLAttrs(link, html , linkClass);
    html += '>' + link.text + '</a>';

    return html;
  },

  /**
   * Render one menu item
   *
   * Item = li html tag
   *
   * @param  {Object} req express request
   * @param  {Object} link
   * @param  {Object} menu
   * @param  {String} linkHTML link in html format
   * @return {String}
   */
  renderListItem(req, link, menu, linkHTML) {
    // list item tag is disabled:
    if (!this.liTag) return linkHTML;

    let html = '';

    if (this.linkIsActive(req, link)) {
      html += '<'+this.liTag+' class="'+this.liClass+' active">';
    } else {
      // not active
      html += '<'+this.liTag+'  class="'+this.liClass+'">';
    }

    html += linkHTML + '</'+this.liTag+'>';

    return html;
  },

  /**
   * Render one menu link and item
   *
   * Link = a html tag
   * Item = li html tag
   *
   * @param  {Object} req express request
   * @param  {Object} link
   * @param  {Object} menu
   * @return {String}
   */
  renderItemAndLink(req, link, menu) {
    let linkHTML = this.renderLink(req, link, menu);
    return this.renderListItem(req, link, menu, linkHTML);
  },

  /**
   * Set HTML attributes, split from render link to make render link simpler
   *
   * @param {Object} link
   * @param {String} html
   * @param {String} linkClass
   */
  setLinkHTMLAttrs(link, html, linkClass) {
    let attrs = '';
    // link attrs
    if (link.title) attrs+= 'title="'+link.title+'" ';

    attrs+= 'class="'+this.aClass;
    if (linkClass) attrs+= ' '+linkClass;
    attrs+= '" ';

    if (link.style) attrs+= 'style="'+link.style+'" ';
    if (link.target) attrs+= 'target="'+link.target+'" ';
    if (link.rel) attrs+= 'rel="'+link.rel+'" ';

    return attrs;
  },

  /**
   * Check if current user can access one link
   *
   * @param  {Object} req  Express.js request
   * @param  {Object} link link
   * @return {Boolean}
   */
  userCanAccessLink(req, link) {
    if (!link.role && link.userRole) {
      link.role =link.userRole;
    }

    // check role permission
    if (link.role) {
      if (
        !req.userRoleNames ||
        (req.userRoleNames.indexOf(link.role) == -1)
      ) return false;
    }

    return true;
  },

  /**
   * Check if link is activem if setParentLinkActiveClass is true will check is is parent and returns true
   *
   * @param  {Object} req  Express.js request
   * @param  {Object} link link
   * @return {Boolean}
   */
  linkIsActive(req, link) {
    if (this.setParentLinkActiveClass) {
      return (req.urlBeforeAlias.indexOf(link.href) === 0);
    } else {
      return req.urlBeforeAlias == link.href;
    }
  }
};

module.exports = Menu;
