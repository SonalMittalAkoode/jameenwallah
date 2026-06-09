'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCompare } from '@/context/CompareContext';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function CompareBar() {
  const { compareList, removeFromCompare, clearCompare, error } = useCompare();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  // Hide compare bar on the compare page itself
  const isComparePage = pathname === '/compare';
  const visible = compareList.length > 0 && !isComparePage;

  return (
    <>
      {/* Error toast */}
      {error && (
        <div
          style={{
            position: 'fixed',
            bottom: visible ? '110px' : '30px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            background: '#ff385c',
            color: '#fff',
            padding: '10px 24px',
            borderRadius: '8px',
            fontWeight: 600,
            fontSize: '14px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
            transition: 'bottom 0.3s ease',
            whiteSpace: 'nowrap',
          }}
        >
          <i className="fas fa-triangle-exclamation me-2" />
          {error}
        </div>
      )}

      {/* Floating bar */}
      <div
        className={`compare-bar ${isCollapsed ? 'collapsed' : ''}`}
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 9990,
          background: '#fff',
          borderTop: '1px solid #e8e8e8',
          boxShadow: '0 -4px 24px rgba(0,0,0,0.10)',
          transform: visible ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.35s cubic-bezier(.4,0,.2,1)',
          padding: '12px 24px',
        }}
      >
        {/* Collapse/Expand Toggle Button - Mobile Only */}
        <button
          className="compare-bar-toggle"
          onClick={() => setIsCollapsed(!isCollapsed)}
          style={{
            display: 'none',
            position: 'absolute',
            top: '-35px',
            right: '20px',
            background: '#ff385c',
            color: '#fff',
            border: 'none',
            borderRadius: '8px 8px 0 0',
            padding: '8px 16px',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 -2px 8px rgba(0,0,0,0.1)',
          }}
        >
          {isCollapsed ? (
            <>
              <i className="fas fa-code-compare me-1" /> Compare ({compareList.length})
            </>
          ) : (
            <i className="fas fa-chevron-down" />
          )}
        </button>

        <div
          className="compare-bar-inner"
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            flexWrap: 'wrap',
            opacity: isCollapsed ? 0 : 1,
            maxHeight: isCollapsed ? 0 : '500px',
            overflow: 'hidden',
            transition: 'opacity 0.3s ease, max-height 0.3s ease',
          }}
        >
          {/* Label */}
          <div style={{ fontWeight: 700, fontSize: 15, color: '#222', minWidth: 120 }}>
            <i className="fas fa-code-compare me-2" style={{ color: '#ff385c' }} />
            Compare ({compareList.length}/3)
          </div>

          {/* Property thumbnails */}
          <div className="compare-properties" style={{ display: 'flex', gap: 12, flex: 1, flexWrap: 'wrap' }}>
            {compareList.map((prop) => (
              <div
                key={prop.id}
                className="compare-property-item"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  background: '#f8f8f8',
                  borderRadius: 10,
                  padding: '6px 12px 6px 6px',
                  border: '1px solid #eee',
                  minWidth: 0,
                }}
              >
                {prop.image && (
                  <Image
                    src={prop.image}
                    alt={prop.title}
                    width={48}
                    height={40}
                    style={{ borderRadius: 6, objectFit: 'cover', flexShrink: 0 }}
                  />
                )}
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: 13,
                      color: '#222',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: 140,
                    }}
                  >
                    {prop.title}
                  </div>
                  <div style={{ fontSize: 11, color: '#888' }}>{prop.price}</div>
                </div>
                <button
                  onClick={() => removeFromCompare(prop.id)}
                  title="Remove"
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#bbb',
                    fontSize: 14,
                    padding: '0 0 0 4px',
                    lineHeight: 1,
                    flexShrink: 0,
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#ff385c')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#bbb')}
                >
                  <i className="fas fa-xmark" />
                </button>
              </div>
            ))}

            {/* Empty slots */}
            {Array.from({ length: 3 - compareList.length }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="compare-empty-slot"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 120,
                  height: 52,
                  border: '2px dashed #e0e0e0',
                  borderRadius: 10,
                  color: '#ccc',
                  fontSize: 13,
                }}
              >
                <i className="fas fa-plus me-1" /> Add
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="compare-actions" style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
            <button
              onClick={clearCompare}
              style={{
                background: 'none',
                border: '1px solid #ddd',
                borderRadius: 8,
                padding: '8px 16px',
                fontSize: 13,
                cursor: 'pointer',
                color: '#666',
                fontWeight: 500,
                transition: 'border-color 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#ff385c')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#ddd')}
            >
              Clear All
            </button>
            <Link
              href="/compare"
              style={{
                background: '#ff385c',
                color: '#fff',
                borderRadius: 8,
                padding: '8px 20px',
                fontSize: 13,
                fontWeight: 700,
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                transition: 'background 0.2s',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#e02e4e')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#ff385c')}
            >
              Compare Now <i className="fas fa-arrow-right-long" />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
