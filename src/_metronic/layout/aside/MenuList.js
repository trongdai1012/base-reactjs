import React from "react";
import MenuSection from "./MenuSection";
import MenuItemSeparator from "./MenuItemSeparator";
import MenuItem from "./MenuItem";
import checkPermission from "../../../app/libs/permission"

export default class MenuList extends React.Component {
  render() {
    const { currentUrl, menuConfig, layoutConfig, isAdmin, level3, isCTV } = this.props;

    if(isCTV){
      return menuConfig.asideCollab.items.map((child, index) => {
        return (
          <React.Fragment key={`menuList${index}`}>
            {child.section && <MenuSection item={child} />}
            {child.separator && <MenuItemSeparator item={child} />}
            {child.title && checkPermission(child.permission) === 1 && (
              <MenuItem
                item={child}
                currentUrl={currentUrl}
                layoutConfig={layoutConfig}
              />
            )}
          </React.Fragment>
        );
      });
    }
    return menuConfig.aside.items.map((child, index) => {
      return (
        <React.Fragment key={`menuList${index}`}>
          {child.section && <MenuSection item={child} />}
          {child.separator && <MenuItemSeparator item={child} />}
          {child.title && checkPermission(child.permission) === 1 && (
            <MenuItem
              item={child}
              currentUrl={currentUrl}
              layoutConfig={layoutConfig}
              isAdmin={isAdmin}
              level3={level3}
              isCTV={isCTV}
            />
          )}
        </React.Fragment>
      );
    });
  }
}
