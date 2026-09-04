'use client';

import { useEffect, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';

type FieldMark = {
  id: number;
  x: number;
  y: number;
  rotation: number;
  scale: number;
};

const seedMarks: FieldMark[] = [
  { id: 1, x: 16, y: 30, rotation: -12, scale: 0.75 },
  { id: 2, x: 74, y: 24, rotation: 18, scale: 1.08 },
  { id: 3, x: 65, y: 73, rotation: -29, scale: 0.62 },
  { id: 4, x: 29, y: 70, rotation: 34, scale: 0.9 },
];

export default function Home() {
  const shellRef = useRef<HTMLElement>(null);
  const [burst, setBurst] = useState(0);
  const [joined, setJoined] = useState(false);
  const [marks, setMarks] = useState<FieldMark[]>(seedMarks);

  useEffect(() => {
    const root = document.documentElement;
    const onScroll = () => {
      const available = document.body.scrollHeight - window.innerHeight;
      const progress = available > 0 ? window.scrollY / available : 0;
      const heroProgress = Math.min(window.scrollY / window.innerHeight, 1);
      root.style.setProperty('--page-progress', String(progress));
      root.style.setProperty('--hero-y', `${heroProgress * -48}px`);
      root.style.setProperty('--hero-scale', String(1 - heroProgress * 0.2));
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('is-visible');
        });
      },
      { threshold: 0.18 },
    );

    document.querySelectorAll('[data-reveal]').forEach((element) => observer.observe(element));
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  const trackPointer = (event: ReactPointerEvent<HTMLElement>) => {
    const root = shellRef.current;
    if (!root) return;
    const nx = event.clientX / window.innerWidth - 0.5;
    const ny = event.clientY / window.innerHeight - 0.5;
    root.style.setProperty('--mouse-x', `${event.clientX}px`);
    root.style.setProperty('--mouse-y', `${event.clientY}px`);
    root.style.setProperty('--nx', String(nx));
    root.style.setProperty('--ny', String(ny));
    root.style.setProperty('--pointer-x', `${nx * 24}px`);
    root.style.setProperty('--pointer-y', `${ny * 20}px`);
    root.style.setProperty('--axis-x', `${nx * 18}px`);
    root.style.setProperty('--axis-y', `${ny * 18}px`);
    root.style.setProperty('--tilt', `${nx * 9}deg`);
    root.style.setProperty('--portal-x', `${nx * 20}px`);
    root.style.setProperty('--portal-y', `${ny * 20}px`);
    root.style.setProperty('--portal-rotate', `${nx * 30}deg`);
  };

  const addMark = (event: ReactPointerEvent<HTMLElement>) => {
    const target = event.target as HTMLElement;
    if (target.closest('button, a')) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    const id = Date.now();
    const rotation = ((id % 77) - 38) * 1.2;
    const scale = 0.62 + (id % 6) * 0.11;
    setMarks((current) => [...current.slice(-13), { id, x, y, rotation, scale }]);
  };

  return (
    <main className="site-shell" ref={shellRef} onPointerMove={trackPointer}>
      <div className="cursor-dot" aria-hidden="true">×</div>
      <div className="scroll-progress" aria-hidden="true"><span /></div>

      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="I × UX home">
          I <span>×</span> UX
        </a>
        <p>AN OPEN IDEA</p>
        <a className="enter-link" href="#join">
          JOIN <span aria-hidden="true">↘</span>
        </a>
      </header>

      <nav className="section-nav" aria-label="Page sections">
        <a href="#top"><span>01</span><i /></a>
        <a href="#multiply"><span>02</span><i /></a>
        <a href="#everyone"><span>03</span><i /></a>
        <a href="#join"><span>04</span><i /></a>
      </nav>

      <section className="hero" id="top" aria-labelledby="hero-title">
        <div className="hero-axis hero-axis-x" aria-hidden="true" />
        <div className="hero-axis hero-axis-y" aria-hidden="true" />
        <div className="hero-orbit hero-orbit-one" aria-hidden="true" />
        <div className="hero-orbit hero-orbit-two" aria-hidden="true" />

        <button
          className="hero-cross-wrap"
          type="button"
          onClick={() => setBurst((value) => value + 1)}
          aria-label="Activate the intersection"
        >
          <span className="hero-cross">×</span>
          <span className="cross-core" />
          <span className="cross-burst" key={burst} />
        </button>

        <h1 id="hero-title" className="hero-title">
          <span className="hero-i">I</span>
          <span className="sr-only"> multiplied by </span>
          <span className="hero-ux">UX</span>
        </h1>

        <p className="hero-kicker">EXPERIENCE<br />MULTIPLIES</p>
        <p className="hero-note">A shared symbol for<br />curious humans.</p>
        <p className="move-note" aria-hidden="true">MOVE / CLICK</p>

        <a className="scroll-cue" href="#multiply" aria-label="Explore I × UX">
          <span>SCROLL TO<br />TRANSFORM</span>
          <span className="scroll-arrow" aria-hidden="true">↓</span>
        </a>

        <div className="hero-index" aria-hidden="true">01 / 04</div>
      </section>

      <section className="multiply-panel" id="multiply" aria-labelledby="multiply-title">
        <div className="section-meta"><span>02 / MOTION</span><span>ONE + ONE = MORE</span></div>
        <div className="multiply-type" id="multiply-title" data-reveal>
          <span className="multiply-word word-top">EXPERIENCE</span>
          <span className="multiply-word word-bottom">MULTIPLIES</span>
        </div>
        <div className="geo-stage" aria-hidden="true">
          <span className="geo geo-square" />
          <span className="geo geo-circle" />
          <span className="geo geo-cross">×</span>
          <span className="geo geo-line" />
        </div>
        <p className="multiply-caption" data-reveal>WHEN THOUGHT MEETS CARE</p>
        <div className="kinetic-strip" aria-hidden="true">
          <div>DESIGN × PEOPLE × POSSIBILITY × DESIGN × PEOPLE × POSSIBILITY ×&nbsp;</div>
        </div>
      </section>

      <section className="connection-panel" aria-labelledby="curious-title">
        <div className="connection-copy" data-reveal>
          <p>02.5 / INTERSECTION</p>
          <h2 id="curious-title">MADE FOR<br /><em>CURIOUS</em><br />HUMANS</h2>
        </div>
        <div className="relationship" data-reveal aria-label="I multiplied by you">
          <span className="relationship-i">I</span>
          <div className="relationship-portal" aria-hidden="true">
            <span>×</span><i /><i />
          </div>
          <span className="relationship-you">YOU</span>
        </div>
        <p className="connection-note">MOVE THROUGH<br />THE MIDDLE.</p>
      </section>

      <section
        className="everyone-panel"
        id="everyone"
        aria-labelledby="everyone-title"
        onPointerDown={addMark}
      >
        <div className="section-meta dark-meta"><span>03 / PARTICIPATION</span><span>CLICK TO LEAVE A ×</span></div>
        <h2 id="everyone-title" className="everyone-title" data-reveal>
          <span>I × UX</span>
          <span>IS ALL</span>
          <span>OF US</span>
        </h2>
        <div className="marks" aria-hidden="true">
          {marks.map((mark) => (
            <span
              className="field-mark"
              key={mark.id}
              style={{
                left: `${mark.x}%`,
                top: `${mark.y}%`,
                transform: `translate(-50%, -50%) rotate(${mark.rotation}deg) scale(${mark.scale})`,
              }}
            >×</span>
          ))}
        </div>
        <p className="everyone-note" data-reveal>YOUR POINT OF VIEW<br />CHANGES THE WHOLE.</p>
      </section>

      <section className={`join-panel ${joined ? 'joined' : ''}`} id="join" aria-labelledby="join-title">
        <div className="join-corner join-corner-a" aria-hidden="true">×</div>
        <div className="join-corner join-corner-b" aria-hidden="true">×</div>
        <p className="join-pre">04 / THE BEGINNING</p>
        <h2 id="join-title" data-reveal>{joined ? 'YOU × US' : 'JOIN THE\nEXPERIMENT'}</h2>
        <button className="join-button" type="button" onClick={() => setJoined((value) => !value)}>
          <span>{joined ? 'KEEP IT MOVING' : 'STEP INSIDE'}</span>
          <span className="join-button-icon" aria-hidden="true">{joined ? '×' : '↗'}</span>
        </button>
        <p className="join-status" aria-live="polite">
          {joined ? 'THE INTERSECTION JUST CHANGED.' : 'NO GATEKEEPERS. JUST CURIOSITY.'}
        </p>
      </section>

      <footer>
        <a className="wordmark" href="#top">I <span>×</span> UX</a>
        <p>BETTER EXPERIENCES ARE CREATED TOGETHER.</p>
        <span>© {new Date().getFullYear()}</span>
      </footer>
    </main>
  );
}
