"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function ScrollRevealProvider() {
  const pathname = usePathname();

  useEffect(() => {
    const scrollRoot =
      document.querySelector<HTMLElement>('[data-scroll-root="true"]') ||
      document.scrollingElement ||
      document.documentElement;

    const explicitElements = Array.from(
      scrollRoot.querySelectorAll<HTMLElement>("[data-scroll-reveal]"),
    );
    const directChildren = Array.from(scrollRoot.children).filter(
      (child): child is HTMLElement => child instanceof HTMLElement,
    );
    const elements = Array.from(
      new Set([...explicitElements, ...directChildren]),
    );

    if (elements.length === 0) {
      return;
    }

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reducedMotion) {
      elements.forEach((element) => {
        element.classList.add("scroll-reveal-visible");
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = entry.target as HTMLElement;
            target.classList.add("scroll-reveal-visible");
            observer.unobserve(target);
          }
        });
      },
      {
        threshold: 0.14,
        rootMargin: "0px 0px -8% 0px",
        root:
          scrollRoot === document.scrollingElement ||
          scrollRoot === document.documentElement
            ? null
            : scrollRoot,
      },
    );

    elements.forEach((element, index) => {
      element.classList.add("scroll-reveal");
      element.style.setProperty("--scroll-reveal-delay", `${index * 70}ms`);
      observer.observe(element);
    });

    return () => {
      observer.disconnect();
    };
  }, [pathname]);

  return null;
}
