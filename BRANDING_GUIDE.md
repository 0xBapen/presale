# QuantumRaise Branding Guide

## 🎨 Brand Identity

**QuantumRaise** is a cutting-edge presale platform that combines quantum-inspired design with blockchain technology.

---

## Logo

### Primary Logo (Icon)
![Logo Icon](public/images/logo-icon.jpg)

**Usage:**
- Navbar icon
- Favicon
- App icon
- Social media profile pictures
- Square placements

**Dimensions:** Square format, works at any size
**File:** `public/images/logo-icon.jpg`

### Secondary Logo (Banner)
![Logo Banner](public/images/logo-banner.jpg)

**Usage:**
- Homepage hero
- Email headers
- Wide banners
- Landing pages
- Marketing materials

**Dimensions:** Wide format with waveforms
**File:** `public/images/logo-banner.jpg`

---

## Color Palette

### Primary Colors

```css
Cyan:    #00F0FF  rgb(0, 240, 255)
Blue:    #0066FF  rgb(0, 102, 255)
Purple:  #9D00FF  rgb(157, 0, 255)
Pink:    #FF00FF  rgb(255, 0, 255)
```

### Gradients

**Main Gradient (Logo):**
```css
background: linear-gradient(135deg, #00F0FF 0%, #0066FF 50%, #9D00FF 75%, #FF00FF 100%);
```

**Button Gradient:**
```css
background: linear-gradient(to right, #9D00FF, #0066FF, #FF00FF);
```

**Text Gradient:**
```css
background: linear-gradient(135deg, #00F0FF, #9D00FF);
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
```

### Neutral Colors

```css
Black:      #000000
Dark Gray:  #1a1a1a
Gray:       #333333
Light Gray: #666666
White:      #ffffff
```

---

## Typography

### Fonts

**Primary Font:** System font stack (for performance)
```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
```

### Font Weights

- **Regular:** 400 - Body text
- **Medium:** 500 - Subheadings
- **Semibold:** 600 - Buttons, labels
- **Bold:** 700 - Headings, emphasis

### Font Sizes

```css
text-6xl:  3.75rem (60px)  - Main hero
text-5xl:  3rem (48px)     - Page titles
text-4xl:  2.25rem (36px)  - Section headers
text-3xl:  1.875rem (30px) - Card titles
text-2xl:  1.5rem (24px)   - Subheadings
text-xl:   1.25rem (20px)  - Large body
text-lg:   1.125rem (18px) - Body text
text-base: 1rem (16px)     - Default
text-sm:   0.875rem (14px) - Small text
text-xs:   0.75rem (12px)  - Tiny text
```

---

## Design Elements

### Glassmorphism

```css
.glass-effect {
  background: rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.05);
}
```

### Cards

```css
.card {
  background: rgba(31, 41, 55, 0.5);
  border: 1px solid rgba(55, 65, 81, 0.5);
  border-radius: 1rem;
  padding: 2rem;
}

.card-hover:hover {
  transform: translateY(-4px);
  border-color: rgba(157, 0, 255, 0.5);
  box-shadow: 0 0 40px rgba(157, 0, 255, 0.2);
}
```

### Buttons

**Primary Button:**
```css
.btn-primary {
  background: linear-gradient(to right, #9D00FF, #0066FF, #FF00FF);
  color: white;
  padding: 1rem 2rem;
  border-radius: 0.75rem;
  font-weight: 600;
}

.btn-primary:hover {
  opacity: 0.9;
}
```

**Secondary Button:**
```css
.btn-secondary {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  padding: 1rem 2rem;
  border-radius: 0.75rem;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.1);
}
```

---

## UI Components

### Navigation Bar

- **Height:** 5rem (80px)
- **Background:** Glassmorphism effect
- **Logo:** Icon + "QuantumRaise" text
- **Links:** Gradient underline on hover
- **Wallet Button:** Gradient background

### Hero Section

- **Background:** Black with animated gradient orbs
- **Logo:** Banner logo centered
- **Title:** "QuantumRaise" with gradient text
- **Subtitle:** Gray text, centered
- **CTA Buttons:** Primary + Secondary side by side

### Cards

- **Border Radius:** 1rem (16px)
- **Padding:** 2rem (32px)
- **Border:** Subtle white/10 opacity
- **Hover:** Lift effect + purple glow

### Forms

- **Input Background:** Dark gray (#1f2937)
- **Input Border:** Gray (#374151)
- **Focus State:** Purple border (#9D00FF)
- **Border Radius:** 0.5rem (8px)

---

## Animation

### Fade In
```css
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
```

### Float
```css
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}
```

### Gradient Animation
```css
@keyframes gradient {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
```

---

## Brand Voice

### Tone
- **Professional** yet **approachable**
- **Innovative** and **cutting-edge**
- **Trustworthy** and **secure**
- **Transparent** and **honest**

### Key Messages

1. **Security First**: "Secure x402 escrow protecting your investments"
2. **Automation**: "Fully automated - no manual claims needed"
3. **Speed**: "Built on Solana for lightning-fast transactions"
4. **Transparency**: "All transactions on-chain and verifiable"

### Taglines

- "Raising the future of blockchain"
- "Secure presales, powered by Solana"
- "The ultimate presale platform"
- "Where innovation meets security"

---

## Usage Examples

### Homepage Hero
```
[Logo Banner]

QuantumRaise
The Ultimate Secure Presale Platform on Solana

Launch your token presale with secure x402 escrow integration.
Built on Solana for lightning-fast, transparent, and trustless fundraising.

[Browse Presales]  [Launch Your Presale]
```

### Presale Card
```
┌─────────────────────────────────────┐
│  [Project Logo]                     │
│                                     │
│  Project Name                    ✓  │
│  Short description here...          │
│                                     │
│  [$50K / $100K raised]             │
│  [Progress Bar: 50%]               │
│                                     │
│  [Invest Now]                      │
└─────────────────────────────────────┘
```

---

## Social Media

### Profile Picture
Use the **logo icon** (square format)

### Cover Photo
Use the **logo banner** (wide format)

### Post Templates

**Twitter:**
```
🚀 New presale live on QuantumRaise!

Project: [Name]
Target: $[Amount]
Token: $[Ticker]

Invest now with secure x402 escrow ⚡

[Link]

#Solana #Presale #Crypto
```

**Discord:**
```
**New Presale Alert** 🎉

A new project just launched on QuantumRaise!

📊 **[Project Name]**
💰 Raising: $[Amount]
🎯 Min investment: $[Amount]
⏰ Ends: [Date]

Invest securely with x402 escrow protection.

[View Presale] → [Link]
```

---

## File Naming Conventions

- Logo icon: `logo-icon.jpg` / `logo-icon.png`
- Logo banner: `logo-banner.jpg` / `logo-banner.png`
- Favicon: `favicon.ico`
- OG Image: `og-image.jpg` (1200x630px)

---

## Dos and Don'ts

### ✅ Do:
- Use gradient text for "QuantumRaise"
- Maintain consistent spacing and padding
- Use glassmorphism effects
- Keep animations subtle and smooth
- Use the quantum network sphere in marketing

### ❌ Don't:
- Stretch or distort logos
- Use colors outside the palette
- Mix multiple gradients in one element
- Use busy backgrounds behind text
- Remove the orbital rings from the logo

---

## Brand Assets Location

All brand assets are located in:
```
presale-platform/public/images/
├── logo-icon.jpg      # Square logo
└── logo-banner.jpg    # Wide banner logo
```

---

**QuantumRaise** - Consistent, quantum-inspired branding for the future of presales. 🚀

