# Gemini Developer Instructions - sidebar-shadcn

Welcome to the **sidebar-shadcn** repository. This guide serves as the standard context and instruction reference for Gemini models / AI coding assistants working on this codebase.

## 🛠️ Stack & Technologies

- **Framework**: [Next.js](https://nextjs.org) (App Router, Custom version `16.2.7`)
- **Library**: React (Canary release `19.0.0-rc.1`)
- **Styling**: Tailwind CSS (v4 with PostCSS, config in [globals.css](file:///home/tutu/sidebar-shadcn/app/globals.css))
- **Design System**: Shadcn UI (using `radix-nova` style, config in [components.json](file:///home/tutu/sidebar-shadcn/components.json))
- **Icons**: Lucide React (`lucide-react`)
- **Animations**: Framer Motion (`motion`) & `tw-animate-css`
- **Mapping**: Leaflet / React Leaflet (`leaflet`, `react-leaflet`)

---

## ⚠️ CRITICAL RULES & INSTRUCTIONS

### 1. Next.js Version Match
This project runs a custom Next.js version (`16.2.7`) with significant breaking changes, API differences, and custom conventions. 
> [!IMPORTANT]
> Always read the version-matched documentation at [node_modules/next/dist/docs/](file:///home/tutu/sidebar-shadcn/node_modules/next/dist/docs/) before making routing or layout modifications. **Never rely on external pre-trained knowledge for Next.js APIs.** Refer to [AGENTS.md](file:///home/tutu/sidebar-shadcn/AGENTS.md) for more details.

### 2. Styling with Tailwind CSS v4
We do not use a `tailwind.config.js` or `tailwind.config.ts`.
- Tailwind is fully configured in [globals.css](file:///home/tutu/sidebar-shadcn/app/globals.css) via the `@theme inline` directive and standard CSS custom properties (OKLCH format).
- Always use utility classes directly. Do not create new configuration files.
- Extend styles by adding custom variables inside `@theme inline` in [globals.css](file:///home/tutu/sidebar-shadcn/app/globals.css).

### 3. Component & Layout Conventions
- **Global Components**: Keep reusable components in [components/](file:///home/tutu/sidebar-shadcn/components) and basic UI primitives in [components/ui/](file:///home/tutu/sidebar-shadcn/components/ui).
- **Icons**: Always import icons from `lucide-react`.
- **RSC vs. Client Components**: Use `"use client"` exclusively for files that require client-side hooks (`useState`, `useEffect`, `useRouter`, `usePathname`, etc.). Mark data-fetching pages and static layouts as Server Components.

---

## 📁 Key Directories & Files

- [app/](file:///home/tutu/sidebar-shadcn/app): Contains routes and layout definitions:
  - `(admin)/admin-dashboard`: Admin views, system health, grid and model management.
  - `(users)/dashboard`: End-user dashboards.
- [components/](file:///home/tutu/sidebar-shadcn/components): Business-logic components:
  - [admin-sidebar.tsx](file:///home/tutu/sidebar-shadcn/components/admin-sidebar.tsx): Sidebar navigation for administrators.
  - [app-sidebar.tsx](file:///home/tutu/sidebar-shadcn/components/app-sidebar.tsx): Sidebar navigation for standard users.
  - [nav-main.tsx](file:///home/tutu/sidebar-shadcn/components/nav-main.tsx), [nav-projects.tsx](file:///home/tutu/sidebar-shadcn/components/nav-projects.tsx), [nav-user.tsx](file:///home/tutu/sidebar-shadcn/components/nav-user.tsx): Sidebar layout sub-elements.
- [components/ui/](file:///home/tutu/sidebar-shadcn/components/ui): Radix-based UI primitive components (buttons, dropdowns, sheet, etc.) and custom premium components (e.g., [magic-card.tsx](file:///home/tutu/sidebar-shadcn/components/ui/magic-card.tsx), [shimmer-button.tsx](file:///home/tutu/sidebar-shadcn/components/ui/shimmer-button.tsx)).

---

## 💻 Commands Reference

Run these commands using your terminal runner:

- **Development Server**:
  ```bash
  npm run dev
  ```
- **Build Production Bundle**:
  ```bash
  npm run build
  ```
- **Lint Check**:
  ```bash
  npm run lint
  ```
- **Start Production Server**:
  ```bash
  npm run start
  ```
