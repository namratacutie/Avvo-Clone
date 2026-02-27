import React from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import PracticeAreas from './components/PracticeAreas'
import HowItWorks from './components/HowItWorks'
import FeaturedLawyers from './components/FeaturedLawyers'
import QASection from './components/QASection'
import LegalGuides from './components/LegalGuides'
import ReviewsSection from './components/ReviewsSection'
import Footer from './components/Footer'
import Lenis from 'lenis'

const App = () => {

  // Initialize Lenis
  const lenis = new Lenis();

  // Use requestAnimationFrame to continuously update the scroll
  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }

  requestAnimationFrame(raf);

  return (
    <>
      <Navbar />
      <Hero />
      <PracticeAreas />
      <HowItWorks />
      <FeaturedLawyers />
      <QASection />
      <LegalGuides />
      <ReviewsSection />
      <Footer />
    </>
  )
}

export default App