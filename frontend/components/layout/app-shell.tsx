'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { navigationItems } from '../../constants/navigation';
import { cn } from '../../lib/utils';

const navIcons: Record<string, string> = {
  '/': '⌂',
  '/members': '◫',
  '/relationships': '↔',
  '/family-tree': '❋',
  '/events': '◫',
  '/important-dates': '◫',
  '/reports': '▣',
  '/about-developer': '◉',
};

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f4f0ec] text-slate-900">
      <button
        type="button"
        aria-label="Open navigation"
        onClick={() => setMobileOpen(true)}
        className="fixed right-4 top-4 z-50 flex h-11 w-11 items-center justify-center rounded-xl border border-[#1b3a49] bg-[#071f2d] text-lg text-white shadow-lg transition hover:scale-[1.02] lg:hidden"
      >
        ☰
      </button>

      <button
        type="button"
        aria-label="Close navigation"
        onClick={() => setMobileOpen(false)}
        className={cn(
          'fixed inset-0 z-30 bg-slate-950/45 transition lg:hidden',
          mobileOpen ? 'block' : 'hidden',
        )}
      />

      <div className="flex min-h-screen">
        <aside
          className={cn(
            'fixed inset-y-0 left-0 z-40 flex w-[280px] flex-col border-r border-[#1b3a49] bg-[#071f2d] text-slate-100 transition-transform duration-200 lg:static lg:translate-x-0',
            mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          )}
        >
          <div className="flex flex-col px-5 pb-4 pt-5">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#0d2d3f] text-lg shadow-inner shadow-white/10">
                🌳
              </div>
              <div>
                <div className="text-[0.7rem] uppercase tracking-[0.2em] text-slate-300/80">Family hierarchy</div>
                <div className="text-xl font-bold text-white">Family Tree</div>
              </div>
            </div>
          </div>

          <nav className="flex-1 space-y-1 px-3 pb-4 pt-3">
            {navigationItems.map((item) => {
              const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200',
                    active
                      ? 'bg-[#0f5a62] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white',
                  )}
                  onClick={() => setMobileOpen(false)}
                >
                  <span className={cn('flex h-6 w-6 items-center justify-center rounded-md text-xs', active ? 'bg-white/10' : 'bg-white/5')}>
                    {navIcons[item.href] ?? '•'}
                  </span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-white/10 px-4 py-5">
            <div className="flex items-center justify-center gap-2 text-xs uppercase tracking-[0.18em] text-slate-300/80">
              <span>Our Family</span>
              <span className="text-slate-500">•</span>
              <span>Our Legacy</span>
            </div>
          </div>
        </aside>

        <div className="flex min-h-screen flex-1 flex-col">
          <header className="border-b border-slate-200/70 bg-[#f4f0ec]/80 px-3 py-3 backdrop-blur lg:hidden">
            <div className="flex items-center justify-end">
              <button
                type="button"
                aria-label="Open menu"
                onClick={() => setMobileOpen(true)}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-lg text-slate-700 shadow-sm"
              >
                ☰
              </button>
            </div>
          </header>

          <main className="flex-1 px-3 py-3 sm:px-5 lg:px-7">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
