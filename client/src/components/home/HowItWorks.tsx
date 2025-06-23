import { Car, Wrench, CheckCircle, Search, MessageSquare, Calendar, Zap } from "lucide-react";

const HowItWorks = () => {
  return (
    <section className="py-20 bg-background relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-accent/5 rounded-full blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-16">
          <div className="inline-flex items-center bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Zap className="h-4 w-4 mr-2" />
            Simple Process
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Get Your Car Fixed in 
            <span className="text-primary"> 3 Easy Steps</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            From posting your repair needs to getting your car back on the road – 
            we've streamlined the entire automotive service experience.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {/* Step 1 */}
          <div className="relative group">
            <div className="text-center">
              <div className="relative mx-auto w-20 h-20 mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/70 rounded-2xl rotate-6 group-hover:rotate-12 transition-transform duration-300"></div>
                <div className="relative w-full h-full bg-primary rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Search className="h-9 w-9 text-primary-foreground" />
                </div>
                <div className="absolute -top-2 -right-2 bg-accent text-accent-foreground text-sm font-bold w-8 h-8 rounded-full flex items-center justify-center">1</div>
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">Describe Your Issue</h3>
              <p className="text-muted-foreground leading-relaxed">
                Tell us what's wrong with your car. Upload photos, specify your location, 
                and describe the symptoms you're experiencing.
              </p>
            </div>
            
            {/* Connection Line */}
            <div className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-primary to-transparent transform translate-x-6"></div>
          </div>
          
          {/* Step 2 */}
          <div className="relative group">
            <div className="text-center">
              <div className="relative mx-auto w-20 h-20 mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-accent to-accent/70 rounded-2xl rotate-6 group-hover:rotate-12 transition-transform duration-300"></div>
                <div className="relative w-full h-full bg-accent rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <MessageSquare className="h-9 w-9 text-accent-foreground" />
                </div>
                <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-sm font-bold w-8 h-8 rounded-full flex items-center justify-center">2</div>
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">Get Multiple Quotes</h3>
              <p className="text-muted-foreground leading-relaxed">
                Receive competitive bids from verified mechanics in your area. 
                Compare prices, read reviews, and check credentials.
              </p>
            </div>
            
            {/* Connection Line */}
            <div className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-accent to-transparent transform translate-x-6"></div>
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
