export function Newsletter() {
  return (
    <section className="py-24 bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl md:text-5xl font-serif mb-4 tracking-wide">
          Join Our World
        </h2>
        <p className="text-gray-300 mb-8 tracking-wide">
          Be the first to discover new collections and exclusive offers
        </p>
        
        <form className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
          <input
            type="email"
            placeholder="Enter your email"
            className="flex-1 px-6 py-4 bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
          />
          <button
            type="submit"
            className="px-8 py-4 bg-white text-black tracking-widest hover:bg-gray-100 transition-colors"
          >
            SUBSCRIBE
          </button>
        </form>
      </div>
    </section>
  );
}
