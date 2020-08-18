import React from "react";
import MenuSection from "./MenuSection";
import MenuItemSeparator from "./MenuItemSeparator";
import MenuItem from "./MenuItem";
import checkPermission from "../../../app/libs/permission"

export default class MenuSubmenu extends React.Component {
  render() {
    const { item, currentUrl, layoutConfig, isAdmin, level3 } = this.props;
    return (
      <ul className="kt-menu__subnav">
        {item.submenu.map((child, index) => (
          <React.Fragment key={`submenu-${index}`}>
            {child.section && checkPermission(child.permission) === 1 && (
              <MenuSection
                item={child}
                parentItem={item}
                currentUrl={currentUrl}
              />
            )}

            {child.separator && checkPermission(child.permission) === 1 && (
              <MenuItemSeparator
                item={child}
                parentItem={item}
                currentUrl={currentUrl}
              />
            )}

            {child.title && checkPermission(child.permission) === 1 && (
              <MenuItem
                item={child}
                parentItem={item}
                currentUrl={currentUrl}
                layoutConfig={layoutConfig}
                isAdmin={isAdmin}
                level3={level3}
              />
            )}
          </React.Fragment>
        ))}
      </ul>
    );
  }
}
