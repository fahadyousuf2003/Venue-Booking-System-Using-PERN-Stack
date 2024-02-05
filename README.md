# Venue Booking System

## Introduction
The Venue Booking System provides users with a platform to discover and book unique accommodations based on their preferences. Users can explore various property types, amenities, and locations to find the perfect stay. The system ensures a seamless booking experience, including detailed property information, pricing breakdowns, and user reviews.

## Problem Statement
### Problem:
Users face challenges in finding suitable accommodation due to the lack of streamlined search options and comprehensive information on existing platforms.
### Solution Requirements:
- **Intuitive Interface:** Develop a user-friendly interface for easy navigation.
- **Advanced Filters:** Implement detailed search filters for the type of place, price range, amenities, and safety features.
- **Categorized Options:** Provide additional categories for trending, new, and specific themes.
- **Detailed Listing Information:** Include high-quality images and comprehensive details about each property.
- **Transparent Pricing:** Display clear breakdowns of costs, including nightly rates, fees, and taxes.
- **Payment Options:** Ensure secure credit card payment processing for reservations.

## Expected Outcome
Users will benefit from a simplified and efficient accommodation search, transparent pricing breakdowns, and a trustworthy review system, fostering a positive and seamless booking experience.

## Entity Relationship Diagram

### Relation Schema:

#### places
- placeId 
- ownerId 
- title 
- address
- maxGuests

#### bookings
- booking_id
- place_id
- check-out
- no.ofGuests
- user_id
- check-in

#### users
- user_id
- name
- email
- password
- phone

#### payment
- payment_id
- user_id
- name
- card_no
- cvc
- expiry
- amount_limit

## Technologies Used in this Project
**Front End:**
- React.js with Tailwind CSS
**Back End:**
- PostgreSQL
- Node.js with Express.js

## Potential Users of This Project
**Main Potential Users of the Project:**
- **Travel Enthusiasts:**
  - Individuals seeking diverse accommodation options based on preferences and locations.
- **Business Travelers:**
  - Professionals requiring temporary stays with specific amenities and location preferences.
- **Property Owners/Hosts:**
  - Individuals interested in listing their properties for short-term rentals and earning income.
- **Adventure Seekers:**
  - Travelers with specific interests, such as skiing, beachfront locations, or unique stays like treehouses or cabins.
- **Budget-Conscious Travelers:**
  - Individuals looking for affordable accommodation options with transparent pricing.

## How to Run
1. Clone the repository.
2. Install dependencies using the package manager of your choice.
3. Set up the database using PostgreSQL.
4. Run the backend server using Node.js.
5. Start the frontend development server.

## Contribution Guidelines
Feel free to contribute by submitting bug reports, feature requests, or code contributions.

## Contact
For any inquiries or feedback, please contact Fahad Yousuf (fahadyousuf344@gmail.com).

