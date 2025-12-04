import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { HeroCarousel } from "@/components/HeroCarousel";
import { ArrowRight, Repeat, Search, Shield, Users, Zap, CheckCircle2 } from "lucide-react";

const Index = () => {
  const features = [
    {
      icon: Repeat,
      title: "Easy Swaps",
      description: "Create swap requests for items you need in seconds",
    },
    {
      icon: Search,
      title: "Smart Matching",
      description: "Our system finds perfect matches automatically",
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your data is protected with a secret code",
    },
    {
      icon: Zap,
      title: "Instant Results",
      description: "Get matched with compatible corps members quickly",
    },
  ];

  const steps = [
    {
      number: "01",
      title: "Create Request",
      description: "Enter your details and what you have vs. what you need",
    },
    {
      number: "02",
      title: "Find Matches",
      description: "Our system finds corps members with complementary needs",
    },
    {
      number: "03",
      title: "Connect & Swap",
      description: "Reach out to your match and exchange items",
    },
  ];

  const items = [
    "Khaki Jacket",
    "Khaki Trouser",
    "Jungle Boot",
    "Crested Vest",
    "White Shorts",
    "White Shirt",
    "Belt",
    "Socks",
    "Face Cap",
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section with Carousel Background */}
        <section className="relative overflow-hidden min-h-[600px] md:min-h-[700px]">
          {/* Carousel as Background */}
          <div className="absolute inset-0 z-0">
            <HeroCarousel />
          </div>
          
          {/* Content Overlay */}
          <div className="relative z-10 container py-16 md:py-24">
            <div className="mx-auto max-w-3xl text-center animate-slide-up">
              <div className="inline-flex items-center gap-2 rounded-full bg-background/80 backdrop-blur-sm px-4 py-2 text-sm font-medium text-primary mb-6">
                <Users className="h-4 w-4" />
                <span>For NYSC Corps Members</span>
              </div>
              
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground mb-6 leading-tight drop-shadow-lg">
                Swap Your Camp Items{" "}
                <span className="text-primary">Effortlessly</span>
              </h1>
              
              <p className="text-lg md:text-xl text-foreground/90 mb-8 max-w-2xl mx-auto bg-background/60 backdrop-blur-sm rounded-lg p-4">
                Got ill-fitting khaki, boots, or uniforms? Find other corps members to swap with instantly. 
                No registration required.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="xl" variant="hero">
                  <Link to="/create">
                    Create Swap Request
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild size="xl" variant="outline" className="bg-background/80 backdrop-blur-sm">
                  <Link to="/manage">
                    Manage My Request
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                Why Use NYSC Swap?
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                The simplest way to exchange orientation camp items with fellow corps members
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <Card 
                  key={feature.title} 
                  variant="interactive"
                  className="animate-slide-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardContent className="p-6">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-display font-bold text-lg text-foreground mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-16 md:py-24">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                How It Works
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Three simple steps to find your perfect swap
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {steps.map((step, index) => (
                <div 
                  key={step.number}
                  className="relative text-center animate-slide-up"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className="text-6xl md:text-7xl font-display font-extrabold text-primary/10 mb-2">
                    {step.number}
                  </div>
                  <h3 className="font-display font-bold text-xl text-foreground mb-2 -mt-6">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {step.description}
                  </p>
                  
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-8 left-[60%] w-[80%] border-t-2 border-dashed border-border" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Supported Items Section */}
        <section className="py-16 md:py-24 bg-primary text-primary-foreground">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                What You Can Swap
              </h2>
              <p className="opacity-80 max-w-xl mx-auto">
                All standard NYSC orientation camp items are supported
              </p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
              {items.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2 bg-primary-foreground/10 border border-primary-foreground/20 rounded-full px-4 py-2"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24">
          <div className="container">
            <Card variant="gradient" className="max-w-3xl mx-auto overflow-hidden">
              <CardContent className="p-8 md:p-12 text-center">
                <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
                  Ready to Find Your Perfect Swap?
                </h2>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  It only takes a minute to create a request. Start matching with corps members today!
                </p>
                <Button asChild size="lg" variant="hero">
                  <Link to="/create">
                    Get Started Now
                    <ArrowRight className="ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
