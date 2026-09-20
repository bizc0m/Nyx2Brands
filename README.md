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

## Base active : Nyx intégré

L’atelier utilise maintenant la source existante **Nyx intégré** comme application
active : Dashboard, Documents et Registry sont conservés. Les huit blocs locaux
et les 27 références se trouvent dans la Blade Bibliothèque de cette même base.
Les palettes, le nom, le logo et l’icône viennent du projet partagé ; changer de
palette ne recharge pas Documents. L’espace Documents, Registry et les onglets
sont sauvegardés localement et inclus dans le pack avec l’état des blocs.

Le générateur inclut la même base dans `preview.html` et `nyx-integre.html`.
`npm run build` régénère cette base depuis le catalogue original préservé ; le
script refuse les changements de structure qu’il ne reconnaît pas. Les anciens
exports de composition restent compatibles, mais leur galerie n’est plus le
parcours principal.

Limites : les références restent documentaires et les services externes ne sont
pas connectés. Les autres applications historiques restent des sources ; leur
logique métier n’est pas automatiquement fusionnée. Les palettes adaptent les
couleurs de la base, elles ne remplacent pas son architecture d’interface.

L’interface ouvre directement l’espace Nyx sur toute la fenêtre. La barre commune
regroupe le thème, Personnaliser, Exporter et Enregistrer. Les réglages se replient
sans démonter Documents ; sur petit écran ils passent au-dessus de l’espace.
Les icônes du shell sont incluses depuis la dépendance locale lucide-react.
