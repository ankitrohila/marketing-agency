"use client";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Footer from "@/components/sections/Footer";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const VALUES = [
  { title: "Bold Thinking",        desc: "We believe the most creative solutions start with uncomfortable questions.",         icon: "💡" },
  { title: "Data First",            desc: "Every creative decision is backed by evidence. We measure what matters.",             icon: "📊" },
  { title: "Radical Transparency",  desc: "No black boxes. You always know what we're doing, why, and what it's delivering.",   icon: "🔍" },
  { title: "Client Success First",  desc: "Your growth is our report card. We don't win unless you win.",                       icon: "🚀" },
  { title: "Speed with Quality",    desc: "We move fast without cutting corners. Fast iteration, high standards.",               icon: "⚡" },
  { title: "Long-term Thinking",    desc: "We build brands for the next decade, not just the next campaign.",                   icon: "🎯" },
];

const TIMELINE = [
  { year: "2018", event: "Founded in Bangalore with a 4-person team and a belief that marketing should be honest." },
  { year: "2019", event: "First ₹1Cr revenue milestone. Expanded into creative production and video." },
  { year: "2020", event: "Pivoted hard into D2C performance marketing as pandemic accelerated digital growth." },
  { year: "2021", event: "Launched MarTech practice. Built in-house CDP and automation capabilities." },
  { year: "2022", event: "Crossed 50 active brand clients. Opened Mumbai satellite office." },
  { year: "2023", event: "Generated ₹80Cr+ in client revenue. Launched AI-assisted creative production." },
  { year: "2024", event: "₹120Cr+ client revenue. 150+ brands grown. Expanding into Southeast Asia." },
];

const TEAM = [
  { name: "Ankit Rohilla", role: "Founder & CEO",          img: "https://i.pravatar.cc/300?img=68", bg: "#1a0808" },
  { name: "Priya Sharma",  role: "Chief Creative Officer",  img: "https://i.pravatar.cc/300?img=47", bg: "#1a0f2f" },
  { name: "Rohit Nair",    role: "Head of Performance",     img: "https://i.pravatar.cc/300?img=33", bg: "#0f1f2f" },
  { name: "Anjali Menon",  role: "Head of Strategy",        img: "https://i.pravatar.cc/300?img=44", bg: "#2f1a0f" },
  { name: "Karan Mehta",   role: "Head of Technology",      img: "https://i.pravatar.cc/300?img=15", bg: "#1f0f1a" },
  { name: "Deepa Pillai",  role: "Head of Client Success",  img: "https://i.pravatar.cc/300?img=57", bg: "#0f1a0f" },
];

export default function AboutPage() {
  const heroRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    gsap.from(".about-word", { y: "100%", stagger: 0.06, duration: 0.9, ease: "power4.out" });
    gsap.from(".about-sub",  { opacity: 0, y: 20, stagger: 0.1, duration: 0.7, delay: 0.5 });
    gsap.utils.toArray<HTMLElement>(".val-card").forEach((card) => {
      gsap.from(card, { opacity: 0, y: 40, duration: 0.7, ease: "power3.out",
        scrollTrigger: { trigger: card, start: "top 85%", once: true } });
    });
    gsap.utils.toArray<HTMLElement>(".tl-item").forEach((item, i) => {
      gsap.from(item, { opacity: 0, x: i % 2 === 0 ? -40 : 40, duration: 0.7, ease: "power3.out",
        scrollTrigger: { trigger: item, start: "top 85%", once: true } });
    });
    gsap.utils.toArray<HTMLElement>(".team-card").forEach((card) => {
      gsap.from(card, { opacity: 0, scale: 0.92, duration: 0.7, ease: "power3.out",
        scrollTrigger: { trigger: card, start: "top 85%", once: true } });
    });
  }, { scope: heroRef });

  return (
    <>
      {/* Hero */}
      <section ref={heroRef} className="page-hero" style={{ minHeight: "60vh" }}>
        <div className="bg-grid" style={{ position: "absolute", inset: 0, opacity: 0.3, maskImage: "radial-gradient(ellipse 70% 70% at 50% 50%, black, transparent 90%)" }} />
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <div className="about-sub" style={{ marginBottom: 24 }}><span className="chip">About Us</span></div>
          <h1 style={{ overflow: "hidden" }}>
            {["We don't", "do cookie-cutter", "solutions."].map((w, i) => (
              <div key={i} style={{ overflow: "hidden" }}>
                <span className="about-word" style={{ display: "block", fontSize: "clamp(2rem, 7vw, 6rem)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.0, color: i === 2 ? "var(--bt-lime)" : "var(--bt-white)" }}>
                  {w}
                </span>
              </div>
            ))}
          </h1>
          <p className="about-sub" style={{ marginTop: 28, fontSize: "1.125rem", color: "var(--bt-muted)", maxWidth: 560, lineHeight: 1.75 }}>
            BrandThink is a 360° MarTech and creative agency founded in Bangalore. We believe marketing should be honest, data-driven, and beautiful — in that order.
          </p>
        </div>
      </section>

      {/* Mission split */}
      <section className="section" style={{ background: "var(--bt-surface)" }}>
        <div className="container">
          <div className="r-grid-2">
            <div>
              <span className="chip" style={{ marginBottom: 20 }}>Our Mission</span>
              <h2 className="heading-lg" style={{ marginBottom: 24 }}>
                Marketing that<br />
                <span style={{ background: "linear-gradient(135deg,#E8312A,#FF8C19)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  earns trust.
                </span>
              </h2>
              <p style={{ fontSize: "1.0625rem", color: "var(--bt-muted)", lineHeight: 1.75, marginBottom: 20 }}>
                We founded BrandThink because we were tired of agencies that overpromise and underdeliver. Our team combines trend-savvy ideas with cutting-edge strategies to create unique experiences tailored just for you.
              </p>
              <p style={{ fontSize: "1.0625rem", color: "var(--bt-muted)", lineHeight: 1.75 }}>
                From a 4-person Bangalore startup in 2018 to a 50+ strong team that has generated ₹120Cr+ in client revenue — every step has been guided by the same north star: real results for real brands.
              </p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              {[
                { num: "150+",    label: "Brands Grown"   },
                { num: "50+",     label: "Team Members"   },
                { num: "₹120Cr+", label: "Client Revenue" },
                { num: "6+",      label: "Years"          },
              ].map((stat) => (
                <div key={stat.label} style={{ padding: 28, borderRadius: 16, background: "var(--bt-card)", border: "1px solid var(--bt-border)", textAlign: "center" }}>
                  <div style={{
                    fontSize: "2.5rem", fontWeight: 900, letterSpacing: "-0.04em",
                    background: "linear-gradient(135deg,#E8312A,#FF8C19)",
                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                  }}>
                    {stat.num}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--bt-muted)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 8 }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section" style={{ background: "var(--bt-black)" }}>
        <div className="container">
          <div style={{ marginBottom: 56 }}>
            <span className="chip" style={{ marginBottom: 16 }}>Our Values</span>
            <h2 className="heading-lg">How we<br /><span style={{ color: "var(--bt-lime)" }}>think.</span></h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 320px), 1fr))", gap: 20 }}>
            {VALUES.map((v) => (
              <div key={v.title} className="val-card card" style={{ padding: 32 }}>
                <div style={{ fontSize: "2rem", marginBottom: 16 }}>{v.icon}</div>
                <h3 style={{ fontSize: "1.125rem", fontWeight: 800, letterSpacing: "-0.02em", color: "var(--bt-white)", marginBottom: 10 }}>{v.title}</h3>
                <p style={{ fontSize: "0.9375rem", color: "var(--bt-muted)", lineHeight: 1.7 }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="section" style={{ background: "var(--bt-surface)" }}>
        <div className="container">
          <div style={{ marginBottom: 56 }}>
            <span className="chip" style={{ marginBottom: 16 }}>Our Journey</span>
            <h2 className="heading-lg">6 years.<br /><span style={{ color: "var(--bt-lime)" }}>One mission.</span></h2>
          </div>
          <div style={{ position: "relative" }}>
            <div className="tl-center-line" style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 1, background: "var(--bt-border)", transform: "translateX(-50%)" }} />
            {TIMELINE.map((item, i) => (
              <div key={item.year} className="tl-item" style={{ display: "flex", justifyContent: i % 2 === 0 ? "flex-start" : "flex-end", marginBottom: 32, position: "relative" }}>
                <div style={{ width: "45%", padding: 24, borderRadius: 16, background: "var(--bt-card)", border: "1px solid var(--bt-border)" }}>
                  <div style={{
                    fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.1em", marginBottom: 8,
                    background: "linear-gradient(135deg,#E8312A,#FF8C19)",
                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                  }}>
                    {item.year}
                  </div>
                  <p style={{ fontSize: "0.9375rem", color: "var(--bt-muted)", lineHeight: 1.65 }}>{item.event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="section" style={{ background: "var(--bt-black)" }}>
        <div className="container">
          <div style={{ marginBottom: 56 }}>
            <span className="chip" style={{ marginBottom: 16 }}>The Team</span>
            <h2 className="heading-lg">The minds<br /><span style={{ color: "var(--bt-lime)" }}>behind the work.</span></h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 260px), 1fr))", gap: 20 }}>
            {TEAM.map((member) => (
              <div key={member.name} className="team-card card" style={{ padding: 0, overflow: "hidden" }}>
                <div style={{ height: 220, background: member.bg, overflow: "hidden", position: "relative" }}>
                  <img
                    src={member.img}
                    alt={member.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", transition: "transform 0.5s var(--ease-out)" }}
                    loading="lazy"
                    onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.06)")}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                  />
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg, #E8312A, #FF8C19)" }} />
                </div>
                <div style={{ padding: 20 }}>
                  <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--bt-white)", marginBottom: 4 }}>{member.name}</h3>
                  <p style={{ fontSize: "0.8125rem", color: "var(--bt-muted)" }}>{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
