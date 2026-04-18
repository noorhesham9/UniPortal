import { useEffect, useState } from "react";
import { getCollegeInfo } from "../../services/publicServices";
import PublicNav from "../Home/PublicNav";
import "./AboutPage.css";

export default function AboutPage() {
  const [info, setInfo] = useState(null);

  useEffect(() => {
    document.body.classList.add("public-page");
    return () => document.body.classList.remove("public-page");
  }, []);

  useEffect(() => {
    getCollegeInfo().then((d) => setInfo(d.info)).catch(() => {});
  }, []);

  return (
    <div className="about-page">
      <PublicNav />

      {/* ── Hero ── */}
      <section className="about-hero">
        <div className="about-hero-bar" />
        <h1>عن الكلية</h1>
        <p>{info?.aboutText || "كلية متميزة تسعى لتقديم تعليم أكاديمي رفيع المستوى."}</p>
      </section>

      {/* ── Vision & Mission ── */}
      {(info?.vision || info?.mission) && (
        <section className="about-vm">
          {info.vision && (
            <div className="about-vm-card">
              <span className="about-vm-icon">🎯</span>
              <strong>الرؤية</strong>
              <p>{info.vision}</p>
            </div>
          )}
          {info.mission && (
            <div className="about-vm-card">
              <span className="about-vm-icon">📌</span>
              <strong>الرسالة</strong>
              <p>{info.mission}</p>
            </div>
          )}
        </section>
      )}

      {/* ── Dean & Vice ── */}
      <section className="about-messages">
        <MessageCard data={info?.deanMessage} fallbackTitle="عميد الكلية" />
        <MessageCard data={info?.viceMessage} fallbackTitle="وكيل الكلية" />
      </section>

      {/* ── Footer ── */}
      <footer className="about-footer">
        <p>© 2024 UniPortal Academic Institution. All rights reserved.</p>
      </footer>
    </div>
  );
}

function MessageCard({ data, fallbackTitle }) {
  if (!data?.message) return null;
  return (
    <div className="about-msg-card">
      <div className="about-msg-top">
        {data.imageUrl ? (
          <img src={data.imageUrl} alt={data.name} className="about-msg-avatar" />
        ) : (
          <div className="about-msg-avatar-placeholder">
            {data.name ? data.name[0] : "👤"}
          </div>
        )}
        <div>
          <h3>{data.name || fallbackTitle}</h3>
          <span>{data.title || fallbackTitle}</span>
        </div>
      </div>
      <div className="about-msg-divider" />
      <p className="about-msg-body">{data.message}</p>
    </div>
  );
}
