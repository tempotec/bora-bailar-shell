# BoraBailar - Mobile App

## Overview
BoraBailar is a social mobile application for discovering and attending dance events, parties, and nightlife experiences. Built with React Native and Expo, the app connects party-goers with local events and creates a vibrant community around dance culture.

## Tech Stack
- **Frontend**: React Native with Expo SDK 54
- **Navigation**: React Navigation 7 (Bottom Tabs + Stack)
- **State Management**: TanStack Query
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM

## Project Structure
```
client/
├── App.tsx                    # Main app entry with providers
├── components/                # Reusable UI components
│   ├── Button.tsx            # Gradient primary button
│   ├── Card.tsx              # Animated card component
│   ├── ErrorBoundary.tsx     # App crash handler
│   ├── HeaderTitle.tsx       # Header with app icon
│   ├── KeyboardAwareScrollViewCompat.tsx
│   ├── ThemedText.tsx        # Typography component
│   └── ThemedView.tsx        # Themed container
├── constants/
│   └── theme.ts              # Design tokens (colors, spacing, etc.)
├── hooks/
│   ├── useColorScheme.ts
│   ├── useScreenOptions.ts
│   └── useTheme.ts
├── navigation/
│   ├── DiscoverStackNavigator.tsx
│   ├── MainTabNavigator.tsx   # 4 tabs + FAB
│   ├── MessagesStackNavigator.tsx
│   ├── MyEventsStackNavigator.tsx
│   ├── ProfileStackNavigator.tsx
│   └── RootStackNavigator.tsx
├── screens/
│   ├── DiscoverScreen.tsx     # Home/discover events
│   ├── EventDetailsScreen.tsx # Event details modal
│   ├── MessagesScreen.tsx     # Chat conversations
│   ├── MyEventsScreen.tsx     # User's events
│   └── ProfileScreen.tsx      # User profile
└── lib/
    └── query-client.ts
server/
├── index.ts                   # Express server entry
├── routes.ts                  # API routes
└── storage.ts                 # Data storage
```

## Design System
- **Primary**: Electric Purple (#8B5CF6)
- **Secondary**: Hot Pink (#EC4899)
- **Tertiary**: Vibrant Orange (#F97316)
- **Background**: Deep Dark (#0F172A)
- **Surface**: Dark Gray (#1E293B)

## Navigation Structure
1. **Descobrir** (Discover) - Browse upcoming events
2. **Eventos** (My Events) - User's saved/attending events
3. **Mensagens** (Messages) - Chat with attendees/organizers
4. **Perfil** (Profile) - User account and settings
5. **FAB** - Floating action button for quick actions

## Running the App
- Dev server starts on port 5000 (Express) and 8081 (Metro)
- Use Expo Go to scan QR code for mobile testing
- Web version available at the deployment URL

## Recent Changes
- December 2024: Initial MVP implementation with all core screens
