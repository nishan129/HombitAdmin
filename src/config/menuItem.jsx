import CuponPageOutlet from "@/pages/dashbord/cupon/CuponPageOutlet";
import Cupons from "@/pages/dashbord/cupon/Cupons";
import NewCupon from "@/pages/dashbord/cupon/NewCupon";
import Categories from "@/pages/dashbord/categories/Categories";
import CategoryPageOutlet from "@/pages/dashbord/categories/CategoryPageOutlet";
import NewCategory from "@/pages/dashbord/categories/NewCategory";
import DashboardOverview from "@/pages/dashbord/DashboardOverview";
import OrderDetail from "@/pages/dashbord/orders/OrderDetail";
import OrderPageOutlet from "@/pages/dashbord/orders/OrderPageOutlet";
import Orders from "@/pages/dashbord/orders/Orders";
import NewProduct from "@/pages/dashbord/products/NewProduct";
import ProductPageOutlet from "@/pages/dashbord/products/ProductPageOutlet";
import Products from "@/pages/dashbord/products/Products";
import NewScheme from "@/pages/dashbord/products/schemes/NewScheme";
import Schemes from "@/pages/dashbord/products/schemes/Schemes";
// import NewSubCategory from "@/pages/dashbord/subcategories/NewSubCategory";
// import SubCategories from "@/pages/dashbord/subcategories/SubCategories";
// import SubCategoryPageOutlet from "@/pages/dashbord/subcategories/SubCategoryPageOutlet";
import Units from "@/pages/dashbord/units/Units";
import {
  Boxes,
  LayoutGrid,
  LayoutList,
  MonitorPlay,

  Combine,
  BookA,
} from "lucide-react";


const menuItems = [
  // Dashboard
  {
    name: "Dashboard",
    href: "/dashboard",
    component: <DashboardOverview />,
    icon: LayoutGrid,
  },
  // Categories
  {
    name: "Categories",
    href: "/dashboard/categories",
    component: <CategoryPageOutlet />,
    icon: LayoutList,
    subMenuItems: [
      {
        name: "Categories",
        href: "/dashboard/categories",
        component: <Categories />,
      },
      {
        name: "New Category",
        href: "new",
        component: <NewCategory />,
      },
      {
        name: "New Bulk Categories",
        href: "newmany",
        component: <h1>new bulk categories</h1>,
      },
    ],
  },
  // // Sub Categories
  // {
  //   name: "Sub Categories",
  //   href: "/dashboard/subcategories",
  //   component: <SubCategoryPageOutlet />,
  //   icon: SquareStack,
  //   subMenuItems: [
  //     {
  //       name: "Sub Categories",
  //       href: "/dashboard/subcategories",
  //       component: <SubCategories />,
  //     },
  //     {
  //       name: "New Sub Category",
  //       href: "new",
  //       component: <NewSubCategory />,
  //     },
  //     {
  //       name: "New Bulk Categories",
  //       href: "newmany",
  //       component: <h1>new bulk subcategories</h1>,
  //     },
  //   ],
  // },
  // Products
  {
    name: "Products",
    href: "/dashboard/products",
    component: <ProductPageOutlet />,
    icon: Boxes,
    subMenuItems: [
      {
        name: "Products",
        href: "/dashboard/products",
        component: <Products />,
      },
      {
        name: "New Product",
        href: "new",
        component: <NewProduct />,
      },
      {
        name: "New Bulk Product",
        href: "newmany",
        component: <h1>new bulk product</h1>,
      },
      {
        name: "Product Schemes",
        href: ":productSlug/schemes",
        component: <Schemes />,
      },
      {
        name: "Product new Scheme",
        href: ":productSlug/schemes/new",
        component: <NewScheme />,
      },
    ],
  },
  // Cupons
  {
    name: "Coupons",
    href: "/dashboard/cupons",
    component: <CuponPageOutlet />,
    icon: MonitorPlay,
    subMenuItems: [
      {
        name: "Store Coupon",
        href: "/dashboard/cupons",
        component: <Cupons />,
      },
      {
        name: "New Cupon",
        href: "new",
        component: <NewCupon />,
      },
      {
        name: "New Bulk Coupon",
        href: "newmany",
        component: <h1>new bulk banner</h1>,
      },
    ],
  },
  // Units
  {
    name: "Workers",
    href: "/dashboard/units",
    component: <Units />,
    icon: Combine,
  },
  // Orders
  {
    name: "Orders",
    href: "/dashboard/orders",
    component: <OrderPageOutlet />,
    icon: BookA,
    subMenuItems: [
      {
        name: "Orders",
        href: "/dashboard/orders",
        component: <Orders />,
      },
      {
        name: "Order Detail",
        href: ":orderId",
        component: <OrderDetail />,
      },
    ],
  },
];

export default menuItems;
