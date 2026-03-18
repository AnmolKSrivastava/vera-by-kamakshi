import { ImageWithFallback } from './figma/ImageWithFallback';

const products = [
  {
    id: 1,
    name: 'Classic Leather Tote',
    price: '$2,850',
    image: 'https://images.unsplash.com/photo-1760624294504-211e763ee0fb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcmVtaXVtJTIwdG90ZSUyMGJhZ3xlbnwxfHx8fDE3NzM0MjU2NjV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  },
  {
    id: 2,
    name: 'Evening Clutch',
    price: '$1,950',
    image: 'https://images.unsplash.com/photo-1758817991388-54a98d456317?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBjbHV0Y2glMjBiYWd8ZW58MXx8fHwxNzczNDI1NjY1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  },
  {
    id: 3,
    name: 'Signature Shoulder Bag',
    price: '$3,200',
    image: 'https://images.unsplash.com/photo-1760624294582-5341f33f9fa4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZXNpZ25lciUyMHNob3VsZGVyJTIwYmFnfGVufDF8fHx8MTc3MzQyNTY2NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  },
  {
    id: 4,
    name: 'Artisan Leather Bag',
    price: '$2,450',
    image: 'https://images.unsplash.com/photo-1760624294582-5341f33f9fa4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVnYW50JTIwbGVhdGhlciUyMGJhZ3xlbnwxfHx8fDE3NzM0MjU2NjR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  },
];

export function FeaturedProducts() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif mb-4 tracking-wide">
            Featured Collection
          </h2>
          <p className="text-gray-600 tracking-wide">
            Handpicked pieces that define sophistication
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <div
              key={product.id}
              className="group cursor-pointer"
            >
              <div className="relative overflow-hidden bg-gray-100 mb-4 aspect-[3/4]">
                <ImageWithFallback
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <h3 className="tracking-wide mb-2">{product.name}</h3>
              <p className="text-gray-600">{product.price}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <button className="border-2 border-black px-8 py-3 tracking-widest hover:bg-black hover:text-white transition-colors">
            VIEW ALL
          </button>
        </div>
      </div>
    </section>
  );
}
