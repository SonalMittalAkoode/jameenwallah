"use client";
import Link from "next/link";
import Image from "next/image";
import React, { useCallback, useMemo, useState, useEffect } from "react";
import { usePathname } from "next/navigation";

const SidebarDashboard = () => {
  const pathname = usePathname();
  const [searchParams, setSearchParams] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});

  useEffect(() => {
    // `useSearchParams` triggers Next.js prerender Suspense requirements.
    // Reading from `window.location.search` keeps this component fast and build-friendly.
    setSearchParams(new URLSearchParams(window.location.search));
  }, []);

  const getActivePathname = useCallback((href) => {
    const basePath = pathname.split("?")[0];
    const isEditMode = searchParams?.get("edit");
    const isEditIdMode = searchParams?.get("editId");

    if (isEditMode && href === "/cmsadminlogin/add-category") {
      return false;
    }

    if (isEditMode && href === "/cmsadminlogin/add-property-type") {
      return false;
    }

    if (isEditMode && href === "/cmsadminlogin/add-amenity") {
      return false;
    }

    if (isEditMode && href === "/cmsadminlogin/add-broker") {
      return false;
    }

    if (isEditMode && href === "/cmsadminlogin/add-builder") {
      return false;
    }

    if (isEditIdMode && href === "/cmsadminlogin/add-state") {
      return false;
    }

    if (isEditIdMode && href === "/cmsadminlogin/add-city") {
      return false;
    }

    if (isEditIdMode && href === "/cmsadminlogin/add-area") {
      return false;
    }

    if (isEditIdMode && href === "/cmsadminlogin/add-blog-category") {
      return false;
    }

    if (isEditIdMode && href === "/cmsadminlogin/add-blog") {
      return false;
    }

    if (isEditIdMode && href === "/cmsadminlogin/add-faq") {
      return false;
    }

    if (isEditIdMode && href === "/cmsadminlogin/add-testimonial") {
      return false;
    }

    if (isEditIdMode && href === "/cmsadminlogin/add-builder") {
      return false;
    }

    return basePath === href;
  }, [pathname, searchParams]);

  const sidebarItems = useMemo(() => [
    {
      title: "MAIN",
      items: [
        {
          href: "/dashboard-home",
          icon: "flaticon-discovery",
          text: "Dashboard",
        },
      ],
    },
    {
      title: "MANAGE LISTING",
      items: [
        {
          href: "/cmsadminlogin/ai-suggestion-staging",
          icon: "flaticon-chat-1",
          text: "AI Suggestion Staging",
        },
        {
          text: "Enquiries",
          icon: "/images/dashboard/enquiry.png",
          children: [
            {
              href: "/cmsadminlogin/enquiry-list",
              icon: "flaticon-list",
              text: "Contact Enquiries",
            },
            {
              href: "/cmsadminlogin/enquiry-submissions",
              icon: "flaticon-mail",
              text: "Service Enquiries",
            },
            {
              href: "/cmsadminlogin/landing-page-enquiry-list",
              icon: "flaticon-web",
              text: "Landing Page Enquiries",
            },
            {
              href: "/cmsadminlogin/call-request-list",
              icon: "flaticon-call",
              text: "Call Requests",
            },
            {
              href: "/cmsadminlogin/tour-request-enquiry-list",
              icon: "flaticon-list-1",
              text: "Tour Requests",
            },
            {
              href: "/cmsadminlogin/property-enquiry-list",
              icon: "flaticon-home",
              text: "Property Enquiries",
            },
            {
              href: "/cmsadminlogin/agent-contact-enquiry-list",
              icon: "flaticon-user",
              text: "Agent Contact Enquiries",
            },
            {
              href: "/cmsadminlogin/banker-enquiry-list",
              icon: "flaticon-bank",
              text: "Banker Enquiries",
            },
            {
              href: "/cmsadminlogin/subscriber-list",
              icon: "flaticon-mail",
              text: "Subscribers",
            },
            {
              href: "/cmsadminlogin/partner-enquiry-list",
              icon: "flaticon-user",
              text: "Partner Enquiries",
            },
          ],
        },
        {
          text: "Category",
          icon: "/images/dashboard/category.png",
          children: [
            {
              href: "/cmsadminlogin/add-category",
              icon: "flaticon-plus",
              text: "Add Category",
            },
            {
              href: "/cmsadminlogin/category-list",
              icon: "flaticon-list",
              text: "Category List",
            },
          ],
        },
        {
          text: "Property Type",
          icon: "flaticon-home-1",
          children: [
            {
              href: "/cmsadminlogin/add-property-type",
              icon: "flaticon-plus",
              text: "Add Property Type",
            },
            {
              href: "/cmsadminlogin/property-type-list",
              icon: "flaticon-list",
              text: "Property Type List",
            },
          ],
        },
        {
          text: "Builder",
          icon: "flaticon-hotel",
          children: [
            {
              href: "/cmsadminlogin/add-builder",
              icon: "flaticon-plus",
              text: "Add Builder",
            },
            {
              href: "/cmsadminlogin/builder-list",
              icon: "flaticon-list",
              text: "Builder List",
            },
          ],
        },
        {
          text: "Architect",
          icon: "flaticon-hotel",
          children: [
            {
              href: "/cmsadminlogin/add-architect",
              icon: "flaticon-plus",
              text: "Add Architect",
            },
            {
              href: "/cmsadminlogin/architect-list",
              icon: "flaticon-list",
              text: "Architect List",
            },
          ],
        },
        {
          text: "Chartered Accountant",
          icon: "flaticon-hotel",
          children: [
            {
              href: "/cmsadminlogin/add-charteredaccountant",
              icon: "flaticon-plus",
              text: "Add Chartered Accountant",
            },
            {
              href: "/cmsadminlogin/charteredaccountant-list",
              icon: "flaticon-list",
              text: "Chartered Accountant List",
            },
          ],
        },
        {
          text: "Financer",
          icon: "flaticon-hotel",
          children: [
            {
              href: "/cmsadminlogin/add-financer",
              icon: "flaticon-plus",
              text: "Add Financer",
            },
            {
              href: "/cmsadminlogin/financer-list",
              icon: "flaticon-list",
              text: "Financer List",
            },
          ],
        },
        {
          text: "Lawyers",
          icon: "flaticon-hotel",
          children: [
            {
              href: "/cmsadminlogin/add-lawyer",
              icon: "flaticon-plus",
              text: "Add Lawyer",
            },
            {
              href: "/cmsadminlogin/lawyer-list",
              icon: "flaticon-list",
              text: "Lawyer List",
            },
          ],
        },  

        {
          text: "Location",
          icon: "flaticon-location",
          nested: [
            {
              text: "State",
              icon: "flaticon-map",
              children: [
                {
                  href: "/cmsadminlogin/add-state",
                  icon: "flaticon-plus",
                  text: "Add State",
                },
                {
                  href: "/cmsadminlogin/state-list",
                  icon: "flaticon-list",
                  text: "State List",
                },
              ],
            },
            {
              text: "City",
              icon: "flaticon-map",
              children: [
                {
                  href: "/cmsadminlogin/add-city",
                  icon: "flaticon-plus",
                  text: "Add City",
                },
                {
                  href: "/cmsadminlogin/city-list",
                  icon: "flaticon-list",
                  text: "City List",
                },
              ],
            },
            {
              text: "Area",
              icon: "flaticon-map",
              children: [
                {
                  href: "/cmsadminlogin/add-area",
                  icon: "flaticon-plus",
                  text: "Add Area",
                },
                {
                  href: "/cmsadminlogin/area-list",
                  icon: "flaticon-list",
                  text: "Area List",
                },
              ],
            },
          ],
        },
        {
          text: "Amenity",
          icon: "flaticon-home-1",
          children: [
            {
              href: "/cmsadminlogin/add-amenity",
              icon: "flaticon-plus",
              text: "Add Amenity",
            },
            {
              href: "/cmsadminlogin/amenity-list",
              icon: "flaticon-list",
              text: "Amenity List",
            },
          ],
        },
        {
          text: "Agent",
          icon: "flaticon-user",
          children: [
            {
              href: "/cmsadminlogin/add-broker",
              icon: "flaticon-add-user",
              text: "Add Agent",
            },
            {
              href: "/cmsadminlogin/all-broker",
              icon: "flaticon-users",
              text: "All Agent",
            },
          ],
        },
        {
          text: "Property",
          icon: "flaticon-home",
          children: [
            {
              href: "/cmsadminlogin/add-property",
              icon: "flaticon-new-tab",
              text: "Add Property",
            },
            {
              href: "/cmsadminlogin/my-properties",
              icon: "flaticon-list",
              text: "Property List",
            },
          ],
        },
        {
          text: "Property Page",
          icon: "flaticon-home",
          children: [
            {
              href: "/cmsadminlogin/add-property-page",
              icon: "flaticon-new-tab",
              text: "Add Property Page",
            },
            {
              href: "/cmsadminlogin/property-page-list",
              icon: "flaticon-list",
              text: "Property Page List",
            },
          ],
        },
        {
          text: "Propertymanagement",
          icon: "flaticon-hotel",
          children: [
            {
              href: "/cmsadminlogin/add-propertymanagement",
              icon: "flaticon-plus",
              text: "Add Property management",
            },
            {
              href: "/cmsadminlogin/propertymanagement-list",
              icon: "flaticon-list",
              text: "Property management List",
            },
          ],
        }, 
        {
          text: "Partner",
          icon: "flaticon-hotel",
          children: [
            {
              href: "/cmsadminlogin/add-partner",
              icon: "flaticon-plus",
              text: "Add Partner",
            },
            {
              href: "/cmsadminlogin/partner-list",
              icon: "flaticon-list",
              text: "Partner List",
            },
          ],
        }, 
        {
          text: "Team",
          icon: "flaticon-hotel",
          children: [
            {
              href: "/cmsadminlogin/add-team",
              icon: "flaticon-plus",
              text: "Add Team",
            },
            {
              href: "/cmsadminlogin/team-list",
              icon: "flaticon-list",
              text: "Team List",
            },
          ],
        }, 
        {
          text: "Blog",
          icon: "/images/dashboard/blog.png",
          children: [
            {
              href: "/cmsadminlogin/add-blog-category",
              icon: "flaticon-folder",
              text: "Add Blog Category",
            },
            {
              href: "/cmsadminlogin/blog-category-list",
              icon: "flaticon-list",
              text: "Blog Category List",
            },
            {
              href: "/cmsadminlogin/add-blog",
              icon: "flaticon-file",
              text: "Add Blog",
            },
            {
              href: "/cmsadminlogin/blog-list",
              icon: "flaticon-list-1",
              text: "Blog List",
            },
          ],
        },
        {
          text: "FAQ",
          icon: "/images/dashboard/faq.png",
          children: [
            {
              href: "/cmsadminlogin/add-faq",
              icon: "flaticon-plus",
              text: "Add FAQ",
            },
            {
              href: "/cmsadminlogin/faq-list",
              icon: "flaticon-list",
              text: "FAQ List",
            },
          ],
        },
        {
          text: "Testimonial",
          icon: "flaticon-review",
          children: [
            {
              href: "/cmsadminlogin/add-testimonial",
              icon: "flaticon-plus",
              text: "Add Testimonial",
            },
            {
              href: "/cmsadminlogin/testimonial-list",
              icon: "flaticon-list",
              text: "Testimonial List",
            },
          ],
        },
        {
          href: "/login",
          icon: "flaticon-logout",
          text: "Logout",
        },
      ],
    },

    {
      items: [],
    },
  ], []);

  useEffect(() => {
    const expanded = {};
    sidebarItems.forEach((section) => {
      section.items.forEach((item) => {
        if (item.children) {
          const hasActiveChild = item.children.some((child) =>
            getActivePathname(child.href)
          );
          if (hasActiveChild) {
            expanded[item.text] = true;
          }
        }
        if (item.nested) {
          item.nested.forEach((nestedItem) => {
            if (nestedItem.children) {
              const hasActiveChild = nestedItem.children.some((child) =>
                getActivePathname(child.href)
              );
              if (hasActiveChild) {
                expanded[item.text] = true;
                expanded[nestedItem.text] = true;
              }
            }
          });
        }
      });
    });
    setExpandedSections(expanded);
  }, [getActivePathname, sidebarItems]);

  const toggleSection = (sectionKey) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }));
  };

  const renderMenuItem = (item, itemIndex, isNested = false) => {
    if (item.children) {
      const isExpanded = expandedSections[item.text] || false;
      const hasActiveChild = item.children.some((child) =>
        getActivePathname(child.href)
      );

      return (
        <div
          key={itemIndex}
          className={`sidebar_list_item ${isNested ? "nested-item" : ""}`}
          style={{ marginBottom: "4px" }}
        >
          <div
            className={`items-center sidebar-parent ${
              hasActiveChild ? "-is-active" : ""
            } ${isExpanded ? "expanded" : ""}`}
            onClick={() => toggleSection(item.text)}
            style={{
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "16px",
              paddingTop: "12px",
              paddingBottom: "12px",
              paddingLeft: "20px",
              paddingRight: "20px",
            }}
          >
            {item.icon && item.icon.endsWith(".png") ? (
              <Image
                src={item.icon}
                alt={item.text}
                width={20}
                height={20}
                className="mr15"
                style={{ width: "20px", height: "20px", objectFit: "contain" }}
              />
            ) : (
              <i className={`${item.icon} mr15`} style={{ fontSize: "20px" }} />
            )}
            <span style={{ flex: 1 }}>{item.text}</span>
            <i
              className={`ml15 ${isExpanded ? "flaticon-up-arrow" : "flaticon-down"}`}
              style={{
                transition: "opacity 0.2s ease",
                fontSize: "14px",
              }}
            />
          </div>
          {isExpanded && (
            <div
              className="sidebar-children"
              style={{ paddingLeft: "20px", marginTop: "4px" }}
            >
              {item.children.map((child, childIndex) => (
                <div key={childIndex} className="sidebar_list_item">
                  <Link
                    href={child.href}
                    className={`items-center ${
                      getActivePathname(child.href) ? "-is-active" : ""
                    }`}
                    style={{
                      paddingLeft: "36px",
                      position: "relative",
                      paddingTop: "6px",
                      paddingBottom: "6px",
                      marginBottom: "1px",
                      fontSize: "15px",
                    }}
                  >
                    <span
                      style={{
                        position: "absolute",
                        left: "16px",
                        fontSize: "12px",
                        lineHeight: "1.6",
                      }}
                    >
                      •
                    </span>
                    <span style={{ marginLeft: "8px" }}>{child.text}</span>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (item.nested) {
      const isExpanded = expandedSections[item.text] || false;
      const hasActiveNested = item.nested.some((nestedItem) =>
        nestedItem.children?.some((child) => getActivePathname(child.href))
      );

      return (
        <div
          key={itemIndex}
          className="sidebar_list_item"
          style={{ marginBottom: "4px" }}
        >
          <div
            className={`items-center sidebar-parent ${
              hasActiveNested ? "-is-active" : ""
            } ${isExpanded ? "expanded" : ""}`}
            onClick={() => toggleSection(item.text)}
            style={{
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "16px",
              paddingTop: "12px",
              paddingBottom: "12px",
              paddingLeft: "20px",
              paddingRight: "20px",
            }}
          >
            {item.icon && item.icon.endsWith(".png") ? (
              <Image
                src={item.icon}
                alt={item.text}
                width={20}
                height={20}
                className="mr15"
                style={{ width: "20px", height: "20px", objectFit: "contain" }}
              />
            ) : (
              <i className={`${item.icon} mr15`} style={{ fontSize: "20px" }} />
            )}
            <span style={{ flex: 1 }}>{item.text}</span>
            <i
              className={`ml15 ${isExpanded ? "flaticon-up-arrow" : "flaticon-down"}`}
              style={{
                transition: "opacity 0.2s ease",
                fontSize: "14px",
              }}
            />
          </div>
          {isExpanded && (
            <div
              className="sidebar-children"
              style={{ paddingLeft: "20px", marginTop: "4px" }}
            >
              {item.nested.map((nestedItem, nestedIndex) => {
                const isNestedExpanded =
                  expandedSections[nestedItem.text] || false;
                const hasActiveChild = nestedItem.children?.some((child) =>
                  getActivePathname(child.href)
                );

                return (
                  <div key={nestedIndex} style={{ marginBottom: "4px" }}>
                    <div
                      className={`items-center sidebar-parent nested-parent ${
                        hasActiveChild ? "-is-active" : ""
                      } ${isNestedExpanded ? "expanded" : ""}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSection(nestedItem.text);
                      }}
                      style={{
                        cursor: "pointer",
                        fontWeight: "bold",
                        fontSize: "15px",
                        paddingTop: "10px",
                        paddingBottom: "10px",
                        paddingLeft: "20px",
                        paddingRight: "20px",
                      }}
                    >
                      <i
                        className={`${nestedItem.icon} mr15`}
                        style={{ fontSize: "18px" }}
                      />
                      <span style={{ flex: 1 }}>{nestedItem.text}</span>
                      <i
                        className={`ml15 ${isNestedExpanded ? "flaticon-up-arrow" : "flaticon-down"}`}
                        style={{
                          transition: "opacity 0.2s ease",
                          fontSize: "13px",
                        }}
                      />
                    </div>
                    {isNestedExpanded && nestedItem.children && (
                      <div
                        className="sidebar-children"
                        style={{ paddingLeft: "40px", marginTop: "4px" }}
                      >
                        {nestedItem.children.map((child, childIndex) => (
                          <div key={childIndex} className="sidebar_list_item">
                            <Link
                              href={child.href}
                              className={`items-center ${
                                getActivePathname(child.href)
                                  ? "-is-active"
                                  : ""
                              }`}
                              style={{
                                paddingLeft: "36px",
                                position: "relative",
                                paddingTop: "6px",
                                paddingBottom: "6px",
                                marginBottom: "1px",
                                fontSize: "15px",
                              }}
                            >
                              <span
                                style={{
                                  position: "absolute",
                                  left: "16px",
                                  fontSize: "12px",
                                  lineHeight: "1.6",
                                }}
                              >
                                •
                              </span>
                              <span style={{ marginLeft: "8px" }}>
                                {child.text}
                              </span>
                            </Link>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    return (
      <div
        key={itemIndex}
        className="sidebar_list_item"
        style={{ marginBottom: "4px" }}
      >
        <Link
          href={item.href}
          className={`items-center ${
            getActivePathname(item.href) ? "-is-active" : ""
          }`}
          style={{
            fontSize: "16px",
            paddingTop: "12px",
            paddingBottom: "12px",
            paddingLeft: "20px",
            paddingRight: "20px",
          }}
        >
          {item.icon && item.icon.endsWith(".png") ? (
            <Image
              src={item.icon}
              alt={item.text}
              width={20}
              height={20}
              className="mr15"
              style={{ width: "20px", height: "20px", objectFit: "contain" }}
            />
          ) : (
            <i className={`${item.icon} mr15`} style={{ fontSize: "20px" }} />
          )}
          {item.text}
        </Link>
      </div>
    );
  };

  return (
    <div className="dashboard__sidebar d-none d-lg-block">
      <div className="dashboard_sidebar_list">
        {sidebarItems.map((section, sectionIndex) => (
          <div
            key={sectionIndex}
            style={{ marginBottom: section.title ? "20px" : "8px" }}
          >
            {section.title && (
              <p
                className={`fz15 fw400 ff-heading ${
                  sectionIndex === 0 ? "mt-0" : "mt30"
                }`}
                style={{
                  fontSize: "14px",
                  marginBottom: "8px",
                  marginTop: sectionIndex === 0 ? "0" : "24px",
                }}
              >
                {section.title}
              </p>
            )}
            {section.items.map((item, itemIndex) =>
              renderMenuItem(item, itemIndex)
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SidebarDashboard;
