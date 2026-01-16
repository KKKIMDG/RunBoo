import { useEffect, useState } from "react";
import "./ScrollNavigator.css";

interface Section {
    id: string;
    title: string;
    top: number;
}

export default function ScrollNavigator() {
    const [sections, setSections] = useState<Section[]>([]);
    const [activeId, setActiveId] = useState<string>("");

    useEffect(() => {
        const sectionEls = Array.from(
            document.querySelectorAll<HTMLElement>("section[data-title]")
        );

        if (sectionEls.length === 0) return;

        const mapped: Section[] = sectionEls.map(sec => ({
            id: sec.id,
            title: sec.dataset.title ?? "",
            top: sec.getBoundingClientRect().top + window.scrollY,
        }));

        setSections(mapped);

        const onScroll = () => {
            const 기준선 = window.scrollY + window.innerHeight * 0.35;

            let current = mapped[0];

            for (const sec of mapped) {
                if (기준선 >= sec.top) {
                    current = sec;
                }
            }

            setActiveId(current.id);
        };

        onScroll(); // 최초 1회
        window.addEventListener("scroll", onScroll);
        window.addEventListener("resize", onScroll);

        return () => {
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", onScroll);
        };
    }, []);

    const scrollTo = (id: string) => {
        document.getElementById(id)?.scrollIntoView({
            behavior: "smooth",
            block: "start",
        });
    };

    if (sections.length === 0) return null;

    return (
        <nav className="scrollNav">
            {sections.map(sec => {
                const isActive = sec.id === activeId;

                return (
                    <button
                        key={sec.id}
                        className={`navItem ${isActive ? "active" : ""}`}
                        onClick={() => scrollTo(sec.id)}
                        aria-label={sec.title}
                    >
                        <span className="bar" />
                        <span className="navText">{sec.title}</span>
                    </button>
                );
            })}
        </nav>
    );
}
