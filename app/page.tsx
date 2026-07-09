import Navbar from '@/components/home/Navbar'
import HeroSection from '@/components/home/HeroSection'
import AboutSection from '@/components/home/AboutSection'
import ServicesSection from '@/components/home/ServicesSection'
import TeamSection from '@/components/home/TeamSection'
import FAQSection from '@/components/home/FAQSection'
import ContactSection from '@/components/home/ContactSection'
import Footer from '@/components/home/Footer'

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <HeroSection />
      <AboutSection />
      <ServicesSection />
      <TeamSection />
      <FAQSection />
      <ContactSection />
      <Footer />
    </main>
  )
}
