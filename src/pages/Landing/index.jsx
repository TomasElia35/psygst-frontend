import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Stats from './components/Stats';
import Features from './components/Features';
import HowItWorks from './components/HowItWorks';
import Testimonials from './components/Testimonials';
import DemoForm from './components/DemoForm';
import Footer from './components/Footer';
import './Landing.css';

const Landing = () => {
    return (
        <div className="landing-container">
            <Navbar />
            <main>
                <Hero />
                <Stats />
                <Features />
                <HowItWorks />
                <Testimonials />
                <DemoForm />
            </main>
            <Footer />
        </div>
    );
};

export default Landing;
