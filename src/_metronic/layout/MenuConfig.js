export default {
  header: {
    self: {},
    items: [
      {
        title: "Dashboards",
        root: true,
        alignment: "left",
        page: "dashboard",
        permission: "dashboards",
        translate: "MENU.DASHBOARD"
      },
      {
        title: "Phân quyền",
        root: true,
        alignment: "left",
        toggle: "click",
        permission: "get-manager",
        submenu: {
          type: "mega",
          width: "800px",
          alignment: "left",
          columns: [
            {
              items: [
                {
                  title: "Danh sách quản trị",
                  page: "permissions/list",
                  permission: "get-all-user-cms",
                },
                {
                  title: "Thêm quản trị",
                  page: "permissions/add",
                  permission: "create-user-cms",
                },
                {
                  title: "Danh sách quyền",
                  page: "permissions/roles",
                  permission: "get-all-role",
                }
              ]
            }
          ]
        }
      },
      {
        title: "Nhà phân phối",
        root: true,
        alignment: "left",
        toggle: "click",
        permission: "get-all-user",
        is_level3: true,
        submenu: {
          type: "mega",
          width: "800px",
          alignment: "left",
          columns: [
            {
              items: [
                {
                  title: "Danh sách",
                  page: "distributor/list",
                  permission: "get-distributor",
                },
                {
                  title: "Tạo nhà phân phối",
                  page: "distributor/add",
                  permission: "add-distributor",
                },
                {
                  title: "TOP",
                  page: "distributor/top",
                  is_admin: true,
                  permission: "top-distributor"
                }
              ]
            }
          ]
        }
      },
      {
        title: "Đơn hàng",
        root: true,
        alignment: "left",
        toggle: "click",
        permission: "get-all-order",
        submenu: {
          type: "mega",
          width: "800px",
          alignment: "left",
          columns: [
            {
              items: [
                {
                  title: "Danh sách đơn hàng lẻ",
                  page: "ListOrder",
                  permission: "get-orders",
                },
                {
                  title: "Danh sách đơn hàng sỉ",
                  page: "wholeSale",
                  permission: "get-orders",
                },
                {
                  title: "Đơn hàng mua sỉ",
                  page: "wholeBuySale",
                  permission: "get-orders",
                  is_distributor: true,
                },
                {
                  title: "Tạo đơn hàng",
                  page: "order/add",
                  permission: "add-order",
                },
                {
                  title: "Tặng key 1 tháng",
                  page: "order/send-trial",
                  permission: "add-order",
                  is_admin: true
                }
              ]
            }
          ]
        }
      },
      {
        title: "Dùng thử",
        root: true,
        alignment: "left",
        toggle: "click",
        permission: "get-all-order-trial",
        page: "order-trial"
      },
      {
        title: "Khách hàng",
        root: true,
        alignment: "left",
        toggle: "click",
        permission: "get-all-user",
        page: "customers",
        is_distributor: true
      },
      {
        title: "Link phân phối",
        root: true,
        alignment: "left",
        page: "link",
        permission: "dashboards",
        is_distributor: true
      },
      {
        title: "Thông tin thanh toán",
        root: true,
        alignment: "left",
        toggle: "click",
        permission: "get-all-bank",
        is_distributor: true,
        submenu: {
          type: "mega",
          width: "800px",
          alignment: "left",
          columns: [
            {
              items: [
                {
                  title: "Tài khoản ngân hàng",
                  page: "bank/info",
                  permission: "get-all-bank",
                },
                {
                  title: "Gem QR",
                  page: "bank/gem",
                  permission: "create-bank",
                }
              ]
            }
          ]
        }
      },

      {
        title: "Quản lý key",
        root: true,
        alignment: "left",
        toggle: "click",
        permission: "get-key",
        page: "keyManage"
      },
      // {
      //   title: "Quản lý đổi key",
      //   root: true,
      //   alignment: "left",
      //   toggle: "click",
      //   permission: "get-all-exchange-key",
      //   page: "exchange-key"
      // },


      {
        title: "Báo cáo",
        root: true,
        alignment: "left",
        toggle: "click",
        permission: "get-report",
        page: "report/system"
      },
      {
        title: "Công cụ",
        root: true,
        bullet: "dot",
        icon: "flaticon-cogwheel-2",
        is_admin: true,
        permission: "get-all-video-training",
        submenu: {
          type: "mega",
          width: "800px",
          alignment: "left",
          columns: [
            {
              items: [
                {
                  title: "Xem tài khoản NPP",
                  page: "tools/viewDistributor",
                  permission: "get-all-video-training",
                }
              ]
            }
          ]
        }
      },
      {
        title: "Thông báo",
        root: true,
        alignment: "left",
        toggle: "click",
        permission: "get-all-notify",
        is_admin: true,
        submenu: {
          type: "mega",
          width: "800px",
          alignment: "left",
          columns: [
            {
              items: [
                {
                  title: "Danh sách",
                  page: "notify",
                  permission: "get-all-notify",
                },
                {
                  title: "Tạo thông báo",
                  page: "notify/create",
                  permission: "create-notify",
                }
              ]
            }
          ]
        }
      },
      {
        title: "Training",
        root: true,
        alignment: "left",
        toggle: "click",
        permission: "get-all-video-training",
        submenu: {
          type: "mega",
          width: "800px",
          alignment: "left",
          columns: [
            {
              items: [
                {
                  title: "Video",
                  page: "training/video",
                  permission: "get-all-video-training",
                },
                {
                  title: "Tài liệu",
                  page: "training/document",
                  permission: "get-all-docs-training",
                }
              ]
            }
          ]
        }
      }
    ]
  },
  aside: {
    self: {},
    items: [
      {
        title: "Dashboard",
        root: true,
        icon: "flaticon2-architecture-and-city",
        page: "dashboard",
        translate: "MENU.DASHBOARD",
        permission: "get-dashboard",
        bullet: "dot"
      },
      {
        title: "Phân quyền",
        root: true,
        bullet: "dot",
        icon: "flaticon2-user",
        permission: "get-manager",
        submenu: [
          {
            title: "Danh sách quản trị",
            page: "permissions/list",
            permission: "get-manager",
          },
          {
            title: "Thêm quản trị",
            page: "permissions/add",
            permission: "add-manager",
          },
          {
            title: "Danh sách quyền",
            page: "permissions/roles",
            permission: "update-role",
          }
        ]
      },
      {
        title: "Nhà phân phối",
        root: true,
        bullet: "dot",
        icon: "flaticon2-group",
        permission: "get-distributor",
        submenu: [
          {
            title: "Danh sách",
            page: "distributor/list",
            permission: "get-distributor",
            is_level3: true
          },
          {
            title: "Tạo nhà phân phối",
            page: "distributor/add",
            permission: "add-distributor",
            is_level3: true
          },
          {
            title: "Giới thiệu nhà phân phối",
            page: "distributor/intro-distributor",
            permission: "intro-distributor",
            is_distributor: true
          },
          {
            title: "Danh sách tiềm năng",
            page: "distributor/potential",
            permission: "get-potential"
          },
          {
            title: "Danh sách giới thiệu",
            page: "distributor/all-intro",
            permission: "get-intro-distri",
          },
          {
            title: "TOP",
            page: "distributor/top",
            is_admin: true,
            permission: "top-distributor",
          }
        ]
      },
      {
        title: "Cộng tác viên",
        root: true,
        bullet: "dot",
        icon: "flaticon-share",
        permission: "get-collaborators",
        is_distributor: true,
        submenu: [
          {
            title: "Danh sách cộng tác viên",
            page: "collaborators/list",
            permission: "get-collaborators"
          },
          {
            title: "Thêm cộng tác viên",
            page: "collaborators/add",
            permission: "add-collaborators"
          },
          {
            title: "Đơn hàng CTV",
            page: "order/collab-order",
            permission: "get-collab-order"
          },
          // {
          //   title: "Thông báo cộng tác viên",
          //   page: "collaborator/notification",
          //   permission: "get-collab-order"
          // }
        ]
      },
      {
        title: "Đơn hàng",
        root: true,
        bullet: "dot",
        icon: "flaticon2-shopping-cart-1",
        permission: "get-orders",
        submenu: [
          {
            title: "Danh sách đơn hàng lẻ",
            page: "order/list-single",
            permission: "get-order-single",
          },
          {
            title: "Danh sách đơn hàng sỉ",
            page: "order/list-wholeSale",
            permission: "get-order-wholesale",
          },
          {
            title: "Tạo đơn hàng bán lẻ",
            page: "order/single-add",
            permission: "add-order-single"
          },
          {
            title: "Tạo đơn hàng sỉ",
            page: "order/createSale",
            permission: "add-order-wholesale",
            is_admin: true,
          },
          {
            title: "Đơn hàng mua sỉ",
            page: "order/wholeBuySale",
            permission: "get-order-buy-wholesale",
            is_distributor: true
          },
          {
            title: "Đơn hàng giới thiệu",
            page: "order/intro-order",
            permission: "get-orders"
          },
          {
            title: "Tạo đơn hàng mua sỉ",
            page: "order/wholeSale-add",
            permission: "add-order-buy-wholesale",
            is_distributor: true
          },
          {
            title: "Tặng key 1 tháng",
            page: "order/send-trial",
            permission: "add-order-trial",
            is_level3: true
          }
        ]
      },
      {
        title: "Dùng thử",
        root: true,
        bullet: "dot",
        icon: "flaticon2-shopping-cart",
        permission: "get-order-trial",
        page: "order-trial"
      },
      {
        title: "Khách hàng",
        root: true,
        bullet: "dot",
        icon: "flaticon-customer",
        permission: "get-customer",
        page: "customers",
        is_distributor: true
      },
      {
        title: "Link phân phối",
        root: true,
        icon: "flaticon2-architecture-and-city",
        page: "link",
        permission: "get-link-distri",
        bullet: "dot",
        is_distributor: true
      },
      {
        title: "Thông tin thanh toán",
        root: true,
        bullet: "dot",
        icon: "flaticon-car",
        permission: "pay-info",
        is_distributor: true,
        submenu: [
          {
            title: "Tài khoản ngân hàng",
            page: "bank/info",
            permission: "get-bank",
          },
          {
            title: "Gem QR",
            page: "bank/gem",
            permission: "get-gem-qr",
          }
        ]
      },

      {
        title: "Quản lý key",
        root: true,
        bullet: "dot",
        icon: "flaticon2-layers-1",
        permission: "get-key",
        page: "keyManage"
      },
      {
        title: "Yêu cầu đổi key cấp dưới",
        root: true,
        bullet: "dot",
        icon: "flaticon2-refresh",
        permission: "get-all-exchange-key",
        page: "exchange-key",
        is_level3: true
      },
      {
        title: "Quản lý mã giảm giá",
        root: true,
        bullet: "dot",
        icon: "flaticon-gift",
        permission: "gift-card",
        submenu: [
          {
            title: "Danh sách chiến dịch",
            page: "gift-card/list-campaign",
            permission: "get-campaigns",
            is_admin: true
          },
          {
            title: "Danh sách phiếu giảm giá",
            page: "gift-card/all-coupons",
            permission: "get-coupons",
            is_distributor: true
          },
          {
            title: "Phân phối mã giảm giá",
            page: "gift-card/donate-coupons",
            permission: "donate-coupons",
            is_admin: true
          },
          {
            title: "Tạo chiến dịch",
            page: "gift-card/add-campaign",
            permission: "add-campaign",
            is_admin: true
          },
          {
            title: "Phân phối mã giảm giá",
            page: "gift-card/give-coupons",
            permission: "give-coupons",
            is_distributor: true,
            is_not_level3: true
          }
        ]
      },
      {
        title: "Báo cáo",
        root: true,
        bullet: "dot",
        icon: "flaticon2-graph-2",
        permission: "get-report",
        page: "report/system"
      },
      {
        title: "Thông báo",
        root: true,
        bullet: "dot",
        icon: "flaticon2-notification",
        permission: "get-distri-notify",
        page: "notify/distributor"
      },
      {
        title: "Công cụ",
        root: true,
        bullet: "dot",
        icon: "flaticon-cogwheel-2",
        permission: "get-manager",
        is_admin: true,
        submenu: [
          {
            title: "Xem tài khoản NPP",
            page: "tools/viewDistributor",
            permission: "tool-switch",
          }
        ]
      },
      {
        title: "Quản lý thông báo",
        root: true,
        bullet: "dot",
        icon: "flaticon-alert",
        permission: "get-notify",
        is_admin: true,
        submenu: [
          {
            title: "Danh sách thông báo",
            page: "notify/list",
            permission: "get-notify",
          },
          {
            title: "Tạo thông báo",
            page: "notify/create",
            permission: "add-notify",
          }
        ]
      },
      {
        title: "Quản lý thông báo CTV",
        root: true,
        bullet: "dot",
        icon: "flaticon-bell",
        permission: "get-notify",
        is_admin: true,
        submenu: [
          {
            title: "Danh sách thông báo",
            page: "notifycollab/list",
            permission: "get-notify",
          },
          {
            title: "Tạo thông báo",
            page: "notifycollab/create",
            permission: "add-notify",
          }
        ]
      },
      {
        title: "Training",
        root: true,
        bullet: "dot",
        icon: "flaticon2-writing",
        permission: "get-training",
        submenu: [
          {
            title: "Video",
            page: "training/video",
            permission: "get-training",
          },
          {
            title: "Tài liệu",
            page: "training/document",
            permission: "get-training",
          },
        ]
      },
      // {
      //   title: "CSKH",
      //   root: true,
      //   bullet: "dot",
      //   icon: "flaticon-support",
      //   permission: "get-orders",
      //   is_admin: true,
      //   submenu: [
      //     {
      //       title: "Gửi mail",
      //       page: "support-customer/create",
      //       permission: "created-mail-cskh",
      //     }
      //   ]
      // }
    ]
  },
  asideCollab: {
    self: {},
    items: [{
      title: "Dashboard",
      root: true,
      bullet: "dot",
      icon: "flaticon2-architecture-and-city",
      permission: "collab-permission",
      page: "dashboard"
    }, {
      title: "Đơn hàng",
      root: true,
      bullet: "dot",
      icon: "flaticon2-shopping-cart-1",
      permission: "collab-permission",
      page: "collaborator/order"
    },
    {
      title: "Khách hàng",
      root: true,
      bullet: "dot",
      icon: "flaticon-customer",
      permission: "collab-permission",
      page: "collaborator/customer"
    },
    {
      title: "Link phân phối",
      root: true,
      bullet: "dot",
      icon: "flaticon2-architecture-and-city",
      permission: "collab-permission",
      page: "collaborator/link"
    },
    {
        title: "Thông báo",
        root: true,
        bullet: "dot",
        icon: "flaticon2-notification",
        permission: "collab-permission",
        page: "collaborator/notification"
      },
    {
      title: "Training",
      root: true,
      bullet: "dot",
      icon: "flaticon2-writing",
      permission: "collab-permission",
      submenu: [
        {
          title: "Video",
          page: "training/video",
          permission: "collab-permission",
        },
        {
          title: "Tài liệu",
          page: "training/document",
          permission: "collab-permission",
        },
      ]
    }
    ]
  }
  
};
