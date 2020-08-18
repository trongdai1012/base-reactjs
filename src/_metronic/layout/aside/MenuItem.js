import React from "react";
import objectPath from "object-path";
import { Link } from "react-router-dom";
import MenuItemText from "./MenuItemText";
import MenuSubmenu from "./MenuSubmenu";
import clsx from "clsx";
import checkPermission from "../../../app/libs/permission"

export default class MenuItem extends React.Component {
  asideLeftLIRef = React.createRef();
  isDropdown = document.body.classList.contains("kt-aside-menu--dropdown");

  submenuToggle =
    this.props.item.toggle === "click"
      ? "click"
      : objectPath.get(this.props.item, "submenu.type") === "tabs"
        ? "tabs"
        : "hover";

  /**
   * Use for fixed left aside menu, to show menu on mouseenter event.
   * @param event Event
   */
  mouseEnter = event => {
    if (!this.isDropdown) {
      return;
    }

    if (this.props.item.submenu) {
      this.asideLeftLIRef.current.classList.add("kt-menu__item--hover");
      this.asideLeftLIRef.current.setAttribute(
        "data-ktmenu-submenu-toggle",
        this.submenuToggle
      );
    }
  };

  /**
   * Mouse Leave event
   * @param event: MouseEvent
   */
  mouseLeave = event => {
    if (!this.isDropdown) {
      return;
    }

    if (this.props.item.submenu && this.submenuToggle === "hover") {
      this.asideLeftLIRef.current.classList.remove("kt-menu__item--hover");
      this.asideLeftLIRef.current.removeAttribute("data-ktmenu-submenu-toggle");
    }
  };

  isMenuItemIsActive = item => {
    if (item.submenu) {
      return this.isMenuRootItemIsActive(item);
    }

    if (!item.page) {
      return false;
    }

    return this.props.currentUrl.indexOf(item.page) !== -1;
  };

  isMenuRootItemIsActive = item => {
    for (const subItem of item.submenu) {
      if (this.isMenuItemIsActive(subItem)) {
        return true;
      }
    }

    return false;
  };

  render() {
    const { item, currentUrl, parentItem, layoutConfig, isAdmin, level3, isCTV } = this.props;
    const isActive = this.isMenuItemIsActive(item);
    
    if (item.is_distributor && isAdmin) {
      return <></>
    }

    if (item.is_admin && !isAdmin) {
      return <></>
    }

    if (item.is_level3 && level3) {
      return <></>
    }

    if (!item.is_CTV && isCTV) {
      return <></>
    }

    if (item.is_CTV && !isCTV) {
      return <></>
    }

    if (item.is_not_level3 && level3) {
      return <></>
    }

    return (
      <li
        ref={this.asideLeftLIRef}
        aria-haspopup="true"
        data-placement="right"
        data-ktmenu-submenu-mode={item.mode}
        onMouseEnter={this.mouseEnter}
        onMouseLeave={this.mouseLeave}
        className={clsx(
          "kt-menu__item",
          {
            "kt-menu__item--submenu": item.submenu,
            "kt-menu__item--open kt-menu__item--here": isActive && item.submenu,
            "kt-menu__item--active kt-menu__item--here":
              isActive && !item.submenu,
            "kt-menu__item--icon-only": item["icon-only"]
          },
          item["custom-class"]
        )}
        data-ktmenu-dropdown-toggle-class={item["dropdown-toggle-class"]}
      >
        {!item.submenu && checkPermission(item.permission) == 1 && (
          <Link to={`/${item.page}`} className="kt-menu__link kt-menu__toggle">
            <MenuItemText item={item} parentItem={parentItem} />
          </Link>
        )}

        {item.submenu && checkPermission(item.permission) == 1 && (
          // eslint-disable-next-line jsx-a11y/anchor-is-valid
          <a className="kt-menu__link kt-menu__toggle">
            <MenuItemText item={item} parentItem={parentItem} />
          </a>
        )}

        {item.submenu && checkPermission(item.permission) == 1 && (
          <div className="kt-menu__submenu">
            <span className="kt-menu__arrow" />

            {item["custom-class"] === "kt-menu__item--submenu-fullheight" && (
              <div className="kt-menu__wrapper">
                <MenuSubmenu
                  item={item}
                  parentItem={item}
                  currentUrl={currentUrl}
                  isAdmin={isAdmin}
                  level3={level3}
                />
              </div>
            )}

            {item["custom-class"] !== "kt-menu__item--submenu-fullheight" && (
              <MenuSubmenu
                item={item}
                parentItem={item}
                currentUrl={currentUrl}
                layoutConfig={layoutConfig}
                isAdmin={isAdmin}
                level3={level3}
              />
            )}
          </div>
        )}
      </li>
    );
  }
}
