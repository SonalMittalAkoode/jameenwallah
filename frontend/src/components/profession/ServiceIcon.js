const defaultFallbackIcons = [
  "fas fa-hand-holding-usd",
  "fas fa-chart-line",
  "fas fa-file-invoice-dollar",
  "fas fa-piggy-bank",
  "fas fa-shield-alt",
  "fas fa-redo-alt",
];

const iconPaths = {
  "fa-hand-holding-usd": (
    <>
      <path d="M5 19h4.5l4.1 2.2c.9.5 2 .5 2.9.1L29 16.2a2.4 2.4 0 0 0-2-4.4l-8.4 3.1" />
      <path d="M5 12h7.2c1.2 0 2.4.4 3.3 1.2l2 1.7c1 .8 1.1 2.3.2 3.2-.7.7-1.8.9-2.7.4l-3.4-1.9" />
      <path d="M24 5v6" />
      <path d="M21.5 6.5c.8-1 2.4-1.4 3.7-.8 1.1.5 1.8 1.8 1.1 2.8-.5.8-1.5 1-2.5 1.2-1 .2-2 .4-2.4 1.2" />
    </>
  ),
  "fa-home": (
    <>
      <path d="M5 17 18 6l13 11" />
      <path d="M9 15.5V29h18V15.5" />
      <path d="M14 29v-8h8v8" />
    </>
  ),
  "fa-building": (
    <>
      <path d="M9 29V7h18v22" />
      <path d="M13 11h3M20 11h3M13 16h3M20 16h3M13 21h3M20 21h3" />
      <path d="M6 29h24" />
    </>
  ),
  "fa-globe-asia": (
    <>
      <circle cx="18" cy="18" r="12" />
      <path d="M6 18h24M18 6c3.2 3.4 4.8 7.4 4.8 12S21.2 26.6 18 30c-3.2-3.4-4.8-7.4-4.8-12S14.8 9.4 18 6Z" />
    </>
  ),
  "fa-chart-line": (
    <>
      <path d="M6 28h24" />
      <path d="M8 25 15 18l5 4 8-11" />
      <path d="M24 11h4v4" />
    </>
  ),
  "fa-shield-alt": (
    <>
      <path d="M18 5 7 9v7.5c0 6.2 4.3 10.7 11 13.5 6.7-2.8 11-7.3 11-13.5V9L18 5Z" />
      <path d="m13 18 3 3 7-8" />
    </>
  ),
  "fa-drafting-compass": (
    <>
      <path d="M18 5v7" />
      <path d="m13 30 5-18 5 18" />
      <path d="M10 26h16" />
      <circle cx="18" cy="12" r="3" />
    </>
  ),
  "fa-couch": (
    <>
      <path d="M9 19v-4a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v4" />
      <path d="M7 18a3 3 0 0 0-3 3v5h28v-5a3 3 0 0 0-3-3" />
      <path d="M9 26v4M27 26v4" />
    </>
  ),
  "fa-cubes": (
    <>
      <path d="m18 5 8 4.5v9L18 23l-8-4.5v-9L18 5Z" />
      <path d="m10 9.5 8 4.5 8-4.5M18 14v9" />
      <path d="m9 22-4 2.2 8 4.8 5-3M27 22l4 2.2-8 4.8-5-3" />
    </>
  ),
  "fa-hard-hat": (
    <>
      <path d="M8 20a10 10 0 0 1 20 0" />
      <path d="M14 20V9M22 20V9M6 20h24v5H6z" />
    </>
  ),
  "fa-compass": (
    <>
      <circle cx="18" cy="18" r="12" />
      <path d="m22 14-3 8-5 2 3-8 5-2Z" />
    </>
  ),
  "fa-file-invoice-dollar": (
    <>
      <path d="M11 5h11l5 5v21H11z" />
      <path d="M22 5v6h5M15 16h8M15 21h4" />
      <path d="M21 27c1.3.8 3.7.6 3.9-.9.2-1.6-3.5-1.5-3.3-3 .2-1.4 2.5-1.6 3.8-.8M23.5 20.5v8" />
    </>
  ),
  "fa-percentage": (
    <>
      <path d="m9 28 18-20" />
      <circle cx="12" cy="11" r="3" />
      <circle cx="24" cy="25" r="3" />
    </>
  ),
  "fa-chart-pie": (
    <>
      <path d="M18 6v12h12" />
      <path d="M29.4 22.2A12 12 0 1 1 13.8 6.6" />
      <path d="M21 6.4A12 12 0 0 1 29.6 15H21z" />
    </>
  ),
  "fa-search-dollar": (
    <>
      <circle cx="15.5" cy="15.5" r="8.5" />
      <path d="M22 22 30 30" />
      <path d="M14 20c1.2.7 3.4.6 3.6-.8.2-1.5-3.2-1.4-3-2.8.2-1.3 2.3-1.5 3.4-.8M16 13.5v7" />
    </>
  ),
  "fa-balance-scale": (
    <>
      <path d="M18 6v24M9 10h18M18 10l-7 11h14z" />
      <path d="M7 21h8a4 4 0 0 1-8 0ZM21 21h8a4 4 0 0 1-8 0Z" />
    </>
  ),
};

const getIconKey = (iconClass) =>
  String(iconClass || "")
    .split(/\s+/)
    .find((part) => part.startsWith("fa-"));

const ServiceIcon = ({ icon, index = 0, className = "", fallbackIcons }) => {
  const iconSet = Array.isArray(fallbackIcons) && fallbackIcons.length
    ? fallbackIcons
    : defaultFallbackIcons;
  const iconClass = String(icon || "").trim() || iconSet[index % iconSet.length];
  const iconKey = getIconKey(iconClass);
  const paths = iconPaths[iconKey] || iconPaths[getIconKey(iconSet[index % iconSet.length])] || iconPaths["fa-chart-line"];

  return (
    <svg
      className={`${className} service-svg-icon`.trim()}
      viewBox="0 0 36 36"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {paths}
    </svg>
  );
};

export default ServiceIcon;
