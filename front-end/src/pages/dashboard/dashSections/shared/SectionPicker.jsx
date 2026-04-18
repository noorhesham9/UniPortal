import { useEffect, useRef, useState } from "react";
import { FiChevronDown, FiCheck, FiSearch } from "react-icons/fi";
import "./SectionPicker.css";

export default function SectionPicker({ sections, value, onChange }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
    else setQuery("");
  }, [open]);

  const filtered = sections.filter((s) => {
    const q = query.toLowerCase();
    return (
      !q ||
      s.course_id?.code?.toLowerCase().includes(q) ||
      s.course_id?.title?.toLowerCase().includes(q) ||
      String(s.sectionNumber).includes(q) ||
      s.day?.toLowerCase().includes(q)
    );
  });

  const selected = sections.find((s) => s._id === value);
  const triggerLabel = selected
    ? `${selected.course_id?.code} — Sec ${selected.sectionNumber} · ${selected.day} ${selected.start_time}`
    : "Choose a section";

  return (
    <div className="sp-wrap" ref={ref}>
      <button
        type="button"
        className={`sp-trigger ${open ? "open" : ""}`}
        onClick={() => setOpen((v) => !v)}
      >
        <span className={value ? "sp-trigger-value" : "sp-trigger-placeholder"}>
          {triggerLabel}
        </span>
        <FiChevronDown className={`sp-chevron ${open ? "rotated" : ""}`} />
      </button>

      {open && (
        <div className="sp-dropdown">
          {/* Search input */}
          <div className="sp-search-wrap">
            <FiSearch className="sp-search-icon" />
            <input
              ref={inputRef}
              className="sp-search"
              placeholder="Search by code, title, day..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className="sp-list">
            {filtered.length === 0 ? (
              <div className="sp-empty">No sections match "{query}"</div>
            ) : (
              filtered.map((s) => {
                const isSelected = s._id === value;
                return (
                  <button
                    key={s._id}
                    type="button"
                    className={`sp-item ${isSelected ? "selected" : ""}`}
                    onClick={() => { onChange(s._id); setOpen(false); }}
                  >
                    <div className="sp-item-left">
                      <span className="sp-item-code">
                        {s.course_id?.code} — Sec {s.sectionNumber}
                      </span>
                      <span className="sp-item-sub">
                        {s.course_id?.title} · {s.day} {s.start_time}–{s.end_time}
                      </span>
                    </div>
                    {isSelected && <FiCheck className="sp-check" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
