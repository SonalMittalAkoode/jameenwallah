/**
 * Dynamic imports for heavy third-party libraries
 * This reduces initial bundle size by lazy-loading non-critical dependencies
 */

import dynamic from 'next/dynamic';

// Chart.js components - only needed in dashboard
export const DynamicDoughnut = dynamic(
  () => import('react-chartjs-2').then((mod) => mod.Doughnut),
  { 
    ssr: false,
    loading: () => <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading chart...</div>
  }
);

export const DynamicBar = dynamic(
  () => import('react-chartjs-2').then((mod) => mod.Bar),
  { 
    ssr: false,
    loading: () => <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading chart...</div>
  }
);

// Recharts components
export const DynamicPieChart = dynamic(
  () => import('recharts').then((mod) => mod.PieChart),
  { 
    ssr: false,
    loading: () => <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading chart...</div>
  }
);

export const DynamicPie = dynamic(
  () => import('recharts').then((mod) => mod.Pie),
  { ssr: false }
);

export const DynamicCell = dynamic(
  () => import('recharts').then((mod) => mod.Cell),
  { ssr: false }
);

export const DynamicResponsiveContainer = dynamic(
  () => import('recharts').then((mod) => mod.ResponsiveContainer),
  { ssr: false }
);

export const DynamicTooltip = dynamic(
  () => import('recharts').then((mod) => mod.Tooltip),
  { ssr: false }
);

// Google Maps - very heavy, only load when needed
export const DynamicGoogleMap = dynamic(
  () => import('@react-google-maps/api').then((mod) => mod.GoogleMap),
  { 
    ssr: false,
    loading: () => <div style={{ height: '400px', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading map...</div>
  }
);

export const DynamicMarker = dynamic(
  () => import('@react-google-maps/api').then((mod) => mod.Marker),
  { ssr: false }
);

export const DynamicInfoWindow = dynamic(
  () => import('@react-google-maps/api').then((mod) => mod.InfoWindow),
  { ssr: false }
);

// PhotoSwipe - image gallery
export const DynamicGallery = dynamic(
  () => import('react-photoswipe-gallery').then((mod) => mod.Gallery),
  { 
    ssr: false,
    loading: () => <div>Loading gallery...</div>
  }
);

export const DynamicItem = dynamic(
  () => import('react-photoswipe-gallery').then((mod) => mod.Item),
  { ssr: false }
);

// ProSidebar - admin panel
export const DynamicSidebar = dynamic(
  () => import('react-pro-sidebar').then((mod) => mod.Sidebar),
  { 
    ssr: false,
    loading: () => <div style={{ height: '100vh', background: '#f8f9fa' }} />
  }
);

export const DynamicMenu = dynamic(
  () => import('react-pro-sidebar').then((mod) => mod.Menu),
  { ssr: false }
);

export const DynamicMenuItem = dynamic(
  () => import('react-pro-sidebar').then((mod) => mod.MenuItem),
  { ssr: false }
);

export const DynamicSubMenu = dynamic(
  () => import('react-pro-sidebar').then((mod) => mod.SubMenu),
  { ssr: false }
);
