import { useEffect, useState, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

import nyscImage1 from "@/assets/nysc-hero-new-1.jpg";
import nyscImage2 from "@/assets/nysc-hero-new-2.jpg";
import nyscImage3 from "@/assets/nysc-hero-1.jpg";
import nyscImage4 from "@/assets/nysc-hero-2.jpg";

const images = [nyscImage1, nyscImage2, nyscImage3, nyscImage4];

export const HeroCarousel = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 4000, stopOnInteraction: false }),
  ]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <div className="absolute inset-0 w-full h-full">
      <div ref={emblaRef} className="overflow-hidden h-full">
        <div className="flex h-full">
          {images.map((src, index) => (
            <div
              key={index}
              className="relative min-w-0 flex-[0_0_100%] h-full"
            >
              <img
                src={src}
                alt={`NYSC orientation camp scene ${index + 1}`}
                className="h-full w-full object-cover"
              />
              {/* Dark overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/50 to-background/80" />
            </div>
          ))}
        </div>
      </div>
      
      {/* Dots Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {images.map((_, index) => (
          <button
            key={index}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === selectedIndex
                ? "w-6 bg-primary"
                : "w-2 bg-primary/40"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
