# Implementation Plan

- [x] 1. Create theme context and provider





  - Create `src/contexts/ThemeContext.tsx` with Theme type definitions ('light' | 'dark' | 'system')
  - Implement ThemeProvider component with useState for theme state management
  - Add useEffect to initialize theme from localStorage or system preference on mount
  - Add useEffect to persist theme changes to localStorage
  - Add useEffect to apply 'dark' class to document.documentElement based on resolved theme
  - Implement system preference detection using window.matchMedia('(prefers-color-scheme: dark)')
  - Add media query listener to respond to system preference changes when theme is 'system'
  - Export ThemeContext for consumption by custom hook
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 3.4_

- [x] 2. Create useTheme custom hook





  - Create `src/hooks/useTheme.ts` file
  - Implement useTheme hook that consumes ThemeContext using useContext
  - Add error handling to throw descriptive error if used outside ThemeProvider
  - Export hook for use in components
  - _Requirements: 4.2_

- [x] 3. Create ThemeToggle component




  - Create `src/components/theme/ThemeToggle.tsx` file
  - Import useTheme hook and lucide-react icons (Sun, Moon, Monitor)
  - Create component with optional className and showLabel props
  - Implement Radix UI DropdownMenu with three options: Light, Dark, System
  - Use existing Button component with 'ghost' variant for the trigger
  - Display appropriate icon based on resolved theme (Sun for light, Moon for dark)
  - Call setTheme from useTheme hook when user selects an option
  - Add visual indicator for currently selected theme option
  - _Requirements: 1.1, 1.2, 1.4_

- [x] 4. Add FOUC prevention script to index.html




  - Open `index.html` file
  - Add inline script before the root div that reads theme from localStorage
  - Implement logic to apply 'dark' class to document.documentElement before React loads
  - Handle 'system' theme option by checking window.matchMedia
  - Ensure script is minimal and executes synchronously
  - _Requirements: 2.4_

- [x] 5. Add CSS transitions for smooth theme switching





  - Open `src/index.css` file
  - Add transition properties to all elements for background-color, color, and border-color
  - Set transition duration to 200ms with ease timing function
  - Add 'no-transitions' utility class to disable transitions
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 6. Integrate ThemeProvider into app




  - Open `src/main.tsx` file
  - Import ThemeProvider from contexts
  - Wrap the App component with ThemeProvider
  - Ensure ThemeProvider is at the root level of the component tree
  - _Requirements: 4.1, 4.4_
-

- [x] 7. Add ThemeToggle to app header



  - Open `src/App.tsx` file
  - Import ThemeToggle component
  - Add ThemeToggle button to the app header/navigation area
  - Position it in the top-right corner with appropriate styling
  - Ensure it's visible across all views (chat, tool panel, API chat, etc.)
  - Test visibility and positioning on different screen sizes
  - _Requirements: 1.3_


- [x] 8. Handle localStorage errors gracefully




  - Review ThemeContext implementation
  - Wrap all localStorage.getItem and localStorage.setItem calls in try-catch blocks
  - Add fallback to in-memory state when localStorage is unavailable
  - Log warnings to console when localStorage operations fail
  - Ensure app continues functioning without persistence when localStorage is disabled
  - _Requirements: 2.1, 2.2_

- [ ] 9. Manual testing and verification
  - Test theme toggle functionality in browser
  - Verify theme persists across page reloads
  - Test system preference detection on first visit
  - Verify manual theme selection overrides system preference
  - Check for flash of unstyled content on page load
  - Test smooth transitions between themes
  - Verify all components render correctly in both light and dark modes
  - Test on different browsers (Chrome, Firefox, Safari, Edge)
  - Test responsive behavior on mobile and desktop
  - _Requirements: All requirements_
