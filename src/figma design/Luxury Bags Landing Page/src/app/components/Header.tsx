import { ShoppingBag, Search, User, Menu } from 'lucide-react';

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-2xl font-serif tracking-wider">LUXÉ</h1>
          </div>

          {/* Navigation - Hidden on mobile */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-sm tracking-wide hover:text-gray-600 transition-colors">
              New Arrivals
            </a>
            <a href="#" className="text-sm tracking-wide hover:text-gray-600 transition-colors">
              Collections
            </a>
            <a href="#" className="text-sm tracking-wide hover:text-gray-600 transition-colors">
              About
            </a>
            <a href="#" className="text-sm tracking-wide hover:text-gray-600 transition-colors">
              Contact
            </a>
          </nav>

          {/* Icons */}
          <div className="flex items-center space-x-6">
            <button className="hover:text-gray-600 transition-colors" aria-label="Search">
              <Search size={20} />
            </button>
            <button className="hover:text-gray-600 transition-colors" aria-label="Account">
              <User size={20} />
            </button>
            <button className="hover:text-gray-600 transition-colors" aria-label="Shopping bag">
              <ShoppingBag size={20} />
            </button>
            <button className="md:hidden hover:text-gray-600 transition-colors" aria-label="Menu">
              <Menu size={20} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
