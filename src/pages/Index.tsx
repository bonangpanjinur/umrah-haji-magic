import { Link } from 'react-router-dom';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { HeroSection } from '@/components/home/HeroSection';
import { FeaturedPackages } from '@/components/home/FeaturedPackages';
import { WhyChooseUs } from '@/components/home/WhyChooseUs';
import { Testimonials } from '@/components/home/Testimonials';
import { CTASection } from '@/components/home/CTASection';

const Index = () => {
  return (
    <PublicLayout>
      <HeroSection />
      <FeaturedPackages />
      <WhyChooseUs />
      <Testimonials />
      <CTASection />
    </PublicLayout>
  );
};

export default Index;
