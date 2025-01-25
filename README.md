# Wishr.com App Documentation

## Overview
**Wishr.com** is a modern, responsive application where users can create, manage, and share wishlists with friends and family. Users can add items, track purchases, and manage access to their wishlists. The app also features a robust admin panel for managing the platform.

---

## Features

### 1. **Sign-Up Page** (app.wishr.com/signup)
Users must provide the following details:

- email address (unique)
- password

Supabase will verify the users email address with a URL to click on. They will be added to auth.users.id in supabase.


Once verified, the user will be prompted to complete their profile information: (app.wishr.com/completeprofile)

- First Name
- Last Name
- Username (must be unique) - use modern standards to confirm username does not contain any profanity
- Date of Birth
- Country
- tick box to aggree that wishr can send the user emails (required)
- tick box to agree to Wishr.com terms and conditions - this also inlcudes a link to a page to view full terms and conditions. (required)



As well as the profile attributes captured during the sign-up form, there will also be other profile attributes:

- Verified (boolean - set to FALSE until user has activated their account - The user cannot login until they are verified)
- Suspended (boolean - set to FALSE unless administraators manually suspend their account - The user cannot login if they are suspended)
- Reported (boolean - set to FALSE unless someone has reported this user - This does not impact login abilily)
- Premium Member (boolean - set to FALSE - As the app develops, users will have the chance to upgrade their account to access premium features)
- Premium expiry (timestamp - eventually this will be used to determine when the users premium features expire)

all of these attributes will be stored in a "profiles" table, and this table is linked to auth.users.id by the unique email address.

Note the some profile attributes will be visible by other users, which is why profile information is in a seperate table.


---

### 2. **Sign-In Page**
After activating their account and completing their profile, users can log in with their email and password. Successful login redirects to the **User Dashboard**.
The sign-in page also provides the option to click on "Forgot Password" which will prompt them for their email address, and they will receive a password changing email
in accordance to modern standards.

There should also be a link for "Not a member?" which directs them to the sign-up page.

---

### 3. **User Dashboard**
#### Tabs and Features:

#### **Profile Picture**
- Allow user to upload a profile picture which appears in the top-right corner of the page - uploaded image should be
  compressed to webp to save space on the dataabase. The user can edit their profile image if they want to at any time.
  If no image is provided, then use a generic avatar icon.

#### **Profile**
- User can change First Name, Last Name, Username (if new username is still available), Email (if it hasn't been used by anyone else), Password, Country, and Telephone Number.
- The Date of Birth is immutable and cannot be changed.
- **Danger Zone**: Option to delete the account permanently. Implements industry-standard conventions for account deletion from the database.

#### **Search for Other Users**
- Search for users by their username.
- Request access to view their wishlist items. The request sends an email notification to the user.
- Manage pending requests in the "Pending Requests" tab.

#### **Occasions**
- Default occasions:
  - No Occasion (not date-assigned)
  - Birthday (populated automatically using the date of birth).
- User can add custom occasions with:
  - Occasion Name
  - Occasion Date

#### **Messages**
- Displays a list of other registered users with pending requests access to view your wishlist items.
- Options to **Approve** or **Reject** requests.
- Requestor will receive an automatic email notification to tell them if their request was approved or rejected.
- Messages Icon will have a red dot if their are new pending requests or new messages.
- Messages can also come from other users asking to "group purchase" items for others. For example, you are John, and you have
  received a message from Emma, asking you if you'd like to group-purchase an item for Susan.
  You can reply to messages and delete them. 

#### **Add Item**
When clicking **Add Item**, users choose one of three options:
1. **Add Item Manually**
   - **Fields:**
     - Name (required)
     - Description (required) - text tip inside input field should say "try to be descriptive. Is the item you want in a particular colour or size?"
     - Price (optional) - validate so that it must be a number.
     - Occasion (dropdown, default: No Occasion)
     - Item Image (upload or provide URL; uploaded image converts to compressed WEBP format)
     - Item Link (URL; optional)
   - This creates a card showing:
     - Item Name
     - Description
     - Price
     - Occasion
     - Thumbnail Image
     - URL link
     - Purchased status (depending on if another registered user has purchased this item for them)

   - Cards are editable and deletable.

2. **Scan a Barcode** *(Coming Soon)*
3. **Use AI** *(Coming Soon)*

Users can sort and filter cards by:
- Alphabetical by Item Name
- Newest Added
- Price
- Show/Hide Purchased Items

#### Viewing Other Users' Items
- Initially you will be presented with a "padlock" icon - You cannot view this users wishlist without their approval. Click to request approval.
- The owner of the wishlist will receive an email requesting approval.
- Upon access approval:
  - View wishlist items from other users, and can see their profile picture.
  - Mark their cards as "Purchased."
    - This wiill notify them with:
      1. **"[User] has purchased [item name] for you!"**
      2. **"A very kind soul haas just purchased [item name] for you!"**
  - Purchased cards turn green for both the purchaser and the wishlist owner, and other people viewing this wishlist.
  - You can also show others that you would be willing to group together to purchase an ittem if it is expensive. You can select "group buy",
    and select the maximum amount you could contribute to the purchase.
  - By selecting group buy, other people who were also approved to view the wishlist will see your usernam on the card and the maximum amount
    that you were willing to contribute. They will be able to do the same thing, and set how much they are willing to contribute to the purchase.
    They can click on your name and "send a message" so that you can communicate with each other to arrange the purchase. 
  - Cards can be sorted
    - Alphabetical by Item Name
    - Newest Added
    - Price
    - Show/Hide Purchased Items
  - cards will look almost identical to the cards that the wishlist owner sees in their own profile, however the Item Link URL will be manipulated
    for affiliate commissions. This will be handled in the administrators admin panel.
 - report this account - An option to report the account if the profile picture or any items are innapropriate. This notifies the adminitrators.

#### Share Your Wishlist
- this will open a pop-up window that has pre-formatted text in it, that the person can click on the copy button so that they can copy the text into
  their email software. The text will say, "I'm using Wishr.com to create my ideal wishlist of items! Sign-up to Wish if you'd like to view them!
  Web - https://wisr.com
  IOS - https://apple.com
  Android - https//google.com"

- There should be a toggle to switch the dashboard visuals between light/mode and dark mode
- There should be a contact us button, which opens a popup windw, where you can select the reason for contacting Wishr and then type into the body of the email.
- 

---

### 4. **Admin Panel**
Private admin panel accessible only to manually-approved email addresses (e.g. admin@wishr.com)

#### **Statistics**
- Number of registered users.
- Graph showing daily user signups (last 30 days) using **Recharts**.

#### **Emails**
- Email individual users or all users for marketing using **EmailJS**.

#### **Database**
- View and manage users:
  - Columns: Name, Username, Email, Wishlist Item Count, Verified, Suspended, Premium, Reported.
  - Actions: Delete, Suspend, Manually Verify users.
- Search and sort features.

#### **Affiliates**
- Manage affiliate links
- Multiple options available. Each option can be edited.
- Amazon (add your affiliate details)
- CJ.com (coming soon)
- AWin.com (coming soon)
- Each affiliate option should be its own component as they work differently.
- For the Amazon option, you would typically provide an affiliate Associate ID (e.g. wishr-21)
- this associate ID will be used to manipulate URL's in the cards displayed to other users who have requested viewing access to peoples wishlists
- If the original wishlist creator added an item URL that contained https://amazon then this URL will be manipulated when it is shown to others
- The Amazon URL will be stripped back to just the item URL (e.g. https://www.amazon.co.uk/dp/B0BMQJWBDM) and then the special affiliate details
  will be appended to the URL before it is presented to other users - So it would become https://www.amazon.co.uk/dp/B0BMQJWBDM&tag=wishr-21 when eventually
  presented to other users. This doesn't impact the URL for the original wishlist creator. Their item URL remains unchanged. This only applies to when other users
  will be viewing the cards.
- More logic will be applied later for other affiliate options.

---

## Technical Notes

### Database
- Robust schema to prevent RLS issues or circular references.
- Ensures immutability of critical fields like Date of Birth.

### Email Configuration
Use `.env` for sensitive keys:
```env
VITE_EMAILJS_SERVICE_ID=
VITE_EMAILJS_TEMPLATE_ID=
VITE_EMAILJS_PUBLIC_KEY=
VITE_EMAILJS_PRIVATE_KEY=
VITE_SUPABASE_ANON_KEY=
VITE_SUPABASE_URL=
```

### Design
- Fully responsive for desktop and mobile.
- Modern UX/UI principles.
- Colours and Styling: based on the visuals of wishr.com website.
- broken down into logical components for ease of development.

---

## Libraries and Tools
- **EmailJS**: Email functionality.
- **Recharts**: Graphs for admin statistics. (use NPM version 2.15.0 or later)

---

## Future Features
- Barcode scanning functionality.
- AI-assisted item addition.
- Affiliate link management.
- Premium features
