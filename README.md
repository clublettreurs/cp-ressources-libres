CP — Ressources Libres
======================

Ressources pédagogiques interactives gratuites pour les enseignantes et enseignants de CP. Ce dépôt contient des exercices pour tableau numérique interactif autour des grandeurs & mesures et de l’écriture cursive, fondés sur des contenus libres et modifiables.

Accès en ligne
- Site publié (GitHub Pages) : https://clublettreurs.github.io/cp-ressources-libres/

Aperçu
- Exercices : Mesurer avec un étalon, comparer des chemins, tracer des lettres et des mots.
- Conçus pour une utilisation TNI / projecteur en classe.

Installation locale (développement)
```bash
git clone https://github.com/clublettreurs/cp-ressources-libres.git
cd cp-ressources-libres
npm install
# serveur de dev
npm run docs:dev
# build production
npm run docs:build
```

Déploiement (rappel)
- Le site se génère dans `docs/.vitepress/dist`.
- Le site est publié sur la branche `gh-pages` à la racine du site. Exemple de procédure manuelle :
```bash
npm run docs:build
rm -rf /tmp/gh-pages && mkdir -p /tmp/gh-pages
cp -a docs/.vitepress/dist/. /tmp/gh-pages/
cd /tmp/gh-pages
git init
git checkout -B gh-pages
git remote add origin https://github.com/clublettreurs/cp-ressources-libres.git
git add -A
git commit -m "Deploy site"
git push -f origin gh-pages
```
- Important : `docs/.vitepress/config.js` contient `base: '/cp-ressources-libres/'` pour que les liens et assets fonctionnent sur GitHub Pages. Ne pas l'enlever.

Licence
- Ce dépôt est publié sous **Creative Commons Attribution 4.0 International (CC BY 4.0)**. Voir le fichier `LICENSE` pour le texte complet.

