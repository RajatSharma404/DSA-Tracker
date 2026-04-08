"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { animate } from "animejs";

export default function ScrollRevealProvider() {
  const pathname = usePathname();

  const isRevealExcluded = (element: HTMLElement) =>
    element.hasAttribute("data-scroll-reveal-ignore");

  useEffect(() => {
    const scrollRoot = document.querySelector<HTMLElement>(
      '[data-scroll-root="true"]',
    );

    const explicitElements = Array.from(
      (scrollRoot || document).querySelectorAll<HTMLElement>(
        "[data-scroll-reveal]",
      ),
    ).filter((element) => !isRevealExcluded(element));

    const autoTargets = scrollRoot
      ? Array.from(scrollRoot.children).filter(
          (child): child is HTMLElement =>
            child instanceof HTMLElement &&
            !child.classList.contains("animate-pulse") &&
            !isRevealExcluded(child),
        )
      : Array.from(document.querySelectorAll("main > *")).filter(
          (node): node is HTMLElement =>
            node instanceof HTMLElement &&
            !node.classList.contains("animate-pulse") &&
            !isRevealExcluded(node),
        );

    const elements = Array.from(new Set([...explicitElements, ...autoTargets]));

    if (elements.length === 0) {
      return;
    }

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reducedMotion) {
      elements.forEach((element) => {
        element.classList.remove("scroll-reveal");
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
            animate(target, {
              opacity: [0, 1],
              translateY: [34, 0],
              scale: [0.985, 1],
              filter: ["blur(10px)", "blur(0px)"],
              duration: 760,
              delay: Number(
                target.style
                  .getPropertyValue("--scroll-reveal-delay")
                  ?.replace("ms", "") || 0,
              ),
              easing: "cubicBezier(0.22, 0.82, 0.22, 1)",
            });
            observer.unobserve(target);
          }
        });
      },
      {
        threshold: 0.16,
        rootMargin: "0px 0px -10% 0px",
        root: scrollRoot || null,
      },
    );

    elements.forEach((element, index) => {
      element.classList.remove("scroll-reveal-visible");
      element.classList.add("scroll-reveal");
      element.style.setProperty(
        "--scroll-reveal-delay",
        `${Math.min(index, 8) * 75}ms`,
      );
      observer.observe(element);
    });

    return () => {
      observer.disconnect();
    };
  }, [pathname]);

  return null;
}
