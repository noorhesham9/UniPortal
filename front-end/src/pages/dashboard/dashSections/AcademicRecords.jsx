import React from 'react';

const AcademicRecords = () => {
  return (
    <div className="bg-background text-on-surface min-h-screen pb-24">
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 bg-surface/60 backdrop-blur-xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.12)]">
        <div className="flex justify-between items-center px-6 py-4 w-full">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-surface-container-high">
              <img alt="Student profile" className="w-full h-full object-cover" data-alt="portrait of a young student with a friendly expression in a modern architectural setting with soft lighting" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA-RkoxjPtkxDGmwbpbc2D0vLfXkWEWb7Wu4xhqt_pWzigxmAEbhnN05hKuuNe2_-q7_e92T4sIWbcM8Lc5_t6EuvPod8K9KM3Z1iU2gufUiPGWekmy1HD-eUsyBh9Xia2WsfhYfZNO7qi0A165R_c8Xz9Q1hpEzzF0eS5u207qwMGU7LfD-jQj6vupytOu3_j0DtWWniHlY7HDq-DfW_vHPSXwxJpAoeir2aYH5uyAjnDGSH-FovApxx2NtLSjZk2VaudRMsnLiefu" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-primary font-headline">LUMEN</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-on-surface hover:bg-surface-container-high p-2 rounded-lg transition-colors active:scale-95 duration-200">
              <span className="material-symbols-outlined">notifications</span>
            </button>
          </div>
        </div>
      </header>
      <main className="pt-24 px-6">
        {/* Hero Section: GPA Display */}
        <section className="relative mb-10 overflow-hidden">
          <div className="bg-surface-container-low rounded-[2rem] p-8 relative z-10 overflow-hidden">
            {/* Abstract background decoration */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-[80px]"></div>
            <div className="flex flex-col items-center justify-center text-center">
              <div className="relative w-48 h-48 mb-6 flex items-center justify-center">
                {/* SVG Progress Ring */}
                <svg className="w-full h-full transform -rotate-90">
                  <circle className="text-surface-variant/30" cx="96" cy="96" fill="transparent" r="88" stroke="currentColor" strokeWidth="12"></circle>
                  <circle cx="96" cy="96" fill="transparent" r="88" stroke="url(#gpaGradient)" strokeDasharray="552.9" strokeDashoffset="138" strokeLinecap="round" strokeWidth="12"></circle>
                  <defs>
                    <linearGradient id="gpaGradient" x1="0%" x2="100%" y1="0%" y2="0%">
                      <stop offset="0%" style={{ stopColor: '#ffd16c' }}></stop>
                      <stop offset="100%" style={{ stopColor: '#fdc003' }}></stop>
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-black font-headline tracking-tighter text-primary">3.85</span>
                  <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant opacity-60">Cumulative GPA</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-8 w-full max-w-xs">
                <div className="flex flex-col">
                  <span className="text-2xl font-bold font-headline text-on-surface">124</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Credits Earned</span>
                </div>
                <div className="flex flex-col border-l border-outline-variant/20">
                  <span className="text-2xl font-bold font-headline text-on-surface">A</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Avg Grade</span>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* Semester History */}
        <section className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-bold font-headline text-primary tracking-tight">Academic History</h2>
            <span className="text-xs font-bold text-on-surface-variant/60 uppercase tracking-widest">8 Semesters</span>
          </div>
          {/* Semester Entry: Spring 2024 (Active/Current placeholder) */}
          <div className="bg-surface-container-high rounded-[1.5rem] p-5 shadow-lg group transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold font-headline text-on-surface">Spring 2024</h3>
                <p className="text-xs text-on-surface-variant font-medium">Current Term • Full-Time</p>
              </div>
              <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter">
                In Progress
              </div>
            </div>
            <div className="flex gap-4 items-center">
              <div className="flex-1 bg-surface-variant/30 rounded-xl p-3">
                <span className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Semester GPA</span>
                <span className="text-xl font-bold font-headline text-primary">3.92</span>
              </div>
              <div className="flex-1 bg-surface-variant/30 rounded-xl p-3">
                <span className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Credits</span>
                <span className="text-xl font-bold font-headline text-on-surface">16.0</span>
              </div>
            </div>
            <button className="w-full mt-4 bg-primary text-on-primary font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-[0.98]">
              <span className="text-sm font-bold uppercase tracking-widest">View Details</span>
              <span className="material-symbols-outlined text-sm">arrow_forward_ios</span>
            </button>
          </div>
          {/* Semester Entry: Fall 2023 */}
          <div className="bg-surface-container-low rounded-[1.5rem] p-5 hover:bg-surface-container-high transition-colors duration-300">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-surface-variant flex items-center justify-center">
                  <span className="material-symbols-outlined text-on-surface-variant">school</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold font-headline text-on-surface">Fall 2023</h3>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-on-surface-variant">GPA: <b className="text-on-surface">3.80</b></span>
                    <span className="text-xs text-on-surface-variant">Credits: <b className="text-on-surface">15.0</b></span>
                  </div>
                </div>
              </div>
              <button className="w-10 h-10 rounded-full border border-outline-variant/20 flex items-center justify-center text-on-surface-variant hover:text-primary active:scale-90 transition-all">
                <span className="material-symbols-outlined">expand_more</span>
              </button>
            </div>
          </div>
          {/* Semester Entry: Spring 2023 */}
          <div className="bg-surface-container-low rounded-[1.5rem] p-5 hover:bg-surface-container-high transition-colors duration-300">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-surface-variant flex items-center justify-center">
                  <span className="material-symbols-outlined text-on-surface-variant">history_edu</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold font-headline text-on-surface">Spring 2023</h3>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-on-surface-variant">GPA: <b className="text-on-surface">3.75</b></span>
                    <span className="text-xs text-on-surface-variant">Credits: <b className="text-on-surface">18.0</b></span>
                  </div>
                </div>
              </div>
              <button className="w-10 h-10 rounded-full border border-outline-variant/20 flex items-center justify-center text-on-surface-variant hover:text-primary transition-all">
                <span className="material-symbols-outlined">expand_more</span>
              </button>
            </div>
          </div>
          {/* Semester Entry: Fall 2022 */}
          <div className="bg-surface-container-low rounded-[1.5rem] p-5 hover:bg-surface-container-high transition-colors duration-300">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-surface-variant flex items-center justify-center">
                  <span className="material-symbols-outlined text-on-surface-variant">verified</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold font-headline text-on-surface">Fall 2022</h3>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-on-surface-variant">GPA: <b className="text-on-surface">3.90</b></span>
                    <span className="text-xs text-on-surface-variant">Credits: <b className="text-on-surface">14.0</b></span>
                  </div>
                </div>
              </div>
              <button className="w-10 h-10 rounded-full border border-outline-variant/20 flex items-center justify-center text-on-surface-variant hover:text-primary transition-all">
                <span className="material-symbols-outlined">expand_more</span>
              </button>
            </div>
          </div>
          {/* More Records Button */}
          <button className="w-full py-4 text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-[0.3em] hover:text-primary transition-colors">
            Load Older Records
          </button>
        </section>
      </main>
      {/* BottomNavBar */}
      <nav className="fixed bottom-0 w-full z-50 bg-surface/80 backdrop-blur-2xl rounded-t-[24px] shadow-[0_-10px_30px_rgba(0,0,0,0.3)]">
        <div className="flex justify-around items-center h-20 px-4 pb-safe w-full">
          {/* Dashboard */}
          <a className="flex flex-col items-center justify-center text-on-surface/60 px-4 py-2 hover:text-primary transition-all active:scale-90 duration-200" href="#">
            <span className="material-symbols-outlined mb-1">dashboard</span>
            <span className="font-manrope text-[10px] font-semibold tracking-wide uppercase">Dashboard</span>
          </a>
          {/* Records (ACTIVE) */}
          <a className="flex flex-col items-center justify-center text-primary bg-primary/10 rounded-xl px-4 py-2 transition-all active:scale-90 duration-200" href="#">
            <span className="material-symbols-outlined mb-1">description</span>
            <span className="font-manrope text-[10px] font-semibold tracking-wide uppercase">Records</span>
          </a>
          {/* Schedule */}
          <a className="flex flex-col items-center justify-center text-on-surface/60 px-4 py-2 hover:text-primary transition-all active:scale-90 duration-200" href="#">
            <span className="material-symbols-outlined mb-1">calendar_month</span>
            <span className="font-manrope text-[10px] font-semibold tracking-wide uppercase">Schedule</span>
          </a>
          {/* Settings */}
          <a className="flex flex-col items-center justify-center text-on-surface/60 px-4 py-2 hover:text-primary transition-all active:scale-90 duration-200" href="#">
            <span className="material-symbols-outlined mb-1">settings</span>
            <span className="font-manrope text-[10px] font-semibold tracking-wide uppercase">Settings</span>
          </a>
        </div>
      </nav>
    </div>
  );
};

export default AcademicRecords;