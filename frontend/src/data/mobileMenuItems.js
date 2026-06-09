module.exports = [
  {
    label: "Home",
    subMenu: [{ path: "/", label: "Home" }],
  },
  {
    label: "About Us",
    subMenu: [{ path: "/about", label: "About Us" }],
  },
  {
    label: "Blog",
    subMenu: [{ path: "/blog", label: "Blog" }],
  },
  {
    label: "Properties",
    // Sub-menu items are injected dynamically in ProSidebarContent for real categories.
    subMenu: [{ path: "/properties", label: "All Properties" }],
  },
  {
    label: "Contact Us",
    subMenu: [{ path: "/contact", label: "Contact Us" }],
  },
];
