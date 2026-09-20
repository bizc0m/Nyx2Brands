# NYX White Label Studio

Générateur de Skins et de marques blanches pour le système NYX.

## Fonctions

- sélection de Skins NYX ;
- import du logo et extraction de palette ;
- personnalisation des tokens ;
- aperçu UX en direct ;
- génération du prompt de production ;
- export CSS et JSON ;
- sauvegarde locale dans le navigateur.

## Développement

```bash
npm install
npm run dev
```

## Publication

Chaque push sur `main` compile et déploie automatiquement le site sur GitHub Pages.

## Générateur d’intégration

L’atelier réunit quatre étapes : **Design & skin → Fonctions → Identité → Intégration**.
La galerie conserve les 13 références et les 25 skins indépendants.
Choisir les fonctions de plusieurs références, puis le nom, le logo et l’icône.
Le composeur avancé reste accessible et partage la sélection de fonctions.
Renseigner le chemin du projet cible et sa technologie, puis **Générer le kit
 d’intégration ZIP**. Le chemin est une consigne : aucune écriture n’y est faite.

Le ZIP contient le pack réimportable, un manifeste des fonctions et de leur
provenance, les références HTML complètes, les tokens CSS, l’adaptateur web
réversible, le contrat NoteMistress, les PNG fournis et `INTEGRATION.md`.
Les sources contiennent aussi des fonctions non cochées : le guide précise
qu’il faut adapter uniquement la sélection. L’aperçu du design exécute la référence originale dans un bac à sable,
avec stockage temporaire et réseau bloqué. Le mode « Avec ma palette »
applique les tokens compatibles ; il ne compose pas les fonctions sélectionnées.
L’aperçu inclus dans le ZIP reste visuel. Le branchement natif reste à réaliser
et à tester dans l’application cible.

**Enregistrer** conserve le pack et sa sélection dans le navigateur.
Le fichier `pack.neuroforge.json` du ZIP se réimporte avec **Importer un pack**.
Les choix du catalogue sont synchronisés avec le studio ; l’ancienne sélection
est reprise lorsque le pack n’a pas encore de configuration d’intégration.

## Bibliothèque de skins

Les presets NYX Studio, Nyx-Ux, Dashboard original et NeuroForge sont réunis.
Créer mon skin permet de générer une palette par teinte et mode, ou de sauvegarder
les réglages courants sous un nom unique dans Mes skins. Cette bibliothèque
est persistée séparément du projet dans le navigateur. Exporter le pack puis
l’importer permet de transporter le skin ; Enregistrer dans Mes skins le rend réutilisable.
Les couleurs secondaires des références sont ajustées lorsque leur contraste
ne satisfait pas le contrat commun. Aucun raccord natif automatique n’est ajouté.

## Adaptations CodePen

20 directions visuelles sont disponibles dans CodePen · adaptations (45 skins au total).
Ce sont des implémentations locales inspirées des références liées, pas des copies
complètes de leurs applications. Les couleurs, surfaces, bordures, ombres, rayons
et polices sont conservés dans le pack, avec la provenance. Aucun script tiers
ou asset distant ne s’exécute pour appliquer ces skins.

Le CSS exporté utilise data-nf-panel, data-nf-card, data-nf-button et data-nf-input.
L’adaptateur applique les variables visuelles à la racine et permet leur restauration.
Les effets web ne sont pas traduits automatiquement dans le contrat natif NoteMistress.

## Blocs UX appliqués

Blocs & références réunit 8 blocs interactifs et les 27 références fournies.
Sélectionner les blocs puis **Appliquer à mon aperçu** enregistre les choix et
affiche la composition dans l’aperçu principal. Changer de skin la met à jour.
**Design** permet de revoir le design de référence, **Ma composition** les blocs.
Le ZIP inclut la composition exécutable dans preview.html et blocs-ux.html,
ainsi que references.json et le manifeste. Les références sont documentaires :
aucun service tiers n’est connecté. La séquence organise des étapes sans rendu vidéo.

## Thèmes complets sur le moteur commun

Six compositions (cockpit, bibliothèque, bureau rétro, studio, terminal, lecture)
réorganisent les mêmes huit blocs. Elles se sélectionnent dans Design & skin.
Les 45 palettes restent indépendantes, et les 13 anciens documents restent des
références consultables : leur logique métier n’est pas fusionnée avec ces blocs.
L’aperçu principal et le ZIP utilisent le même rendu uxHTML. Le pack conserve la
composition, les favoris, les notes, la comparaison, les filtres et la séquence.
Les messages de session sont acceptés uniquement depuis l’iframe de composition
et après validation du contrat. Ils ne rechargent pas l’aperçu.
Enregistrer conserve le thème ; les actions de session actualisent le projet local
déjà enregistré. Les services externes restent à raccorder.
