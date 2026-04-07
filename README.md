# 🎓 StudyNest Platform

StudyNest is a premium EdTech application built with React, Vite, and Supabase. It features dual role accessibility (Admin and Student) focusing on modern UI design and powerful content distribution workflows.

## 🚀 Key Features

### Dual Role Architecture
- **Student View**: A clean, distraction-free environment tracking average scores, testing history, and highlighting specific weak areas based on analytical data.
- **Admin View**: The command center. Admins bypass class filtering algorithms, gaining complete visibility over the entire platform.

### Enhanced Navigation & Aesthetics
- **Smart Routing**: Interactive `<NavLink>` navigation natively highlighting active endpoints.
- **Client Section & Classes Hub**: Quick directories mapping out resources and study subjects.
- **Glassmorphism UI**: Beautiful, lightweight translucent visual hierarchy paired with micro-animations (`.hover-glow`, `.fade-in-up`) rendering a state-of-the-art feel.

### MCQ Ecosystem
- **MCQ Dashboard Engine**: A dedicated interface allowing users and admins to filter through the database using responsive `Class` and `Subject` selectors to find relevant material dynamically.
- **Admin Bulk Uploader**: Say goodbye to complex JSON structures. Admins can paste raw text in `Question \n A. \n B. \n C. \n D. \n Answer:` formats. The parser converts it live and publishes it securely via Supabase.

### Analytics Generation
- Uses **recharts** to render beautiful, responsive interactive bar graphs plotting out MCQ availability per chapter and Student distribution thresholds. 

### Configuration & Control
- Admins possess a global kill-switch over the testing environment's typography via the **Global Font Controller**.
- Dynamic local storage theme overriding (**Green Premium**, **Dark Mode**, **Light Minimal**).

## 🛠 Tech Stack
- Frontend: `React 18`, `Vite`
- UI Libraries: `lucide-react`, `recharts`
- Backend / DB: `Supabase`
- CSS Architecture: Modular global CSS variables & vanilla transitions.
