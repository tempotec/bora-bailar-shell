# BoraBailar - Design Guidelines

## App Purpose
BoraBailar is a social mobile application for discovering and attending dance events, parties, and nightlife experiences. The app connects party-goers with local events and creates a vibrant community around dance culture.

## Architecture Decisions

### Authentication
**Auth Required** - Social/event discovery platform
- Implement SSO (Apple Sign-In for iOS, Google Sign-In)
- Include social profile features (avatar, display name, bio)
- Account screen with:
  - Profile customization
  - Notification preferences
  - Privacy settings
  - Log out and delete account options

### Navigation Architecture
**Tab Navigation** (4 tabs + FAB for core action)
- **Discover** (Home): Browse upcoming events and featured parties
- **My Events**: User's saved/attending events
- **Floating Action Button**: Quick event creation/share
- **Messages**: Chat with attendees or event organizers
- **Profile**: User account and settings

### Screen Specifications

#### 1. Splash Screen
- Full-screen branded experience
- BoraBailar logo centered
- Animated entrance (fade + scale)
- Gradient background (vibrant nightlife aesthetic)

#### 2. Onboarding (Stack-Only, 3 screens)
- Swipeable carousel explaining key features
- Skip button (top-right)
- Progress indicators (dots)
- "Get Started" CTA on final screen

#### 3. Discover Screen (Home Tab)
- **Header**: Transparent with location selector (left) and filter icon (right)
- **Layout**: ScrollView with multiple sections
  - Hero banner: Featured event card
  - "This Weekend" horizontal scroll list
  - "Popular Venues" grid (2 columns)
  - "All Events" vertical list
- **Safe Area**: Top inset = headerHeight + Spacing.xl, Bottom inset = tabBarHeight + Spacing.xl
- Search bar appears on scroll

#### 4. Event Details Screen (Modal Stack)
- **Header**: Custom with back button (left), share & bookmark icons (right)
- **Layout**: ScrollView
  - Full-width event image with gradient overlay
  - Event title, date, time, location
  - Ticket/RSVP section (floating card)
  - Description
  - Attendees list (horizontal scroll of avatars)
  - Map location
  - Similar events section
- **Floating CTA**: "Get Tickets" button with subtle shadow
- **Safe Area**: Bottom inset = insets.bottom + Spacing.xl

#### 5. My Events Screen (Tab)
- **Header**: Default with "My Events" title, filter icon (right)
- **Layout**: Segmented control (Upcoming / Past) + List
- Empty state with illustration and "Discover Events" CTA
- **Safe Area**: Top inset = Spacing.xl, Bottom inset = tabBarHeight + Spacing.xl

#### 6. Profile Screen (Tab)
- **Header**: Settings icon (right)
- **Layout**: ScrollView
  - Avatar with edit button overlay
  - Display name, bio
  - Stats (Events Attended, Following, Followers)
  - Sections: Saved Events, Favorite Venues, Activity
- **Safe Area**: Top inset = insets.top + Spacing.xl, Bottom inset = tabBarHeight + Spacing.xl

## Design System

### Color Palette
- **Primary**: Electric Purple (#8B5CF6) - CTA buttons, active states
- **Secondary**: Hot Pink (#EC4899) - Accents, highlights
- **Tertiary**: Vibrant Orange (#F97316) - Energy, notifications
- **Background**: Deep Dark (#0F172A) - Main background
- **Surface**: Dark Gray (#1E293B) - Cards, elevated surfaces
- **Text Primary**: White (#FFFFFF)
- **Text Secondary**: Light Gray (#94A3B8)
- **Success**: Green (#10B981)
- **Error**: Red (#EF4444)

### Typography
- **Headings**: System bold, 24-32pt
- **Subheadings**: System semibold, 18-20pt
- **Body**: System regular, 16pt
- **Caption**: System regular, 14pt
- **Button Text**: System semibold, 16pt

### Visual Design
- **Icons**: Feather icons from @expo/vector-icons
- **Card Style**: Rounded corners (12px), dark surface with subtle borders
- **Event Cards**: Full-width image with gradient overlay, text positioned over gradient
- **Floating Buttons**: 
  - FAB: 56x56, circular, gradient (primary to secondary)
  - Shadow: offset (0, 2), opacity 0.10, radius 2
- **Interactive Feedback**: Scale animation (0.95) + opacity (0.8) on press
- **Spacing Scale**: xs=4, sm=8, md=12, lg=16, xl=24, xxl=32

### Required Assets
1. **Logo**: BoraBailar wordmark and icon (vibrant, dance-themed)
2. **Onboarding Illustrations**: 3 custom illustrations showing:
   - Event discovery
   - Social connections
   - Ticket purchasing
3. **User Avatars**: 8 preset avatars with vibrant, party-themed aesthetics (DJ headphones, neon sunglasses, colorful wigs)
4. **Empty States**: Illustrations for no events, no messages
5. **Event Placeholder**: Gradient placeholder for loading/missing event images

### Accessibility
- Minimum touch target: 44x44pt
- Color contrast ratio: 4.5:1 for text
- Support for Dynamic Type
- VoiceOver labels on all interactive elements
- Haptic feedback on important actions (save event, purchase ticket)