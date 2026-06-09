import mobileMenuItems from "@/data/mobileMenuItems";
import { isParentActive } from "@/utilis/isMenuActive";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { getActiveCategories } from "@/api/category";

import { Sidebar, Menu, MenuItem, SubMenu } from "react-pro-sidebar";
import { useEffect, useMemo, useState } from "react";

const ProSidebarContent = () => {
  const path = usePathname();

  const [categories, setCategories] = useState([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await getActiveCategories();
        if (!cancelled) setCategories(res?.data ?? []);
      } catch {
        if (!cancelled) setCategories([]);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const propertiesSubMenu = useMemo(() => {
    const dynamic = (categories || []).map((c) => {
      const key = c?.slug || c?.name;
      return {
        path: `/properties/${encodeURIComponent(key)}`,
        label: c?.name,
      };
    });
    return dynamic;
  }, [categories]);

  const stripQuery = (p) => String(p || "").split("?")[0].split("#")[0];
  const isActivePath = (href) => stripQuery(href) === stripQuery(path);

  return (
    <Sidebar width="100%" backgroundColor="#fff" className="my-custom-class">
      <Menu>
        {mobileMenuItems.map((item, index) => {
          if (item.label === "Properties") {
            return (
              <SubMenu
                key={index}
                className={isParentActive(propertiesSubMenu, path) ? "active" : ""}
                label={item.label}
              >
                {propertiesSubMenu.map((subItem) => (
                  <MenuItem
                    key={subItem.path}
                    component={
                      <Link
                        className={isActivePath(subItem.path) ? "active" : ""}
                        href={subItem.path}
                      />
                    }
                  >
                    {subItem.label}
                  </MenuItem>
                ))}
              </SubMenu>
            );
          }

          const first = item?.subMenu?.[0];
          if (!first) return null;

          return (
            <MenuItem
              key={index}
              component={
                <Link
                  className={isActivePath(first.path) ? "active" : ""}
                  href={first.path}
                />
              }
            >
              {first.label || item.label}
            </MenuItem>
          );
        })}
      </Menu>
    </Sidebar>
  );
};

export default ProSidebarContent;
