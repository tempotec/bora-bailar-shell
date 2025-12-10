# BoraBailar - Design Guidelines

## App Purpose
BoraBailar is a social mobile application for discovering and attending dance events, parties, and nightlife experiences. The app connects party-goers with local events and creates a vibrant community around dance culture.

## Brand Identity

### Logo
- Red dancing couple silhouette (BB symbol)
- Located at: attached_assets/WhatsApp_Image_2025-12-09_at_11.41.04-removebg-preview_1765394422474.png

### Typography
- **Brand Name Font**: Didot/Bodoni (serif font)
  - "BORA" in dark gray/black
  - "BAILAR" in brand red, bold
- **Body Text**: System font
- **Tagline**: Bold, all caps, brand red

### Tagline
"PRA SAIR, DANCAR E SE DIVERTIR!"

## Architecture Decisions

### Authentication
- Header displays "Sign up" and "Log in" buttons (not hamburger/bell icons)
- Log in button has red/brand background color
- Sign up is text-only button

### Navigation Architecture
**Tab Navigation** (4 tabs + FAB for core action)
- **Descobrir** (Discover): Home with wizard search
- **Eventos** (My Events): User's saved/attending events
- **Floating Action Button**: Quick actions
- **Mensagens** (Messages): Chat with attendees or event organizers
- **Perfil** (Profile): User account and settings

### Screen Specifications

#### 1. Splash Screen
- White background
- BoraBailar logo centered
- Clean, minimal design

#### 2. Home Screen (Discover)
Layout from top to bottom:
1. **Header**: Sign up + Log in buttons (right side)
2. **Hero Section**:
   - Logo image (centered)
   - Brand name "BORABAILAR" (Didot/Bodoni font)
   - Tagline in red
3. **Wizard Search Section**:
   - Grayish container background (#EDEDED)
   - 3 white search fields with considerable spacing:
     - "Onde" (Where) - with chevrons icon
     - "Quando" (When) - with chevrons icon  
     - "Com quem" (With whom) - with microphone icon (red)
   - Rounded corners on fields
4. **Helper Text**: "E so falar que a gente te entende!"
   - "falar" and "entende" highlighted in red
5. **Content Section**: "O seu querer e que faz acontecer"
   - "querer" and "acontecer" highlighted in red
   - Horizontal scroll of event thumbnails
6. **Events List**: Standard event list items

#### 3. Event Details Screen (Modal Stack)
- Full-width event image with gradient overlay
- Event title, date, time, location
- Ticket/RSVP section
- Description and attendees

#### 4. My Events Screen (Tab)
- Segmented control (Upcoming / Past)
- Event list

#### 5. Profile Screen (Tab)
- Avatar, display name
- Settings and preferences

## Design System

### Color Palette
- **Brand/Primary**: Red (#C41E3A) - Logo, CTAs, highlights
- **Secondary**: Hot Pink (#EC4899) - Accents
- **Tertiary**: Vibrant Orange (#F97316) - Energy
- **Background Root**: White (#FFFFFF)
- **Background Default**: Light Gray (#F9FAFB)
- **Background Secondary**: Gray (#F3F4F6)
- **Wizard Background**: Light Gray (#EDEDED)
- **Text Primary**: Dark Gray (#1F2937)
- **Text Secondary**: Medium Gray (#6B7280)
- **Success**: Green (#10B981)
- **Error**: Red (#EF4444)

### Typography
- **Brand Name**: Didot/Bodoni serif, 28pt, letter-spacing 2
- **Headings**: System bold, 24-32pt
- **Subheadings**: System semibold, 18-20pt
- **Body**: System regular, 16pt
- **Caption**: System regular, 14pt
- **Button Text**: System semibold, 14-16pt

### Visual Design
- **Icons**: Feather icons from @expo/vector-icons
- **Card Style**: Rounded corners (12-16px), subtle background
- **Wizard Fields**: White background, rounded (24px), subtle border
- **Buttons**: 
  - Primary: Red background, white text, rounded
  - Text: No background, dark or red text
- **Interactive Feedback**: Scale animation (0.98) + opacity (0.8) on press
- **Spacing Scale**: xs=4, sm=8, md=12, lg=16, xl=24, 2xl=32, 3xl=40

### Layout Principles
- Light/white theme throughout
- Generous spacing - nothing cramped
- Wizard search section should be prominent and spacious
- Clean, modern aesthetic

### Accessibility
- Minimum touch target: 44x44pt
- Color contrast ratio: 4.5:1 for text
- Support for Dynamic Type
- VoiceOver labels on all interactive elements
