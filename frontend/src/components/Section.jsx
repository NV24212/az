import React from 'react';

export default function Section({ id, title, children, subtitle }) {
  return (
    <section id={id} className="relative mx-auto w-full max-w-6xl px-4 sm:px-6 py-12 sm:py-16">
      <div className="rounded-20 border border-brand-border bg-white shadow-card">
        <div className="p-6 sm:p-10">
          {title && (
            <header className="mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-brand-text">{title}</h2>
              {subtitle && <p className="mt-2 text-brand-text-secondary">{subtitle}</p>}
            </header>
          )}
          {children}
        </div>
      </div>
    </section>
  )
}
