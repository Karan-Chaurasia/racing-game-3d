# 🏎️ 3D Racing Game

A complete 3D racing game built with Three.js featuring car physics, Xbox controller support, and competitive gameplay.

## 🎮 Play Now

**[Play the Game](https://lnkd.in/daw_rSst)**

## ✨ Features

### 🚗 Core Gameplay
- **3D Car Physics** - Realistic car movement with gear system (1-5)
- **Open World Environment** - Large track with trees, rocks, and dynamic objects
- **Level Progression** - Complete levels by breaking all trees
- **Scoring System** - +1 for trees, -1 for rocks
- **Timer System** - Time pressure with carryover mechanics

### 🎯 Game Mechanics
- **Boost System** - Charge boost by hitting trees, activate for +10 km/h
- **Brake Lights** - Realistic brake light activation
- **Respawn System** - Auto-respawn with countdown sequence
- **Car Customization** - Change colors and size
- **Collision Detection** - Realistic physics and boundary checking

### 🎮 Controls

#### ⌨️ Keyboard
- **W/S** - Forward/Reverse
- **A/D** - Turn Left/Right
- **Space** - Brake
- **Ctrl** - Toggle Boost
- **Shift** - Cycle Gears
- **Mouse** - Rotate Camera
- **R** - Reset Camera
- **ESC** - Settings Menu

#### 🎮 Xbox Controller
- **Left Stick** - Move/Turn Car
- **Button A** - Brake
- **Button B** - Toggle Boost
- **D-pad Up/Down** - Cycle Gears
- **Right Stick** - Rotate Camera
- **Button Y** - Reset Camera
- **Start Button** - Settings Menu
- **Vibration Feedback** - Controller rumble on rock collisions

### 🏆 Features
- **Leaderboard System** - Persistent high scores with localStorage
- **Player Management** - Save and switch between players
- **Smart Scoring** - Only saves improved scores
- **Game Statistics** - Track time taken and completion rates
- **Settings Menu** - Comprehensive game options and rules

## 🚀 How to Run Locally

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/racing-game-3d.git
   cd racing-game-3d
   ```

2. **Open in browser**
   - Simply open `index.html` in your web browser
   - Or use a local server:
   ```bash
   python -m http.server 8000
   # Then visit http://localhost:8000
   ```

## 🌐 Deploy to GitHub Pages

1. **Create a new repository** on GitHub named `racing-game-3d`

2. **Upload files**
   - Upload `index.html`, `game.js`, and `README.md`

3. **Enable GitHub Pages**
   - Go to repository Settings → Pages
   - Select "Deploy from a branch"
   - Choose "main" branch and "/ (root)" folder
   - Click Save

4. **Access your game**
   - Your game will be available at: `https://your-username.github.io/racing-game-3d/`

## 🛠️ Technical Details

- **Engine**: Three.js for 3D graphics
- **Physics**: Custom car physics simulation
- **Input**: Keyboard, mouse, and Xbox controller support
- **Storage**: localStorage for persistent leaderboards
- **Architecture**: Single-page application with modular JavaScript classes

## 🎨 Game Classes

- **Car** - Vehicle physics and rendering
- **Track** - Environment and collision detection
- **CameraController** - Dynamic camera system
- **RacingGame** - Main game logic and state management

## 🏁 Game Rules

1. **Objective**: Break all trees to advance to the next level
2. **Scoring**: +1 point for each tree, -1 for hitting rocks
3. **Timer**: 60 seconds base time, +4 seconds per level (up to level 5)
4. **Boost**: Charge by hitting trees, toggle with Ctrl/Button B
5. **Gears**: Cycle through 5 gears for different speeds
6. **Levels**: Infinite progression with increasing difficulty

## 👨‍💻 Developer

**Game by: Karan Chaurasia**

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

**Enjoy the race! 🏎️💨**