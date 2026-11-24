import { useCallback, useEffect, useState } from 'react';
import { MotionConfig } from 'framer-motion';
import { IntroContext } from './lib/hooks';
import { lockScroll } from './lib/lenis';
import Intro from './components/Intro';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Ribbons from './components/Ribbons';
import About from './components/About';
import Services from './components/Services';
import Gallery from './components/Gallery';
import Transformation from './components/Transformation';
import Experience from './components/Experience';
import Reviews from './components/Reviews';
import Faq from './components/Faq';
import CtaBanner from './components/CtaBanner';
import Visit from './components/Visit';
import Footer from './components/Footer';

export default function App() {
  // 'playing' → 'revealing' → 'done'
  const [intro, setIntro] = useState('playing');
  const reveal = useCallback(() => setIntro('revealing'), []);
  const done = useCallback(() => setIntro('done'), []);
  const finished = intro === 'done';

  useEffect(() => {
    if (finished) return undefined;
    lockScroll(true);
    return () => lockScroll(false);
  }, [finished]);

  return (
    // Full animation for every visitor, whatever their device's motion setting.
    <MotionConfig reducedMotion="never">
      <IntroContext.Provider value={intro}>
        {!finished && <Intro onReveal={reveal} onDone={done} />}
        <Navbar />
        <main>
          <Hero />
          <Ribbons />
          <About />
          <Services />
          <Gallery />
          <Transformation />
          <Experience />
          <Reviews />
          <Faq />
          <CtaBanner />
          <Visit />
        </main>
        <Footer />
      </IntroContext.Provider>
    </MotionConfig>
  );
}
