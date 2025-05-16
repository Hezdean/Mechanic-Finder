import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Rating from "@/components/ui/rating";

const testimonials = [
  {
    id: 1,
    name: "Jennifer K.",
    role: "Vehicle Owner",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
    rating: 50, // 5.0 stars
    text: "I was stranded with a dead battery and no one to help. Posted on Same-Shit and within an hour, a mobile mechanic came and installed a new battery. The whole process was so simple and transparent!"
  },
  {
    id: 2,
    name: "David M.",
    role: "Certified Mechanic",
    image: "https://images.unsplash.com/photo-1566492031773-4f4e44671857",
    rating: 50, // 5.0 stars
    text: "As an independent mechanic, finding steady work used to be challenging. Same-Shit has completely changed that. The platform brings clients directly to me, handles payments, and lets me focus on what I do best—fixing cars."
  }
];

const Testimonials = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-neutral-900">What Our Users Say</h2>
          <p className="mt-4 text-xl text-neutral-600 max-w-2xl mx-auto">Hear from vehicle owners and mechanics who use our platform</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-neutral-50 rounded-lg p-8">
              <div className="flex items-center mb-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={testimonial.image} alt={testimonial.name} />
                  <AvatarFallback>{testimonial.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold">{testimonial.name}</h3>
                  <p className="text-neutral-500 text-sm">{testimonial.role}</p>
                </div>
              </div>
              <div className="mb-4">
                <Rating value={testimonial.rating} showCount={false} />
              </div>
              <p className="text-neutral-600 italic">"{testimonial.text}"</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
