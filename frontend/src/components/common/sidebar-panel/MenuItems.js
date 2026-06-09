const MenuItems = () => {
  const menuItems = [
    { id: 1, title: "Apartments" },
    { id: 2, title: "Independent Floors" },
    { id: 3, title: "Builder Floors" },
    { id: 4, title: "Commercial SCO Plots" },
    { id: 5, title: "Office Spaces" },
    { id: 6, title: "Retail Spaces" },
  ];

  return (
    <ul className="navbar-nav">
      {menuItems.map((item) => (
        <li className="nav-item" key={item.id}>
          <a className="nav-link" href="#" role="button">
            {item.title}
          </a>
        </li>
      ))}
    </ul>
  );
};

export default MenuItems;
