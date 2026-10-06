# Ahmed Bashamekh — Portfolio

A custom portfolio with Next.js, React, TypeScript, and Three.js.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000. Production commands are `npm run build` and `npm start`.

## Experience

- An independently rendered cobalt-and-silver sculpture. Drag horizontally, use arrow keys, inspect the structural view, reset the camera, or pause motion.
- A second selectable 3D laptop scene with a metallic chassis, instanced keyboard, trackpad, and a locally drawn coding IDE. The original sculpture remains the initial view.
- The stylized avatar from the companion character task is retained as a third selectable view; each model supports the same rotation, solid/wireframe, reset, and pause controls.
- A moving technology strip with local SVG logos, a pause control, hover/focus pause, and a scrollable static version for reduced motion.
- A responsive project gallery with filters and native accessible detail dialogs.
- Real public-site captures for Hassel and Qabas. Invaro uses a clearly labeled illustration of its guest journey.
- Keyboard-operable Invaro journey tabs, expandable career entries, working email links and clipboard feedback, and a download of Ahmed's supplied CV.
- Native scrolling, reduced-motion support, lazy-loaded Three.js, capped pixel ratios, and rendering suspended offscreen or in inactive tabs.

## Content

Project content is in `app/ProjectGallery.tsx`. Career content is in `app/page.tsx`.
Public screenshots are in `public/projects/`. The resume is `public/Ahmed-Bashamekh-CV.pdf`.

Hassel and Qabas link to their actual live sites. Invaro details come from the supplied CV.
Sanad is included as a completed project with no invented features or technology stack.
Repository URLs have not been supplied, so source links and additional repository-specific facts must be added once those URLs are known.
Railway, Docker, Tailwind CSS, OpenAI, Resend, and SendGrid were added to the skills at Ahmed's explicit request. The laptop IDE is an illustration, not an embedded editor or a screenshot of a project repository.

Technology icons in `public/tech/` are from [Simple Icons](https://github.com/simple-icons/simple-icons) (CC0). Brand trademarks remain with their respective owners.

## Design and implementation

The current design source of truth is `design-system/MASTER.md`.
Relevant guidance: frontend-design, UI/UX Pro Max, design-motion-principles, Three.js, and Vercel React best practices.
Project-local skills live in `.agents/skills/`.
