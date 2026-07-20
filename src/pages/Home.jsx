import React from 'react'
import HeroSection from '../components/HeroSection'
// import Heroimg from '../assets/prabin.jpeg'
import About from '../components/About'
import TechMarquee from '../components/Techmarquee'
import Work from '../components/Work'
import SkillsSection from '../components/SkillsSection'
import ContactSection from '../components/ContactSection'
import Navbar from '../components/Navbar'
import Footer from '../components/FooterSection'

function Home() {
  return (
    <div>
      <Navbar/>
      <section id='home'>
    <HeroSection 
  />
  </section>

    <TechMarquee/>
    <About/>
    <section id='work'>
      <Work/>
      </section> 
    <section id='skills'>
      <SkillsSection/>
      </section> 
    <section id='contact'>
      <ContactSection/>
      </section> 
      <Footer/>
    </div>
  )
}

export default Home
