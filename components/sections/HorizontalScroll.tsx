"use client";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const ROW1 = [
  { img: "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?auto=format&fit=crop&w=560&h=360&q=80", label: "Demand Generation"    },
  { img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=560&h=360&q=80",   label: "Attribution Systems"  },
  { img: "https://images.unsplash.com/photo-1562577309-4932fdd64cd1?auto=format&fit=crop&w=560&h=360&q=80",   label: "Creative Technology"  },
  { img: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=560&h=360&q=80", label: "Paid Distribution"    },
  { img: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&w=560&h=360&q=80", label: "Conversion Funnels"   },
];
const ROW2 = [
  { img: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=560&h=360&q=80", label: "AI Automation"        },
  { img: "https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=560&h=360&q=80",   label: "MarTech Stack"        },
  { img: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=560&h=360&q=80", label: "Creator Networks"     },
  { img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=560&h=360&q=80", label: "Performance Marketing" },
  { img: "https://images.unsplash.com/photo-1499159058454-75067059248a?auto=format&fit=crop&w=560&h=360&q=80", label: "Growth Engineering"   },
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
          start: "top bottom", end: "bottom top",
          scrub: 1.2,
        },
      });
    }
    if (row2Ref.current) {
      gsap.to(row2Ref.current, {
        x: () => (row2Ref.current!.scrollWidth / 4),
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom", end: "bottom top",
          scrub: 1.2,
        },
      });
    }

    // Tilt the rows container on scroll
    gsap.to(".hs-rows-wrap", {
      rotateX: 4,
      ease: "none",
      transformOrigin: "50% 0%",
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top bottom",
        end: "bottom top",
        scrub: 1.5,
      },
    });
  }, { scope: sectionRef });

  const renderRow = (items: typeof ROW1, ref: React.RefObject<HTMLDivElement | null>) => (
    <div ref={ref} style={{ display: "flex", gap: 16, width: "max-content", marginBottom: 16 }}>
      {[...items, ...items].map((item, i) => (
        <div
          key={i}
          style={{
            flexShrink: 0,
            width: 280, height: 180,
            borderRadius: 16,
            overflow: "hidden",
            border: "1px solid var(--bt-border)",
            position: "relative",
          }}
        >
          <img
            src={item.img}
            alt={item.label}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            loading="lazy"
          />
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.7) 100%)",
          }} />
          <span style={{
            position: "absolute", bottom: 14, left: 16,
            fontSize: "0.6875rem", fontWeight: 700,
            color: "#ffffff", letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}>
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <section
      ref={sectionRef}
      style={{ background: "var(--bt-black)", padding: "80px 0", overflow: "hidden", perspective: "1000px" }}
      aria-label="Capabilities scroll"
    >
      <div className="section-sm" style={{ paddingTop: 0, paddingBottom: 48 }}>
        <div className="container">
          <span className="chip" style={{ marginBottom: 16 }}>Full Spectrum</span>
          <h2 className="heading-lg">
            The Full Growth<br />
            <span style={{
              background: "linear-gradient(135deg,#E8312A,#FF8C19)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>Infrastructure Stack.</span>
          </h2>
        </div>
      </div>

      <div className="hs-rows-wrap">
        {renderRow(ROW1, row1Ref)}
        {renderRow(ROW2, row2Ref)}
      </div>
    </section>
  );
}
