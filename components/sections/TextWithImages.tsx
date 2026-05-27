"use client";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const INLINE_IMGS = [
  { label: "Systems",  img: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=200&h=120&q=80" },
  { label: "Revenue",  img: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&w=200&h=120&q=80" },
  { label: "Scale",    img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=200&h=120&q=80" },
];

export default function TextWithImages() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    gsap.from(".tx-word", {
      opacity: 0, y: 40, rotationX: -30,
      stagger: 0.04, duration: 0.8, ease: "power3.out",
      scrollTrigger: { trigger: sectionRef.current, start: "top 75%", once: true },
    });
    gsap.from(".tx-inline-img", {
      scale: 0.6, opacity: 0, rotate: -10,
      stagger: 0.15, duration: 0.7, ease: "back.out(1.7)",
      scrollTrigger: { trigger: sectionRef.current, start: "top 70%", once: true },
    });
  }, { scope: sectionRef });

  const words = [
    { text: "We",             inline: null },
    { text: "engineer",       inline: null },
    { text: "",               inline: INLINE_IMGS[0] },
    { text: "that",           inline: null },
    { text: "turn",           inline: null },
    { text: "attention",      inline: null },
    { text: "into",           inline: null },
    { text: "",               inline: INLINE_IMGS[1] },
    { text: "—",              inline: null },
    { text: "not",            inline: null },
    { text: "through",        inline: null },
    { text: "campaigns",      inline: null },
    { text: "but",            inline: null },
    { text: "",               inline: INLINE_IMGS[2] },
    { text: "infrastructure.", inline: null },
  ];

  return (
    <section ref={sectionRef} className="section" style={{ background: "var(--bt-black)" }}>
      <div className="container">
        <div style={{ marginBottom: 40 }}>
          <span className="chip">Our Model</span>
        </div>

        <div style={{
          fontSize: "clamp(2rem, 5vw, 4.5rem)",
          fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.1,
          display: "flex", flexWrap: "wrap",
          gap: "0.2em 0.3em", alignItems: "center",
        }}>
          {words.map((w, i) =>
            w.inline ? (
              <span
                key={i}
                className="tx-inline-img"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width:  "clamp(120px, 15vw, 180px)",
                  height: "clamp(56px, 7vw, 82px)",
                  borderRadius: 99,
                  overflow: "hidden",
                  border: "1px solid var(--bt-border)",
                  verticalAlign: "middle",
                  position: "relative",
                  flexShrink: 0,
                }}
              >
                <img
                  src={w.inline.img}
                  alt={w.inline.label}
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  loading="lazy"
                />
                <div style={{
                  position: "absolute", inset: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: "rgba(0,0,0,0.45)",
                  fontSize: "0.42em", fontWeight: 700,
                  color: "white", letterSpacing: "0.1em", textTransform: "uppercase",
                }}>
                  {w.inline.label}
                </div>
              </span>
            ) : (
              <span
                key={i}
                className="tx-word"
                style={{ display: "inline-block", color: "var(--bt-white)" }}
              >
                {w.text}
              </span>
            )
          )}
        </div>

        <p className="tx-word" style={{ marginTop: 40, fontSize: "1.125rem", color: "var(--bt-muted)", maxWidth: 560, lineHeight: 1.75 }}>
          Our multidisciplinary team combines brand strategy, creative technology, and performance infrastructure — building systems that generate demand, distribute at scale, and convert with precision.
        </p>
      </div>
    </section>
  );
}
