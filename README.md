# 👻 Ghostwire

> **Ephemeral. Private. Neo-Brutalist. Yours.**

Ghostwire is a zero-backend, true peer-to-peer chat application built with a stunning neo-brutalist bento-grid UI. No accounts, no chat history stored anywhere, no databases.

**Messages vanish the moment you close the tab.**

[![License: MIT](https://img.shields.io/badge/License-MIT-black.svg)](LICENSE)
[![Creator](https://img.shields.io/badge/By-rn--swain-yellow)](https://github.com/rn-swain)

---

## ✨ Features

- 🔒 **True P2P** — Direct browser-to-browser connection via WebRTC
- 🎯 **Short Codes** — Connect instantly using short, 6-character room codes powered by PeerJS signaling.
- 👤 **No Signup** — Just open and chat
- 💨 **Ephemeral** — Nothing persists, not even locally
- 📱 **Mobile Friendly & Responsive** — Beautiful Bento Box grid layout.
- 🚀 **Zero Backend** — Pure static HTML/JS/CSS, host it anywhere

---

## 🚀 How It Works

```text
┌─────────┐          ┌─────────┐
│ User A  │◄────────►│ User B  │
│ Browser │   WebRTC │ Browser │
└─────────┘          └─────────┘
     │                     │
     │   NO SERVER IN      │
     │   THE MIDDLE!       │
     │                     │
     └─────────────────────┘
           Direct P2P
```

Ghostwire establishes a direct WebRTC DataChannel connection between users. We utilize the free, public PeerJS signaling server to exchange connection metadata invisibly. This means you only need to share a short code (e.g. `ABC-DEF`) to connect, while your actual messages never touch a single server.

1. **Create** a room — Your browser generates a short connection code.
2. **Share** the link or code — Send it to your friend or let them scan the QR code.
3. **Connect** — Your friend opens the link.
4. **Chat** — Messages flow directly between browsers.
5. **Vanish** — Close the tab, and the conversation is permanently destroyed.

---

## 📦 Deployment

### GitHub Pages (Recommended)

1. **Fork this repository**
2. **Go to Settings** → Pages
3. **Select branch:** `main`
4. **Your chat is live!** 🎉

Access it at: `https://rn-swain.github.io/ghostwire`

### Run Locally

```bash
# Clone the repository
git clone https://github.com/rn-swain/ghostwire.git
cd ghostwire

# Serve locally
python -m http.server 8000
```
Open `https://rn-swain.github.io/Ghostwire/` in your web browser.

---

## 🔒 Security

### What We Do
- ✅ Connections are secured by WebRTC's mandatory DTLS encryption.
- ✅ No server sees or stores your messages—ever.
- ✅ No persistent storage of any kind (no cookies, local storage, etc).

### What We Don't Do (Yet)
- ⚠️ Metadata protection (IP addresses are visible to peers).
- ⚠️ Forward secrecy between sessions.

*Recommendation:* Use for fun, fast, and casual ephemeral chats.

---

## 📧 Contact

**Rudra Swain**  
- GitHub: [@rn-swain](https://github.com/rn-swain)
- Email: rudra.rn.swain@gmail.com

---

## 📜 License

MIT License — See [LICENSE](LICENSE)
