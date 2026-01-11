import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "CP Ressources Libres",
  description: "Ressources pédagogiques numériques libres pour les enseignants de CP",
  lang: 'fr-FR',
  
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }]
  ],

  themeConfig: {
    nav: [
      { text: 'Accueil', link: '/' },
      { text: 'Grandeurs et mesures', link: '/grandeurs-mesures/' },
      { text: 'Écriture', link: '/ecriture/' }
    ],

    sidebar: {
      '/grandeurs-mesures/': [
        {
          text: 'Les longueurs',
          items: [
            { text: 'Mesure 1 segment', link: '/grandeurs-mesures/mesure-1-segment' },
            { text: 'Mesure 2 segments', link: '/grandeurs-mesures/mesure-2-segments' },
            { text: 'Mesure 3 segments', link: '/grandeurs-mesures/mesure-3-segments' }
          ]
        }
      ],
      '/ecriture/': [
        {
          text: 'Exercices d\'écriture',
          items: [
            { text: 'Introduction', link: '/ecriture/' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/clublettreurs/cp-ressources-libres' }
    ],

    footer: {
      message: 'Contenus libres, modifiables et partageables.',
      copyright: 'Club des lettreurs © 2026'
    }
  }
})
