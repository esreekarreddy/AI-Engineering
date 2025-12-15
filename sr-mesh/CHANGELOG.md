# Changelog

All notable changes to SR Mesh will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.1.0] - 2025-12-16

### Added

- **Intelligent Text Classification**: Rule-based categorization into 9 meaningful categories
  - Questions: WH-words, question marks, auxiliary verb starters
  - Insights: Opinions, evaluations, recommendations
  - Facts: Definitions, declarative statements, subset relationships
  - Learning: Educational content, study notes, tutorials
  - Projects: Development tasks, action items, milestones
  - Personal: Self-referential content, emotions, goals
  - Work: Meetings, deadlines, professional context
  - Ideas: Creative suggestions, hypotheticals
  - Creative: Artistic content, writing, music
- **Enhanced Tooltip Visibility**:
  - Font sizes increased (0.2→0.38, 0.12→0.22)
  - Background size increased (3.5×0.9→6.0×1.7)
  - Added colored glow/border effect for better contrast
  - Readable at 100% zoom without leaning in
- **textClassifier.ts**: 400-line comprehensive text classification module
- **textClassifier.test.ts**: 23 tests covering all categories and edge cases

### Changed

- Clustering now uses content-based labels instead of position-based
- K-means groups notes by semantic similarity (colors), text classifier assigns labels
- Removed "learn" as standalone keyword to avoid false positives with "machine learning"

### Technical

- 34 total tests passing (11 existing + 23 new)
- Added `test` script to package.json
- Fixed Vitest imports for test file

## [2.0.0] - 2025-12-08

### Added

- **Force-Directed Layout**: D3-force-3d physics simulation for organic node positioning
- **K-Means Clustering**: Auto-group notes by semantic similarity with 8 vibrant colors
- **Bloom Post-Processing**: Premium glow effects via @react-three/postprocessing
- **Toast Notifications**: Professional UI feedback replacing browser alerts
- **Confirm Dialogs**: Custom modal dialogs for destructive actions
- **Keyboard Shortcuts**: `⌘K` for search, `Escape` to close modals
- **Error Boundary**: Graceful WebGL error handling with recovery UI
- **Loading Skeleton**: Animated loading state while 3D canvas initializes
- **Export/Import**: JSON backup and Markdown export functionality
- **CRUD Operations**: Full create, read, update, delete for notes
- **Clickable Nodes**: Click any 3D node to view/edit content
- **Hover Effects**: Glow, ring animation, and label preview on hover
- **Edge Visualization**: Lines between similar notes with opacity based on weight

### Changed

- Increased node sizes for better visibility (0.22 → 0.45 radius)
- Refactored Galaxy.tsx to use useMemo instead of useState/useEffect
- Improved K-means++ initialization for better color variety
- Updated README with comprehensive feature documentation

### Technical

- Added 11 unit tests (vector math + clustering)
- Added TypeScript type definitions for d3-force-3d
- Wrapped Scene in CanvasErrorBoundary
- Added Suspense boundary with LoadingSkeleton

## [1.0.0] - 2025-12-07

### Added

- Initial release
- Local AI embedding generation (Transformers.js + ONNX)
- 3D visualization with Three.js + React Three Fiber
- Semantic search by meaning
- Real-time related notes in editor sidebar
- IndexedDB persistence
- Basic node visualization
- SEO metadata and sitemap
