import React from "react";
import { Link } from "react-router-dom";
import { Button, Card } from "../components/common";

const Home: React.FC = () => {
  return (
    <div>
      {/* Hero Section */}
      <section
        className="relative bg-primary-green text-white py-32 px-4"
        style={{
          backgroundImage:
            "linear-gradient(rgba(26, 92, 42, 0.9), rgba(26, 92, 42, 0.9)), url(https://images.unsplash.com/photo-1605000797499-95a51c5269ae?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="container mx-auto text-center animate-fade-up">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 font-serif">
            Building the Digital Agricultural Economy for Africa
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            From Farm to Global Market, Seamlessly - Empowering Smallholder
            Farmers Through Technology
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/register?role=farmer">
              <Button variant="primary" size="lg">
                Join as Farmer
              </Button>
            </Link>
            <Link to="/marketplace">
              <Button variant="outline" size="lg">
                Browse Marketplace
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-light-green">
        <div className="container mx-auto px-4">
          <div className="section-title">
            <h2>Why Choose Agrivus?</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-8 text-center border-t-4 border-vibrant-green">
              <div className="w-20 h-20 bg-light-green rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-10 h-10 text-primary-green"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-primary-green mb-4 font-serif">
                Direct Market Access
              </h3>
              <p className="text-gray-600">
                Connect directly with buyers and eliminate middlemen. Get fair
                prices for your produce.
              </p>
            </Card>

            <Card className="p-8 text-center border-t-4 border-vibrant-green">
              <div className="w-20 h-20 bg-light-green rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-10 h-10 text-primary-green"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-primary-green mb-4 font-serif">
                Smart Logistics
              </h3>
              <p className="text-gray-600">
                AI-powered transport matching ensures efficient delivery at
                competitive rates.
              </p>
            </Card>

            <Card className="p-8 text-center border-t-4 border-vibrant-green">
              <div className="w-20 h-20 bg-light-green rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-10 h-10 text-primary-green"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-primary-green mb-4 font-serif">
                Secure Payments
              </h3>
              <p className="text-gray-600">
                Escrow-protected transactions with multiple payment options
                including EcoCash and ZIPIT.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-primary-green mb-6 font-serif">
            Ready to Transform Your Agricultural Business?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of farmers, buyers, and transporters already using
            Agrivus to grow their business.
          </p>
          <Link to="/register">
            <Button variant="primary" size="lg">
              Get Started Today
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
