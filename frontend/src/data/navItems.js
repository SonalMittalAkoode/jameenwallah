export const homeItems = [{ href: "/", label: "Home" }];

export const listingItems = [
  {
    title: "Properties",
    submenu: [{ label: "All Properties", href: "/properties" }],
  },
];

export const propertyItems = [
  {
    label: "Agents",
    subMenuItems: [
      { label: "Agents", href: "/agents" },
      { label: "Agent Single", href: "/agent/1" },
      { label: "Agency", href: "/agency" },
      { label: "Agency Single", href: "/agency-single/1" },
    ],
  },

  {
    label: "Single Style",
    subMenuItems: [{ label: "Single Style", href: "/properties" }],
  },
  {
    label: "Dashboard",
    subMenuItems: [
      { label: "Dashboard Home", href: "/dashboard-home" },
      { label: "Message", href: "/dashboard-message" },
      { label: "New Property", href: "/dashboard-add-property" },
      { label: "My Properties", href: "/dashboard-my-properties" },
      { label: "My Favorites", href: "/dashboard-my-favourites" },
      { label: "Saved Search", href: "/dashboard-saved-search" },
      { label: "My Package", href: "/dashboard-my-package" },
      { label: "My Profile", href: "/dashboard-my-profile" },
    ],
  },
];

export const blogItems = [
  { href: "/blog", label: "Blog" },
];

export const pageItems = [
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/compare", label: "Compare" },
  { href: "/not-found", label: "404" },
];
