# 🎓 PaceX - University Social Platform

PaceX is a MERN stack-based social platform designed exclusively for university students and faculty. It provides a digital space where users can connect, collaborate, and engage in academic and extracurricular activities.

---

## 🚀 Features

- **User Authentication**: Secure sign-up and login with role-based access (students, faculty, admins).
- **News Feed & Posts**: Share updates, images, and engage with the campus community.
- **Groups & Communities**: Join or create student clubs, academic groups, and discussion forums.
- **Messaging System**: Real-time chat functionality.
- **Events & Notices**: Stay updated with university events and announcements.
- **Marketplace**: Buy and sell textbooks, gadgets, and services within the university.

---

## 🛠 Technology Stack

- **Frontend**: React.js, Material-UI
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: FireBase
- **Real-Time Communication**: Socket.io
- **Deployment**: Vercel (Frontend),Render(Backend)

---

## 📦 Getting Started

For deployed version of the application please use this link

```bash
https://pacedev.vercel.app
```

OR

Follow the instructions below to set up the project locally.

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/Manassss/PaceX.git
```

### 2️⃣ Set up the Frontend

```bash
cd client
npm install
```

### 3️⃣ Set up the Backend

Open another terminal in the project root:

```bash
cd server
npm install
```

### 4️⃣ Configure Environment Variables

#### Client `.env`

In `client/.env`, add:

```env
VITE_GOOGLE_MAPS_API=AIzaSyAO2ekezozP0iZGQNeyYOkASsjsl456Kn8
REACT_APP_FIREBASE_API_KEY=AIzaSyD-cG5FUYp3BtDn1MM6dSqwF4U5vBzFYQ4
REACT_APP_FIREBASE_AUTH_DOMAIN=uniconnect-b0f89.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=uniconnect-b0f89
REACT_APP_FIREBASE_STORAGE_BUCKET=uniconnect-b0f89.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=813462086599
REACT_APP_FIREBASE_APP_ID=1:813462086599:web:d3c0f9299e2ca55d72afe2
REACT_APP_FIREBASE_MEASUREMENT_ID=G-VR81083ESP
# For local development
REACT_APP_DEV_API_BASE_URL=http://localhost:5001
REACT_APP_NODE_ENV=production
# For deployed production frontend
REACT_APP_PROD_API_BASE_URL=https://pacex.onrender.com
```

#### Server `.env`

In `server/.env`, add:

```env
MONGO_URI='mongodb+srv://Sid:MongoDBUniconnect07@cluster0.3wia5.mongodb.net/UniconnectDB?retryWrites=true&w=majority'
JWT_SECRET=a0734cb17286a6c8cb3ca15bf26ba3f48c56bf50ebdba36058839b812675001c23fd9470729ea2c5420873631dd6346e0ee9b607859c63f2784861605c384900
# FIREBASE_KEY_PATH=C:\Users\manas\firebase-keys\firebase-key.json
FirebaseTYPE="service_account"
FirebasePROJECTID="uniconnect-b0f89"
FirebaseKEYID="17c106978aacc3ed707bcb0a318a4d920d9ff748"
FirebaseKEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCnbawMQuTMKu8l\nBB6V1d7Hh8lnJbi1f+QmKHKKrpfsJWLfZRC+XqEE1rrkoC23n4N4krdCHUp3VxOQ\nLlUPzTKbaiIzmMyDxthFBCcs0z2jliyrxZW2V8Dc08XvZ7KkYkHgbQYFJuAnWp+R\niMOPM69HWHKCmowAtDvRXomKDn3tydD0NAt2Q8NIIIKi4VCKeW3hdsCg+ESv78EB\nm1SQ8sXog9iiM7EeNUHUfSpL5Qzo8W4uB9hhY15Lvhok1g/hURFhXBQKjt1AE3Ww\nOETX7Z7vLpaoK/Qtmz5/T8dSHK3lXFRA6EIXUmdiX7OdoMphkRX9OxNKtFKS5SH1\nMJ+LoVzPAgMBAAECggEARDUDGomj4OL6wqcveJYEqF+SdnFhEpuzy7G9m+6tmHfQ\nlDZ9gDhXu3to7tusVDppGlUW0BnTrNNt9lZRs9rB65tsrH1qj6KRl2guN24lFcAH\nmcCoEX0lZjDl2XZyydH3iWCQy8d/GLkr+WNwW6XQGa4YFEm2kFDcb5pmSLZHqfdc\nu6Vl75gh/d6TH5tg7ZYnf5W0+Jgerm9XlMizGQ96TaR4wlSYgH08hzoH4FNK78qM\nSgXQsPWlmPKjGb6OUF1O5kYsDKrjg/iIGaoBQV/UcdxSxAW/kBpI3BJBfVWpe5BD\nJXire83e7L4BkUCdsMVV/AZzTkzuSfTeWb+Aupgj9QKBgQDjTsJa6GIAzEVSgyyf\ndyNqLR/Exr79GmbHWxwfze0AVleLIdBstRj6/CnPv67KVQmJ9Aw3pENg4DailO4J\nftfYd/1FvWvbppUI3BB0p1DUFnIAUUTyBoyeCnSwbFFb5Cp6YR1rYThbATxm3rt1\nJQbN3lYCblJuCQsySORj1xAv5QKBgQC8j/gigTIQIcQs7xUOa6GjeeotWbeSlw37\nj+TcO6VU1lNrkX2G72aRlVbi1z2izYm4t77R7OgBsNonSbPGvwafRzjwBCY2PL+E\nLgXyfn1pKBgA2cCf5mwSiGpVDzI2SWsMsPfo/zh9ZNNKOK7e2jzxWu3ptVmUHtAS\nSpi8WC2GowKBgQDbmdR05TsBUFfMvoPWz8/8HPorLmOHvQD8qo4CP/0vLTtIZHOr\nAk7O890lIyenu/4KNCe1fdHGfvbpnX5W2B+Jt2qN/NF+FHK5a3nOaXLSY5jhq6Iz\nPJaPfMR9SThU0ZskPjyg5/z9FrWXIKn0I8BuFdX8ZT7npX8WpotX1YeC7QKBgCOi\nTXEv2ycjSnB3ahJEktJS+sdBOijQtQrCQazA9NiYfEFKyF8UpNyETVwm8vXuQ8WN\nq9j+HUYchs1/5yJ6/SRikEcDcbk0N7kh/Wu7LbYOpqKahAVzxR6nevjCG2oY68sF\nMoRsnt9Li4ZuOdXRhkzSMz3EUL5mKEocoMqPG2NjAoGBALvRpN3iNYNHt8bks7Wb\nqbK1u5wlXmvHsp5lqUn0uPKtAloWY3kM3/yHw2+ZdYe543GTQBq5JaOCR2Sn+QI0\nTnxeroYZuKNOMpv+0F0jvNeriBuRQX7nkgWxHPbnXkl3cTtkjR6e43bOben1xibU\ndUD2b0bqAIhkeHUTBYqs+rSO\n-----END PRIVATE KEY-----\n"
FirebaseEMAIL="firebase-adminsdk-fbsvc@uniconnect-b0f89.iam.gserviceaccount.com"
FirebaseID="116385677415381769546"
FirebaseAUTHURI="https://accounts.google.com/o/oauth2/auth"
FirebaseTOKEN="https://oauth2.googleapis.com/token"
FirebaseAUTHURL="https://www.googleapis.com/oauth2/v1/certs"
FirebaseCLIENTURL="https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40uniconnect-b0f89.iam.gserviceaccount.com"
env.FirebaseDOMAIN="googleapis.com"
CLIENT_ORIGIN="https://pacedev.vercel.app"
```

### 5️⃣ Local Host Toggle

In these client files:

- `client/src/auth/authContext.js`
- `client/src/components/apinfo.js`
- `client/src/App.js`

Replace:

```js
const host = process.env.REACT_APP_PROD_API_BASE_URL;
// const host = process.env.REACT_APP_DEV_API_BASE_URL;
```

Uncomment the second line for local development.

### 6️⃣ Run the Servers

#### Backend

```bash
cd server
node server.js
```

#### Frontend

```bash
cd client
npm start
```

## 📂 Project Structure

### Client

```
client/
├── public/                 # Static assets and HTML template
├── src/
│   ├── assets/             # Images, icons, logos
│   ├── auth/               # Firebase Auth context and hooks
│   ├── components/         # Reusable components
│   │   ├── Post/           # AddPost, PostFeed, Modals
│   │   ├── StoryPages/     # StoryBar, StoryViewer
│   │   └── Community/      # CommunityHome, CommunityDetail
│   ├── pages/              # Route-level pages (Home, Profile, Login, Register)
│   ├── firebaseconfig.js   # Firebase initialization
│   ├── App.js              # Route definitions
│   └── ...
├── .env
└── package.json
```

### Server

```
server/
├── config/                 # DB connection, Firebase Admin setup
├── controllers/            # Business logic for each resource
├── middlewares/            # Auth checks, error handlers
├── models/                 # Mongoose schemas (User, Post, Story, ...)
├── routes/                 # Express routers mapping paths to controllers
├── server.js               # App entry point and Socket.IO setup
├── .env
└── package.json
```

---
