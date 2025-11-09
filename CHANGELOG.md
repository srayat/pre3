# v0.1.7

- Enabeld the Notifications functionality
- Upon event creation, email is sent to host (and developer), and in-app notification is sent too.

# v0.1.6

- Fixed the signin and new user record creation issue
- UI for Setup Steps for Event Management
- Scroll bar issue affecting app width jump on laptop
- Landing page background
- Screen background outside the app page

# v0.1.5

- Added back navigation arrow on User Profile page

# v0.1.4

- Added User Profile
- Enabled Edit Profile
- User profile picture working

# v0.1.3

- Removed App Header on landing page
- Added Logo to Center of Landing Page
- Removed the hash in url
- On mobile, added horisontal spacing
- Rules issue preventing My Events
- Cloud functions for New Account. Sign In, profile Onboarding
- Not tested – Linked Account – Founder Invite – Judge Invite has been implemented in the code but not tested.

## v0.1.2

- Audience investing is working now
- Balance, Validation (front-end) on Investment Page working
- Automated Account creation upon joining event not yet implemented

## v0.1.1

- Some major changes
- Send Founder Invite has been canceled, moved to v2
- Add Startup by host has been enabled in v1 of events and startup ownership
- go live button and end-event buttons are working

## v0.1.0

- UI fixes

## v0.0.9

- User-Host will now add founder email instead of startup info
- Send Invite to Founder sends an email to the founder
- Bugs fixed for Firebase v1 and v2 issues
- Cloud functions implemented

## v0.0.8

- User can create a startup page
- User can then edit that startup details
- The name changes are logged in firestore and the history is maintained
- Some security rules have been changed
- Code added to prevent user manipulating the url to access someone else's startup profile edit page

## v0.0.7

- Another major upgrade in this version
- The Event Management System is complete
- Creating an event, saving it, generating 5-digit Numeric ID, using that as the eventId on firestore
- Moving gracefully to next steps of adding startups, judges, and Ratings. Each section works.
- Editing and Deleting also work.

## v0.0.6

- A major upgrade in this version
- Rating Form has been developed - Front end only
- Join event and event onboarding developed
- user lands on investment page
- user can rate the startup - not integrated with backend yet

## v0.0.5

- Finally, the bottom nav bar is now desirably sticky
- Changed the Primary color of the app
- Some other changes to colors and font-sizes
- Slight design changes to the event card

## v0.0.4

- Added the RatingsQuestions section to the event creation process
- Edited the <meta> tag to disable the pinch-zoom
- Added two indexes, composite indexes, in firebase console

## v0.0.3

- Bottom nav bar pinned to bottom on mobile to address safe inset area on iphones

## v0.0.2

- Bottom nav bar pinned to bottom
- Top of page pinned to top of screen
- The look and feel are coming along well
- Good restore point

## v0.0.1

- First save to Git
- Event creation module in progress
- Page functionalities working but UI is messed up

All notable changes to this project will be documented in this file.

## [2025-02-16]

- Added My Events page with layout adjustments and infinite-scroll groundwork.
- Tweaked landing, sign-in, onboarding, and manage-event flows for mobile-first frame.
- Introduced passwordless Firebase auth flow and Firestore user onboarding.
- Updated Firestore security rules for event role collections.

## [2025-02-15]

- Created landing page with Prussian blue hero and CTA.
- Wired passwordless email sign-in and onboarding flow.
- Simplified MainLayout to a mobile-style shell with bottom navigation.
