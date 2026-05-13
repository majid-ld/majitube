# 🎥 DashTube - Plateforme Vidéo Premium & VIP

Bienvenue sur la documentation officielle de **DashTube** (nom de code). 
Cette application est une plateforme de streaming vidéo complète de qualité professionnelle (SaaS), conçue pour offrir une expérience utilisateur hybride entre YouTube et Netflix, avec une gestion avancée d'audience privée (VIP).

---

## 🌟 Présentation du Projet

Cette plateforme permet aux créateurs de contenu de publier, d'organiser et de monétiser leurs vidéos. Son innovation majeure réside dans son architecture cloud : elle utilise l'API **Google Drive** comme serveur vidéo de haute performance pour annuler les coûts de serveurs classiques, couplée à une base de données ultra-rapide et un design "Glassmorphism" ultra-moderne.

---

## 🎯 Fonctionnalités Clés (Features)

### 🧑‍💻 Pour les Créateurs (Éditeurs / Admins)
* **Tableau de Bord Complet (Dashboard) :** Une vue globale sur le nombre de vues, les abonnés et le stockage utilisé.
* **Upload Vidéo Optimisé :** Les vidéos sont hébergées de manière sécurisée et streamées en temps réel.
* **Gestion d'Audience VIP :** Les créateurs peuvent approuver ou rejeter les demandes d'accès VIP de leurs spectateurs. Ils peuvent retirer l'accès à un membre à tout moment d'un simple clic.
* **Personnalisation de Profil :** Modification de la miniature (avatar), ajout d'une biographie, et intégration des réseaux sociaux (TikTok, Snapchat, Instagram, etc.).

### 🍿 Pour les Spectateurs
* **Lecteur Vidéo Immersif :** Un player professionnel adapté à tous les écrans, sans distractions.
* **Interactions Sociales :** 
  * Système de commentaires imbriqués (répondre à d'autres commentaires).
  * Système de "J'aime" / "Je n'aime pas".
  * S'abonner à un créateur pour ne rater aucune de ses vidéos.
* **Gestion Personnelle :**
  * **Historique de lecture :** Retrouver facilement les vidéos déjà visionnées.
  * **À regarder plus tard (Watch Later) :** Mettre de côté une vidéo pour plus tard en un clic.
  * **Playlists Personnalisées :** Créer des collections de vidéos sur mesure.
* **Accès VIP :** Faire une demande officielle pour accéder aux vidéos privées/exclusives d'un créateur.

---

## 🔐 Sécurité & Performances

La plateforme a été auditée et développée avec les normes de cybersécurité les plus strictes de l'industrie :
1. **Protection XSS :** Les systèmes d'upload de fichiers (Avatars et Miniatures) sont verrouillés pour n'accepter que des formats d'images stricts, rendant l'injection de scripts impossible.
2. **Anti-Injection SQL :** 100% des requêtes vers la base de données utilisent des "Prepared Statements" (requêtes préparées).
3. **Sessions Sécurisées :** Le système de connexion utilise des Cookies JWT chiffrés, avec les attributs `HttpOnly` et `Secure`, invulnérables au vol de session.

---

## 🛠️ Stack Technique

* **Frontend :** Next.js 14 (App Router), React, Tailwind CSS (Design System).
* **Backend :** API Routes Next.js (Node.js).
* **Base de données :** SQLite (`better-sqlite3`) pour des performances relationnelles massives en temps réel.
* **Stockage Médias :** Google Drive API v3 (Streaming) & Stockage Local (Miniatures).
* **Authentification :** JWT (JSON Web Tokens) & Bcrypt (Hachage cryptographique des mots de passe).

---

## 🚀 Installation & Lancement Rapide

Si vous souhaitez exécuter ce projet localement sur votre machine, suivez ces étapes :

1. **Prérequis :** Assurez-vous d'avoir [Node.js](https://nodejs.org/) installé sur votre machine.
2. **Ouvrir le terminal** dans le dossier du projet.
3. **Installer les dépendances :**
   ```bash
   npm install
   ```
4. **Lancer le serveur de développement :**
   ```bash
   npm run dev
   ```
5. **Accéder au site :** Ouvrez votre navigateur et allez sur `http://localhost:3000`.

*(Note : Lors de la première inscription sur le site, le tout premier compte créé obtiendra automatiquement les droits "Administrateur").*

---
*Développé avec exigence et précision pour offrir la meilleure expérience de streaming possible.*
