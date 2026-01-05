# UK Truck Clean - Design Guidelines

## Design Approach: Minimalist Utility System

**Selected Framework**: Modern minimalist design system focusing on clarity, efficiency, and professional presentation. Drawing from Linear's clean interface patterns and Notion's data management aesthetics.

**Core Principle**: Functional elegance - every element serves a purpose without unnecessary decoration.

---

## Typography

**Font Family**: Inter (via Google Fonts CDN)
- Primary: Inter for all text elements
- Weight distribution:
  - Headings: 600 (Semibold)
  - Labels/UI: 500 (Medium)
  - Body text: 400 (Regular)
  - Subtle text: 400 (Regular with reduced opacity)

**Hierarchy**:
- Page titles: text-2xl (24px)
- Section headings: text-lg (18px)
- Form labels: text-sm (14px)
- Input text: text-base (16px)
- Table headers: text-sm (14px) uppercase tracking-wide
- Table data: text-sm (14px)
- Metadata: text-xs (12px)

---

## Layout System

**Spacing Primitives**: Tailwind units of 2, 4, 6, 8, and 12
- Component padding: p-6 or p-8
- Form field spacing: gap-6
- Section margins: mb-8 or mb-12
- Tight spacing: gap-2 or gap-4 (buttons, inline elements)

**Container Strategy**:
- Max-width: max-w-4xl for forms, max-w-7xl for data table
- Centered layouts with mx-auto
- Consistent page padding: px-6 on mobile, px-8 on desktop

---

## Component Library

### Navigation
**Top Bar** (fixed or sticky):
- Full-width horizontal bar with subtle border-bottom
- App title on left (text-xl, font-semibold)
- Navigation tabs/buttons on right (Form Entry | View Records)
- Height: h-16
- Padding: px-8
- Active state: border-b-2 indicator on active tab

### Form Entry Screen

**Form Container**:
- Centered card with subtle border
- Padding: p-8
- Max-width: max-w-2xl
- Rounded corners: rounded-lg

**Input Fields**:
- Full-width text inputs with clear labels above
- Label positioning: mb-2 above input
- Input height: h-12
- Input padding: px-4
- Border: 1px solid with rounded corners (rounded-md)
- Focus state: 2px border with ring-2 ring-offset-2

**Field Layout**:
- Single column on mobile, consider 2-column grid for related fields on desktop
- Consistent gap-6 between fields
- Required fields: asterisk (*) next to label
- Auto-filled fields (Date, WashID): Display as read-only styled differently (subtle background)

**Submit Button**:
- Height: h-12
- Padding: px-8
- Full-width on mobile, auto-width on desktop
- Positioned at bottom of form with mt-8
- Rounded: rounded-md
- Font weight: font-medium

**Validation**:
- Inline error messages below fields (text-sm, red accent)
- Clear error state borders on invalid fields

### Data Table Screen

**Table Container**:
- Full-width within max-w-7xl container
- Border: subtle outer border with rounded corners (rounded-lg)
- Overflow handling: overflow-x-auto for mobile responsiveness

**Filter Controls** (above table):
- Horizontal row of filter inputs
- Search/filter inputs: h-10, compact design
- Gap-4 between filter controls
- Date range pickers, dropdowns for Company/Location
- Clear filters button on right

**Table Structure**:
- Header row: Sticky positioning (sticky top-0)
- Header cells: Uppercase, font-medium, letter-spacing
- Header padding: px-4 py-3
- Data cell padding: px-4 py-4
- Row borders: border-b between rows
- Alternating row treatment: subtle background on even rows

**Table Columns**:
- WashID: Narrow (60px)
- Date: Fixed width (120px)
- Vehicle: Medium (100px)
- Washtype: Medium (140px)
- Driver: Flexible
- Company: Medium (140px)
- Location: Medium (140px)

**Sorting**:
- Clickable headers with arrow icons (Heroicons: chevron-up/down)
- Icon size: w-4 h-4, inline with header text
- Active sort column: Distinct visual indicator

**Empty State**:
- Centered message when no records: "No wash records found"
- Icon: Heroicons document-text (w-12 h-12)
- Padding: py-16

---

## Icons

**Library**: Heroicons (outline style via CDN)
**Usage**:
- Navigation: arrows, document icons
- Form: check-circle for success, exclamation-circle for errors
- Table: sorting arrows, filter icon
- Size: w-5 h-5 for UI elements, w-4 h-4 for inline indicators

---

## Responsive Behavior

**Breakpoints**:
- Mobile: Base (single column, full-width forms)
- Tablet: md: (can introduce 2-column form layout)
- Desktop: lg: (full table width, multi-column filters)

**Mobile Optimizations**:
- Stack form fields vertically
- Horizontal scroll for table
- Full-width buttons
- Collapsible filters (drawer/modal pattern)

---

## Interactions & States

**Minimalist Approach**:
- NO hover animations on backgrounds
- Focus states: Clear ring indicators
- Button states: Subtle opacity shift on hover (hover:opacity-90)
- Loading states: Simple spinner or skeleton screens
- Success feedback: Brief toast notification (top-right, 3s duration)

**Transitions**:
- Screen transitions: Simple fade or none
- Form submission: Brief loading state on button ("Saving...")
- Table updates: Smooth but instant, no elaborate animations

---

## Key Design Decisions

1. **No Hero Section**: This is a utility app - jump straight to functionality
2. **Single-purpose screens**: Form screen OR table screen, no mixing
3. **Professional restraint**: Clean, corporate aesthetic suitable for operational use
4. **Data-first**: Table readability is paramount with clear column headers and adequate spacing
5. **Mobile-capable**: Form works on tablet devices for field operators

---

## Images

**No images required** for this application. This is a pure utility interface focused on data entry and display.