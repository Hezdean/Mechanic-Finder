import { Car, Wrench, CheckCircle } from "lucide-react";

const HowItWorks = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-neutral-900">How It Works</h2>
          <p className="mt-4 text-xl text-neutral-600 max-w-2xl mx-auto">Get your vehicle repaired in three simple steps</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="text-center">
            <div className="mx-auto w-16 h-16 flex items-center justify-center bg-primary-100 text-primary-500 rounded-full mb-4">
              <Car className="h-7 w-7" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Post Your Repair Needs</h3>
            <p className="text-neutral-600">Describe your vehicle issue, upload photos, and specify your location.</p>
          </div>
          
          {/* Step 2 */}
          <div className="text-center">
            <div className="mx-auto w-16 h-16 flex items-center justify-center bg-primary-100 text-primary-500 rounded-full mb-4">
              <Wrench className="h-7 w-7" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Receive Bids from Mechanics</h3>
            <p className="text-neutral-600">Compare quotes, reviews, and credentials from qualified mechanics.</p>
          </div>
          
          {/* Step 3 */}
          <div className="text-center">
            <div className="mx-auto w-16 h-16 flex items-center justify-center bg-primary-100 text-primary-500 rounded-full mb-4">
              <CheckCircle className="h-7 w-7" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Get Your Car Fixed</h3>
            <p className="text-neutral-600">Choose a mechanic, schedule the repair, and pay securely through our platform.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
