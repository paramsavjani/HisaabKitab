# 🧾 KhataBook - Your Digital Ledger

Welcome to **KhataBook** - an updated version of the popular ledger app. Manage all your transactions efficiently, send requests to your contacts, and maintain detailed records between users in a simple, user-friendly interface.

---

## ✨ Key Features

- **Unique usernames** for personalized tracking of transactions
- **Friend requests** to connect with users and manage transactions together
- **View public profiles** to check a user's pending balances (how much they owe or are owed) and make informed decisions on whether to lend or give money
- **Detailed transaction records** that keep track of money exchanges between users
- **Modern UI** powered by Tailwind CSS for a clean and fast experience
- **Real-time notifications** for pending, accepted, or rejected requests

<!-- ---

## 📸 Screenshots

Here’s what KhataBook looks like in action:

![KhataBook Screenshot 1](https://via.placeholder.com/500x300?text=App+Screenshot+1)
![KhataBook Screenshot 2](https://via.placeholder.com/500x300?text=App+Screenshot+2) -->

---

## 🛠️ Technologies Used

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)

---
## 🛠️ How It Works

1. **Unique Usernames**: Each user registers with a unique username that makes tracking transactions easy.
2. **Send and Accept Requests**: Users can send and accept friend requests for streamlined transaction management.
3. **View Public Profiles**: You can view the public profiles of users to see how much they owe or how much is owed to them.
4. **Real-time Transaction History**: Users can see transaction histories with friends in real-time.

### Example Code Snippet

```javascript
// Example of a friend request being sent
const sendRequest = async (senderId, recipientUsername) => {
  const recipient = await User.findOne({ username: recipientUsername });
  if (!recipient) throw new Error('User not found');

  const request = new Request({ sender: senderId, recipient: recipient._id });
  await request.save();
  console.log('Request sent successfully');
};