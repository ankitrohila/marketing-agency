"use client";

const SECTION_STYLE: React.CSSProperties = {
  background: "var(--adm-surface)",
  border: "1px solid var(--adm-border)",
  borderRadius: 16,
  padding: "28px 28px",
  marginBottom: 20,
};

const CODE_STYLE: React.CSSProperties = {
  background: "#060606",
  border: "1px solid var(--adm-border2)",
  borderRadius: 10,
  padding: "16px 20px",
  fontFamily: "monospace",
  fontSize: "0.8125rem",
  color: "#34D399",
  overflowX: "auto",
  whiteSpace: "pre",
  marginTop: 12,
  lineHeight: 1.6,
};

const H2_STYLE: React.CSSProperties = {
  fontSize: "1rem",
  fontWeight: 700,
  color: "var(--adm-text)",
  marginBottom: 12,
  display: "flex",
  alignItems: "center",
  gap: 10,
};

const P_STYLE: React.CSSProperties = {
  fontSize: "0.875rem",
  color: "var(--adm-muted2)",
  lineHeight: 1.7,
  marginBottom: 8,
};

const LI_STYLE: React.CSSProperties = {
  fontSize: "0.875rem",
  color: "var(--adm-muted2)",
  lineHeight: 1.7,
  marginBottom: 6,
  paddingLeft: 16,
  position: "relative" as const,
};

export default function DatabaseGuidePage() {
  return (
    <div className="adm-page-main" style={{ padding: 32, maxWidth: 900, minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--adm-text)", letterSpacing: "-0.03em", marginBottom: 8 }}>
          MySQL + phpMyAdmin Setup Guide
        </h1>
        <p style={{ fontSize: "0.9375rem", color: "var(--adm-muted)", lineHeight: 1.7 }}>
          Complete guide to set up MySQL on localhost and connect BrandThink to a real database
        </p>
      </div>

      {/* Current Status */}
      <div style={{ ...SECTION_STYLE, background: "rgba(52,211,153,0.05)", border: "1px solid rgba(52,211,153,0.15)" }}>
        <h2 style={{ ...H2_STYLE, color: "#34D399" }}>📦 Current Setup (JSON Files)</h2>
        <p style={P_STYLE}>
          BrandThink currently uses JSON files stored in <code style={{ background: "rgba(255,255,255,0.08)", padding: "1px 6px", borderRadius: 4, fontSize: "0.8125rem", color: "var(--adm-text)" }}>/data/</code> for all data storage. This works great for development and small deployments.
        </p>
        <p style={P_STYLE}>
          For production with MySQL, follow the steps below. The app is designed to switch data layers with minimal code changes.
        </p>
      </div>

      {/* Step 1 */}
      <div style={SECTION_STYLE}>
        <h2 style={H2_STYLE}>
          <span style={{ width: 28, height: 28, borderRadius: "50%", background: "#E8312A", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 800, flexShrink: 0 }}>1</span>
          Install MySQL on Windows (Localhost)
        </h2>
        <p style={P_STYLE}>Download and install <strong>MySQL Community Server</strong> from the official MySQL website.</p>
        <ol style={{ listStyle: "decimal", paddingLeft: 20 }}>
          {[
            "Go to: https://dev.mysql.com/downloads/mysql/",
            "Download MySQL Installer for Windows",
            "Choose 'Developer Default' setup → includes MySQL Server + Workbench + phpMyAdmin",
            "Set root password during setup — save it, you'll need it",
            "Complete installation. MySQL will run as a Windows service (auto-starts on boot)",
          ].map((step, i) => (
            <li key={i} style={LI_STYLE}>{step}</li>
          ))}
        </ol>
      </div>

      {/* Step 2 */}
      <div style={SECTION_STYLE}>
        <h2 style={H2_STYLE}>
          <span style={{ width: 28, height: 28, borderRadius: "50%", background: "#E8312A", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 800, flexShrink: 0 }}>2</span>
          Install phpMyAdmin (Localhost GUI)
        </h2>
        <p style={P_STYLE}>The easiest way is to install <strong>XAMPP</strong> which includes phpMyAdmin, or install it via Composer for standalone use.</p>
        <p style={{ ...P_STYLE, fontWeight: 600, color: "rgba(255,255,255,0.8)" }}>Option A — XAMPP (Recommended for beginners):</p>
        <div style={CODE_STYLE}>{`1. Download XAMPP from: https://www.apachefriends.org/
2. Install XAMPP → only enable MySQL and Apache modules
3. Open XAMPP Control Panel → Start MySQL
4. Go to: http://localhost/phpmyadmin
5. Login: root | password: (blank or your MySQL root password)`}</div>

        <p style={{ ...P_STYLE, fontWeight: 600, color: "rgba(255,255,255,0.8)", marginTop: 16 }}>Option B — Standalone phpMyAdmin:</p>
        <div style={CODE_STYLE}>{`1. Download from: https://www.phpmyadmin.net/downloads/
2. Extract to C:\\xampp\\htdocs\\phpmyadmin\\
3. Edit config.inc.php — set $cfg['Servers'][$i]['host'] = 'localhost'
4. Open: http://localhost/phpmyadmin`}</div>
      </div>

      {/* Step 3 */}
      <div style={SECTION_STYLE}>
        <h2 style={H2_STYLE}>
          <span style={{ width: 28, height: 28, borderRadius: "50%", background: "#E8312A", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 800, flexShrink: 0 }}>3</span>
          Create the BrandThink Database
        </h2>
        <p style={P_STYLE}>Open phpMyAdmin and run the following SQL to create the database and all tables:</p>
        <div style={CODE_STYLE}>{`-- Create database
CREATE DATABASE IF NOT EXISTS brandthink
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE brandthink;

-- Users table
CREATE TABLE users (
  id           VARCHAR(36)  PRIMARY KEY,
  name         VARCHAR(120) NOT NULL,
  email        VARCHAR(180) NOT NULL UNIQUE,
  password     VARCHAR(255),
  role         VARCHAR(30)  DEFAULT 'editor',
  status       VARCHAR(20)  DEFAULT 'active',
  avatar       TEXT,
  created_at   DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Posts table
CREATE TABLE posts (
  id           VARCHAR(36)  PRIMARY KEY,
  title        VARCHAR(300) NOT NULL,
  slug         VARCHAR(300) NOT NULL UNIQUE,
  content      LONGTEXT,
  excerpt      TEXT,
  category     VARCHAR(80),
  tags         JSON,
  cover_image  TEXT,
  author_id    VARCHAR(36),
  status       VARCHAR(20)  DEFAULT 'draft',
  featured     TINYINT(1)   DEFAULT 0,
  read_time    VARCHAR(20),
  published_at DATETIME,
  created_at   DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Contacts table
CREATE TABLE contacts (
  id         VARCHAR(36) PRIMARY KEY,
  name       VARCHAR(120) NOT NULL,
  email      VARCHAR(180) NOT NULL,
  company    VARCHAR(120),
  budget     VARCHAR(80),
  message    TEXT NOT NULL,
  status     VARCHAR(20) DEFAULT 'new',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Leads table
CREATE TABLE leads (
  id         VARCHAR(36) PRIMARY KEY,
  name       VARCHAR(120) NOT NULL,
  email      VARCHAR(180) NOT NULL,
  company    VARCHAR(120),
  phone      VARCHAR(30),
  service    VARCHAR(120),
  budget     VARCHAR(80),
  message    TEXT,
  source     VARCHAR(80),
  status     VARCHAR(20) DEFAULT 'new',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Subscribers table
CREATE TABLE subscribers (
  id            VARCHAR(36) PRIMARY KEY,
  email         VARCHAR(180) NOT NULL UNIQUE,
  source        VARCHAR(80),
  status        VARCHAR(20) DEFAULT 'active',
  subscribed_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Bookings table
CREATE TABLE bookings (
  id         VARCHAR(36) PRIMARY KEY,
  name       VARCHAR(120) NOT NULL,
  email      VARCHAR(180) NOT NULL,
  phone      VARCHAR(30),
  company    VARCHAR(120),
  service    VARCHAR(120) NOT NULL,
  date       DATE NOT NULL,
  time       VARCHAR(20) NOT NULL,
  notes      TEXT,
  zoom_link  VARCHAR(300),
  status     VARCHAR(20) DEFAULT 'confirmed',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Forms table
CREATE TABLE forms (
  id               VARCHAR(36) PRIMARY KEY,
  name             VARCHAR(120) NOT NULL,
  description      TEXT,
  fields           JSON,
  settings         JSON,
  submissions_count INT DEFAULT 0,
  created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Form submissions table
CREATE TABLE form_submissions (
  id          VARCHAR(36) PRIMARY KEY,
  form_id     VARCHAR(36) NOT NULL,
  form_name   VARCHAR(120),
  data        JSON,
  ip          VARCHAR(45),
  status      VARCHAR(20) DEFAULT 'new',
  submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE
);`}</div>
      </div>

      {/* Step 4 */}
      <div style={SECTION_STYLE}>
        <h2 style={H2_STYLE}>
          <span style={{ width: 28, height: 28, borderRadius: "50%", background: "#E8312A", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 800, flexShrink: 0 }}>4</span>
          Connect BrandThink to MySQL
        </h2>
        <p style={P_STYLE}>Install the MySQL client for Node.js:</p>
        <div style={CODE_STYLE}>{`npm install mysql2`}</div>

        <p style={{ ...P_STYLE, marginTop: 16 }}>Update your <code style={{ background: "rgba(255,255,255,0.08)", padding: "1px 6px", borderRadius: 4, fontSize: "0.8125rem", color: "var(--adm-text)" }}>.env.local</code>:</p>
        <div style={CODE_STYLE}>{`DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=your_root_password
DB_NAME=brandthink`}</div>

        <p style={{ ...P_STYLE, marginTop: 16 }}>Create <code style={{ background: "rgba(255,255,255,0.08)", padding: "1px 6px", borderRadius: 4, fontSize: "0.8125rem", color: "var(--adm-text)" }}>lib/db.ts</code>:</p>
        <div style={CODE_STYLE}>{`import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host:     process.env.DB_HOST || 'localhost',
  port:     parseInt(process.env.DB_PORT || '3306'),
  user:     process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'brandthink',
  waitForConnections: true,
  connectionLimit: 10,
});

export default pool;`}</div>

        <p style={{ ...P_STYLE, marginTop: 16 }}>Replace JSON reads in API routes with MySQL queries. Example for contacts:</p>
        <div style={CODE_STYLE}>{`// Before (JSON):
const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));

// After (MySQL):
import pool from '@/lib/db';
const [rows] = await pool.query('SELECT * FROM contacts ORDER BY created_at DESC');`}</div>
      </div>

      {/* Step 5 */}
      <div style={SECTION_STYLE}>
        <h2 style={H2_STYLE}>
          <span style={{ width: 28, height: 28, borderRadius: "50%", background: "#E8312A", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 800, flexShrink: 0 }}>5</span>
          Migrate Existing JSON Data to MySQL
        </h2>
        <p style={P_STYLE}>Run this Node.js script to import your existing JSON data into MySQL:</p>
        <div style={CODE_STYLE}>{`// scripts/migrate-to-mysql.js
const mysql = require('mysql2/promise');
const fs    = require('fs');
const path  = require('path');

async function migrate() {
  const conn = await mysql.createConnection({
    host: 'localhost', user: 'root',
    password: 'YOUR_PASSWORD', database: 'brandthink',
  });

  // Migrate posts
  const posts = JSON.parse(fs.readFileSync('data/posts.json'));
  for (const p of posts) {
    await conn.execute(
      'INSERT IGNORE INTO posts (id,title,slug,content,excerpt,category,tags,cover_image,status,featured,read_time,published_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',
      [p.id, p.title, p.slug, p.content, p.excerpt, p.category,
       JSON.stringify(p.tags), p.coverImage, p.status, p.featured ? 1 : 0,
       p.readTime, p.publishedAt]
    );
  }
  console.log('Posts migrated:', posts.length);

  // Migrate contacts
  const { contacts } = JSON.parse(fs.readFileSync('data/contacts.json'));
  for (const c of contacts) {
    await conn.execute(
      'INSERT IGNORE INTO contacts (id,name,email,company,budget,message,created_at) VALUES (?,?,?,?,?,?,?)',
      [c.id, c.name, c.email, c.company, c.budget, c.message, c.createdAt]
    );
  }
  console.log('Contacts migrated:', contacts.length);

  await conn.end();
  console.log('Migration complete!');
}

migrate().catch(console.error);`}</div>
        <p style={{ ...P_STYLE, marginTop: 12 }}>Run with: <code style={{ background: "rgba(255,255,255,0.08)", padding: "1px 6px", borderRadius: 4, fontSize: "0.8125rem", color: "var(--adm-text)" }}>node scripts/migrate-to-mysql.js</code></p>
      </div>

      {/* phpMyAdmin Tips */}
      <div style={SECTION_STYLE}>
        <h2 style={H2_STYLE}>
          <span style={{ fontSize: "1.25rem" }}>💡</span>
          phpMyAdmin Quick Reference
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {[
            ["View all records", "Click table → Browse tab"],
            ["Run custom SQL", "SQL tab → type query → Go"],
            ["Import CSV/SQL", "Import tab → Choose file → Go"],
            ["Export database", "Export tab → Quick method → Go"],
            ["Search records", "Search tab → enter criteria"],
            ["Edit a record", "Click pencil icon on any row"],
          ].map(([action, howto]) => (
            <div key={action as string} style={{ padding: "12px 16px", background: "var(--adm-card)", borderRadius: 8 }}>
              <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#E8312A", marginBottom: 4 }}>{action}</div>
              <div style={{ fontSize: "0.8125rem", color: "var(--adm-muted2)" }}>{howto}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Note */}
      <div style={{ ...SECTION_STYLE, background: "rgba(251,146,60,0.05)", border: "1px solid rgba(251,146,60,0.15)" }}>
        <h2 style={{ ...H2_STYLE, color: "#FB923C" }}>⚠️ For Production Deployments</h2>
        <p style={P_STYLE}>
          When deploying to Vercel or any cloud platform, use a managed MySQL service instead of localhost:
        </p>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {[
            ["PlanetScale", "Free tier, MySQL-compatible, scales automatically"],
            ["Railway", "Cheap MySQL with one-click deploy"],
            ["AWS RDS", "Enterprise-grade, use free tier for dev"],
            ["Supabase", "Postgres (not MySQL) but excellent free tier"],
          ].map(([name, desc]) => (
            <li key={name as string} style={LI_STYLE}>
              <strong style={{ color: "var(--adm-text)" }}>{name}</strong> — {desc}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
