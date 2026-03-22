# Blog Posts Directory

Deze directory bevat alle blogposts voor de website. Elke blogpost heeft zijn eigen bestand voor betere organisatie en onderhoud.

## 📁 Structuur

```
src/data/blog-posts/
├── README.md                                    # Dit bestand
├── index.ts                                     # Exporteert alle blogposts
├── de-toekomst-van-web-development-trends-2024.ts
├── react-18-nieuwe-features-developers.ts
├── seo-voor-developers-technische-optimalisatie.ts
└── [nieuwe-blogpost].ts                        # Nieuwe blogposts
```

## ✍️ Nieuwe Blogpost Toevoegen

### 1. Maak een nieuw bestand
Maak een nieuw TypeScript bestand met de naam van je blogpost (gebruik kebab-case):
```
mijn-nieuwe-blogpost.ts
```

### 2. Kopieer de template
```typescript
import { BlogPost } from '@/lib/blog-api';

export const blogPost: BlogPost = {
  id: '5', // Uniek ID (volgende nummer)
  title: 'Jouw Blogpost Titel',
  excerpt: 'Korte beschrijving van je artikel die op de blog overzichtspagina wordt getoond.',
  content: `# Jouw Blogpost Titel

Hier komt de volledige inhoud van je artikel. Je kunt markdown gebruiken:

## Sectie 1
Tekst hier...

### Sub-sectie
Meer tekst...

## Code voorbeelden
\`\`\`javascript
const example = "Hallo wereld";
console.log(example);
\`\`\`

## YouTube Video's
Voeg YouTube video's toe door simpelweg de URL op een nieuwe regel te zetten:

https://www.youtube.com/watch?v=VIDEO_ID

Of gebruik de korte URL:
https://youtu.be/VIDEO_ID

## Conclusie
Je conclusie hier...
  `,
  author: 'Web Developer', // Je naam
  publishedAt: '2024-01-20', // Publicatiedatum (YYYY-MM-DD)
  updatedAt: '2024-01-20', // Laatste wijzigingsdatum
  category: 'Technology', // Categorie (bijv. Technology, React, SEO, etc.)
  tags: ['Tag1', 'Tag2', 'Tag3'], // Tags voor je artikel
  image: 'https://images.unsplash.com/photo-...', // URL naar een afbeelding
  slug: 'jouw-blogpost-slug', // URL-vriendelijke versie van je titel
  readTime: 5 // Geschatte leestijd in minuten
};
```

### 3. Voeg toe aan index.ts
Open `index.ts` en voeg je nieuwe blogpost toe:

```typescript
import { blogPost as post4 } from './de-toekomst-van-web-development-trends-2024';
import { blogPost as post5 } from './react-18-nieuwe-features-developers';
import { blogPost as post6 } from './seo-voor-developers-technische-optimalisatie';
import { blogPost as post7 } from './jouw-nieuwe-blogpost'; // Nieuwe import

export const blogPosts = [
  post4,
  post5,
  post6,
  post7 // Nieuwe blogpost toevoegen
];

// Export individual posts for easier access
export { post4, post5, post6, post7 }; // Nieuwe export toevoegen
```

## 📝 Best Practices

### Content
- Gebruik **markdown** voor de content
- Voeg **code voorbeelden** toe waar relevant
- Gebruik **duidelijke koppen** (H1, H2, H3)
- Voeg **conclusies** toe aan je artikelen
- Gebruik **YouTube video's** voor extra uitleg
- Code blokken worden automatisch weergegeven in een mooie terminal-achtige interface

### Metadata
- **ID**: Gebruik een uniek nummer
- **Slug**: URL-vriendelijk (geen spaties, speciale tekens)
- **Tags**: Voeg relevante tags toe voor betere categorisering
- **Image**: Gebruik hoogwaardige afbeeldingen (bijv. Unsplash)
- **ReadTime**: Schat de leestijd realistisch in

### Afbeeldingen
- Gebruik **Unsplash** voor gratis, hoogwaardige afbeeldingen
- Zorg voor **consistente aspect ratio**
- Voeg **alt text** toe in de content

## 🔧 Technische Details

- Alle blogposts worden automatisch geladen door de API
- De content wordt gerenderd als markdown
- SEO metadata wordt automatisch gegenereerd
- Responsive design werkt automatisch
- Code blokken worden weergegeven in een terminal-achtige interface met kopieer functionaliteit
- YouTube video's worden automatisch geëmbed en responsive weergegeven

## 💻 Code Blokken

Code blokken worden automatisch weergegeven in een mooie terminal-achtige interface:

- **Donkere achtergrond** (zwart/grijs)
- **Kopieer knop** voor eenvoudig kopiëren van code
- **Taal detectie** (javascript, python, css, etc.)
- **Syntax highlighting** voor betere leesbaarheid
- **Responsive design** voor alle apparaten

### Voorbeeld:
\`\`\`javascript
const greeting = "Hallo wereld!";
console.log(greeting);
\`\`\`

## 📺 YouTube Video's

YouTube video's worden automatisch geëmbed en responsive weergegeven:

- **Responsive design** - past zich aan aan alle schermformaten
- **Automatische embed** - geen extra code nodig
- **Ondersteunt beide URL formaten**:
  - `https://www.youtube.com/watch?v=VIDEO_ID`
  - `https://youtu.be/VIDEO_ID`

### Voorbeeld:
```
https://www.youtube.com/watch?v=dQw4w9WgXcQ
```

## 📚 Voorbeelden

Bekijk de bestaande blogposts voor inspiratie:
- `de-toekomst-van-web-development-trends-2024.ts`
- `react-18-nieuwe-features-developers.ts`
- `seo-voor-developers-technische-optimalisatie.ts`

## 🚀 Deployment

Na het toevoegen van een nieuwe blogpost:
1. Sla alle bestanden op
2. Test lokaal
3. Deploy naar productie
4. De nieuwe blogpost verschijnt automatisch op de website
