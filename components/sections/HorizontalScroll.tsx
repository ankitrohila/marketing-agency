"use client";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const ROW1 = [
  { img: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=360&h=500&q=80", label: "Brand Strategy" },
  { img: "https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=360&h=500&q=80", label: "Creative Direction" },
  { img: "https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=360&h=500&q=80", label: "Digital Campaigns" },
  { img: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=360&h=500&q=80", label: "Performance Ads" },
  { img: "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?auto=format&fit=crop&w=360&h=500&q=80", label: "Data Analytics" },
  { img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=360&h=500&q=80", label: "MarTech Stack" },
  { img: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&w=360&h=500&q=80", label: "Conversion CRO" },
];

const ROW2 = [
  { img: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=360&h=500&q=80", label: "AI Automation" },
  { img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=360&h=500&q=80", label: "Growth Engineering" },
  { img: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=360&h=500&q=80", label: "Creator Networks" },
  { img: "https://images.unsplash.com/photo-1562577309-4932fdd64cd1?auto=format&fit=crop&w=360&h=500&q=80", label: "Demand Generation" },
  { img: "https://images.unsplash.com/photo-1499159058454-75067059248a?auto=format&fit=crop&w=360&h=500&q=80", label: "Influencer Strategy" },
  { img: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=360&h=500&q=80", label: "Media Distribution" },
  { img: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=360&h=500&q=80", label: "Attribution Systems" },
];

export default function HorizontalScroll() {
  const sectionRef = useRef<HTMLElement>(null);
  const row1Ref    = useRef<HTMLDivElement>(null);
  const row2Ref    = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (row1Ref.current) {
      gsap.to(row1Ref.current, {
        x: () => -(row1Ref.current!.scrollWidth / 2),
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 1.8,
        },
      });
    }
    if (row2Ref.current) {
      gsap.fromTo(
        row2Ref.current,
        { x: () => -(row2Ref.current!.scrollWidth / 2) },
        {
          x: 0,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 1.8,
          },
        }
      );
    }
  }, { scope: sectionRef });

  const renderRow = (
    items: typeof ROW1,
    ref: React.RefObject<HTMLDivElement | null>
  ) => (
    <div
      ref={ref}
      style={{ display: "flex", gap: 16, width: "max-content", willChange: "transform" }}
    >
      {[...items, ...items].map((item, i) => (
        <div
          key={i}
          style={{
            flexShrink: 0,
            width: 220,
            height: 310,
            borderRadius: 18,
            overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.08)",
            position: "relative",
            boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
            transition: "transform 0.4s, box-shadow 0.4s",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.transform = "scale(1.04) translateY(-6px)";
            (e.currentTarget as HTMLElement).style.boxShadow = "0 24px 60px rgba(0,0,0,0.7)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.transform = "scale(1) translateY(0)";
            (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 40px rgba(0,0,0,0.5)";
          }}
        >
          <img
            src={item.img}
            alt={item.label}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
            loading="lazy"
          />
          {/* Gradient overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to bottom, rgba(0,0,0,0.05) 40%, rgba(0,0,0,0.85) 100%)",
            }}
          />
          {/* Label */}
          <div
            style={{
              position: "absolute",
              bottom: 16,
              left: 16,
              right: 16,
            }}
          >
            <span
              style={{
                display: "inline-block",
                fontSize: "0.6875rem",
                fontWeight: 700,
                color: "#ffffff",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                padding: "4px 10px",
                borderRadius: 99,
                background: "rgba(0,0,0,0.5)",
                backdropFilter: "blur(6px)",
                border: "1px solid rgba(255,255,255,0.15)",
              }}
            >
              {item.label}
            </span>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <section
      ref={sectionRef}
      style={{ background: "var(--bt-black)", overflow: "hidden" }}
      aria-label="Capabilities"
    >
      {/* Header */}
      <div
        className="section-sm"
        style={{ paddingBottom: 64 }}
      >
        <div className="container">
          <span className="chip" style={{ marginBottom: 16 }}>
            Full Spectrum
          </span>
          <h2 className="heading-lg">
            The Full Growth
            <br />
            <span
              style={{
                background: "linear-gradient(135deg,#E8312A,#FF8C19)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Infrastructure Stack.
            </span>
          </h2>
        </div>
      </div>

      {/* Diagonal carousel band */}
      <div
        style={{
          padding: "80px 0 120px",
          transform: "rotate(-7deg) scaleX(1.18)",
          transformOrigin: "50% 50%",
          overflow: "hidden",
        }}
      >
        <div style={{ marginBottom: 20 }}>{renderRow(ROW1, row1Ref)}</div>
        <div>{renderRow(ROW2, row2Ref)}</div>
      </div>
    </section>
  );
}
