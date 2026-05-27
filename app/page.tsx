import Hero            from "@/components/sections/Hero";
import TextWithImages  from "@/components/sections/TextWithImages";
import HorizontalScroll from "@/components/sections/HorizontalScroll";
import Works           from "@/components/sections/Works";
import Services        from "@/components/sections/Services";
import Metrics         from "@/components/sections/Metrics";
import Brands          from "@/components/sections/Brands";
import GridImages      from "@/components/sections/GridImages";
import BlogSection     from "@/components/sections/BlogSection";
import Footer          from "@/components/sections/Footer";

export default function Home() {
  return (
    <>
      <Hero />
      <TextWithImages />
      <HorizontalScroll />
      <Works />
      <Services />
      <Metrics />
      <Brands />
      <GridImages />
      <BlogSection />
      <Footer />
    </>
  );
}
