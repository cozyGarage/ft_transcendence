import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-dark cyber-grid">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 p-6">
        <a href="/" className="flex items-center gap-3 w-fit">
          <img src="/images/logo.png" alt="ft_transcendence" className="w-12 h-12" />
          <span className="text-xl font-bold text-primary hidden sm:block">ft_transcendence</span>
        </a>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-6">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="relative z-10 p-6 text-center text-gray-500 text-sm">
        <p>© 2026 ft_transcendence. All rights reserved.</p>
      </footer>
    </div>
  );
}
