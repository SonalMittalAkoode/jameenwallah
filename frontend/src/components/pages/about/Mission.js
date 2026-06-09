"use client";

"use client";

const Mission = () => {
  const missionData = [
    {
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/>
          <path d="M2 17l10 5 10-5"/>
          <path d="M2 12l10 5 10-5"/>
        </svg>
      ),
      tag: "What drives us",
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/>
          <path d="M2 17l10 5 10-5"/>
          <path d="M2 12l10 5 10-5"/>
        </svg>
      ),
      tag: "What drives us",
      title: "Our Mission",
      description:
        "To empower individuals and families with transparent, trustworthy, and innovative real estate solutions that ensure secure and confident investments.",
      accent: "#E8345A",
      accentLight: "#fdeef2",
    },
    {
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <circle cx="12" cy="12" r="3"/>
          <line x1="12" y1="2" x2="12" y2="5"/>
          <line x1="12" y1="19" x2="12" y2="22"/>
          <line x1="2" y1="12" x2="5" y2="12"/>
          <line x1="19" y1="12" x2="22" y2="12"/>
        </svg>
      ),
      tag: "Where we're headed",
      title: "Our Vision",
      description:
        "To become India's most trusted real estate partner, transforming how people buy, sell, and invest in property through expert guidance and technology.",
      accent: "#E8345A",
      accentLight: "#fdeef2",
    },
  ];

  return (
    <>
      <style>{`
        .mission-cards-wrapper {
          display: flex;
          gap: 20px;
          width: 100%;
          margin-top: 8px;
        }

        .mission-card {
          flex: 1;
          position: relative;
          background: #ffffff;
          border: 1.5px solid #f0e4e8;
          border-radius: 18px;
          padding: 28px 24px 24px;
          overflow: hidden;
          transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
          cursor: default;
        }

        .mission-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #E8345A, #ff6b8a);
          border-radius: 18px 18px 0 0;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .mission-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 40px rgba(232, 52, 90, 0.12);
          border-color: #f4b8c6;
        }

        .mission-card:hover::before {
          opacity: 1;
        }

        .mission-card-bg-number {
          position: absolute;
          bottom: -10px;
          right: 10px;
          font-size: 90px;
          font-weight: 800;
          color: #f9ecee;
          line-height: 1;
          pointer-events: none;
          user-select: none;
          letter-spacing: -4px;
          transition: color 0.3s ease;
        }

        .mission-card:hover .mission-card-bg-number {
          color: #f5dde3;
        }

        .mission-icon-wrap {
          width: 54px;
          height: 54px;
          background: #fdeef2;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #E8345A;
          margin-bottom: 18px;
          transition: background 0.3s ease, transform 0.3s ease;
        }

        .mission-card:hover .mission-icon-wrap {
          background: #E8345A;
          color: #ffffff;
          transform: scale(1.05) rotate(-3deg);
        }

        .mission-tag {
          display: inline-block;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #E8345A;
          background: #fdeef2;
          border-radius: 30px;
          padding: 3px 11px;
          margin-bottom: 10px;
        }

        .mission-title {
          font-size: 19px;
          font-weight: 700;
          color: #1a1a2e;
          margin: 0 0 10px 0;
          line-height: 1.25;
        }

        .mission-description {
          font-size: 14px;
          color: #6b7280;
          line-height: 1.75;
          margin: 0;
          position: relative;
          z-index: 1;
        }

        .mission-divider {
          width: 32px;
          height: 2.5px;
          background: linear-gradient(90deg, #E8345A, #ff6b8a);
          border-radius: 2px;
          margin: 12px 0 14px;
        }

        @media (max-width: 576px) {
          .mission-cards-wrapper {
            flex-direction: column;
          }
        }
      `}</style>

      <div className="mission-cards-wrapper">
        {missionData.map((item, index) => (
          <div className="mission-card" key={index}>
            <span className="mission-card-bg-number">0{index + 1}</span>
            <div className="mission-icon-wrap">
              {item.icon}
            </div>
            <span className="mission-tag">{item.tag}</span>
            <h5 className="mission-title">{item.title}</h5>
            <div className="mission-divider" />
            <p className="mission-description">{item.description}</p>
          </div>
        ))}
      </div>
    </>
  );
};

export default Mission;