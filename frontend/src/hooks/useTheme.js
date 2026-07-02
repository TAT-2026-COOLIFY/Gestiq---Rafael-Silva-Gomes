import { useState, useEffect } from "react";
import { flushSync } from "react-dom";

export function useTheme() {
  const [theme, setTheme] = useState(localStorage.getItem("theme") ?? "light");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  function toggleTheme() {
    if (!document.startViewTransition) {
      setTheme((prev) => (prev === "light" ? "dark" : "light"));
      return;
    }

    const transition = document.startViewTransition(() => {
      flushSync(() => {
        setTheme((prev) => (prev === "light" ? "dark" : "light"));
      });
    });

    transition.ready.then(() => {
      const radius = Math.hypot(window.innerWidth, window.innerHeight);

      document.documentElement.animate(
        {
          clipPath: [
            "circle(0px at 0% 0%)",
            `circle(${radius}px at 0% 0%)`,
          ],
        },
        {
          duration: 600,
          easing: "ease-in-out",
          pseudoElement: "::view-transition-new(root)",
        }
      );
    });
  }

  return { theme, toggleTheme };
}