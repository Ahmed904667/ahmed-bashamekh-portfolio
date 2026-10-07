import HeroVideo from "./HeroVideo";
import ProjectGallery from "./ProjectGallery";
import { Header, RiyadhClock, CopyEmail } from "./PortfolioChrome";
import { Icon } from "./Icons";
import TechMarquee from "./TechMarquee";
import ExperienceItem from "./ExperienceItem";

const skillGroups = [
  { title: "Interfaces", items: ["Next.js", "React", "TypeScript", "JavaScript", "Tailwind CSS"] },
  { title: "Services & data", items: ["Laravel", "PHP", "Python", "Prisma", "PostgreSQL", "MySQL", "SQLite"] },
  { title: "Integrations", items: ["WhatsApp", "Twilio", "Gemini AI", "OpenAI", "Resend", "SendGrid"] },
  { title: "Delivery", items: ["Git", "GitHub", "Vercel", "Railway", "Docker", "AWS & GCP fundamentals"] },
];

export default function Home() {
  return (
    <main id="top">
      <a href="#main-content" className="skip-link">Skip to content</a>
      <Header />
      <div id="main-content">
        <section className="hero container" aria-labelledby="hero-title">
          <div className="hero-topline"><span>Full-stack engineer. Product-minded builder.</span><RiyadhClock /></div>
          <div className="hero-layout">
            <div className="hero-copy"><h1 id="hero-title"><span className="headline-line"><span>Built with logic.</span></span><span className="headline-line"><span>Made for people.</span></span></h1><p className="hero-description">I’m Ahmed Bashamekh, a software engineer turning complex workflows into clear, useful web experiences.</p><div className="hero-actions"><a href="#work" className="button button-dark">Explore my work<Icon name="arrow-down" /></a><a href="/Ahmed-Bashamekh-CV.pdf" className="text-link" download>Download CV<Icon name="download" /></a></div><p className="hero-focus"><span className="focus-dot" />From first idea to a working product.</p></div>
            <HeroVideo />
          </div>
          <div className="hero-bottom"><span>Engineering across the stack</span><TechMarquee /><a href="#work" className="scroll-link">A closer look<Icon name="arrow-down" /></a></div>
        </section>

        <section id="work" className="work-section container" aria-label="Selected projects"><ProjectGallery /></section>

        <section id="about" className="about-section" aria-labelledby="about-title"><div className="container">
          <div className="about-heading"><p className="section-label"><span className="label-line" />A little about me</p><span className="about-location">Riyadh, Saudi Arabia</span></div>
          <div className="about-grid"><div className="about-copy"><h2 id="about-title">Curious by nature.<br />Practical by experience.</h2><p>My route into software runs through IT support, network infrastructure, and a dual degree in Information Technology. I care about the whole system—and the person using it.</p><p>I build across the stack, from interfaces and database-backed workflows to the integrations that connect them.</p><a href="/Ahmed-Bashamekh-CV.pdf" className="text-link light-link" download>The full story, in my CV<Icon name="download" /></a><div className="language-pair"><span>Arabic <b>Native</b></span><span>English <b>Fluent</b></span></div></div>
            <div className="experience-panel"><p className="detail-label">Experience & education</p>
              <ExperienceItem defaultOpen summary={<div><span className="experience-date">Jul 2025 — Feb 2026</span><h3>IT Technical Support</h3><span>Qbox / Riyadh</span></div>}><p>Configured photobooth systems, connecting computers, cameras, printers, and software. Diagnosed communication issues and maintained system updates.</p></ExperienceItem>
              <ExperienceItem summary={<div><span className="experience-date">Aug 2023 — Feb 2024</span><h3>Network Intern</h3><span>Data Solution BHD / Kuala Lumpur</span></div>}><p>Assisted with server configuration and maintenance, network troubleshooting, and monitoring private network infrastructure.</p></ExperienceItem>
              <ExperienceItem summary={<div><span className="experience-date">Nov 2022 — Nov 2025</span><h3>Bachelor of Information Technology</h3><span>APU & De Montfort University</span></div>}><p>Dual degree from Asia Pacific University and De Montfort University. Studied in Kuala Lumpur. GPA 3.3 / 4.0.</p></ExperienceItem>
            </div>
          </div>
          <div className="skills-grid">{skillGroups.map((group) => <div className="skill-group" key={group.title}><h3>{group.title}</h3><p>{group.items.map((item) => <span key={item}>{item}</span>)}</p></div>)}</div>
        </div></section>

        <footer id="contact" className="contact-section container">
          <div className="contact-top"><p className="section-label"><span className="label-line" />Have a project or an opportunity?</p><span>Good things start with a conversation.</span></div>
          <div className="contact-main"><h2>Let’s build<br />something useful.</h2><a href="mailto:as.bashamkha@gmail.com" className="contact-arrow" aria-label="Email Ahmed Bashamekh"><Icon name="arrow-up-right" /></a></div>
          <div className="contact-details"><a href="mailto:as.bashamkha@gmail.com" className="contact-email">as.bashamkha@gmail.com<Icon name="arrow-up-right" /></a><CopyEmail /><a className="text-link" href="/Ahmed-Bashamekh-CV.pdf" download>Download CV<Icon name="download" /></a></div>
          <div className="footer-bottom"><span>© {new Date().getFullYear()} Ahmed Bashamekh</span><span>Thoughtfully designed. Independently built.</span><a href="#top">Back to top<Icon name="arrow-up-right" /></a></div>
        </footer>
      </div>
    </main>
  );
}
