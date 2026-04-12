# ECHONA Website Build Report (Viva Edition)

## 1. Project Summary

ECHONA is a full-stack mental wellness platform that combines:

- multimodal emotion detection (face, voice, text),
- mood tracking and analytics,
- music therapy recommendations,
- Spotify integration,
- wellness and planner workflows,
- and intelligent support modules.

The system is split into three runtime services:

1. Frontend (React + Vite) for UI and user interaction.
2. Backend API (Node.js + Express) for auth, business logic, and orchestration.
3. ML Service (Flask + Python) for emotion inference and music recommendation logic.

---

## 2. High-Level Architecture

### Frontend

- Technology: React 18, Vite, Tailwind, Framer Motion, Chart.js.
- Routing: protected and public routes.
- State: Auth context + Mood context.
- Network layer: a centralized Axios client with:
  - CSRF token injection,
  - retry logic for transient failures,
  - session-expiry handling,
  - user-friendly error normalization.

### Backend (Orchestrator Layer)

- Technology: Express + middleware stack.
- Security controls:
  - Helmet headers,
  - global and auth-specific rate limits,
  - CSRF double-submit cookie pattern,
  - session-based auth.
- Data routing:
  - mood routes,
  - auth/profile routes,
  - spotify routes,
  - wellness routes,
  - music-intel routes,
  - ML proxy routes.

### ML Service

- Technology: Flask + Python ML modules.
- Capabilities:
  - face detection endpoint,
  - voice detection endpoint,
  - text detection endpoint,
  - multimodal fusion endpoint,
  - recommendation endpoint.
- Reliability:
  - lazy loading of analyzers,
  - per-endpoint error handling,
  - structured prediction logs,
  - fallback inference strategies when models are unavailable.

---

## 3. End-to-End Request Flow

Typical mood detection flow:

1. User opens Mood Detection page and chooses face/voice/text/chat mode.
2. Frontend captures raw input and sends request to backend `/api/ml/*` endpoints.
3. Backend `mlRoutes` validates payload and proxies request to Flask ML service with retry and timeout strategy.
4. ML service runs model inference (or fallback path) and returns emotion + confidence + source.
5. Frontend normalizes response (`mood = mood || emotion`) and stores detected mood.
6. Mood is persisted via mood context to backend mood routes.
7. User is redirected to music and dashboard flows for recommendations and analytics.

Why this architecture is strong for viva:

- frontend stays simple,
- backend centralizes policy and resiliency,
- ML service remains independently deployable and scalable.

---

## 4. ML Integration: Technical Details

## 4.1 ML API Layer (Flask)

Main endpoints:

- `POST /detect-face`
- `POST /detect-voice`
- `POST /detect-text`
- `POST /detect-multimodal`
- `GET /recommend`
- `GET /health`

Each endpoint returns standardized JSON with `success`, `emotion/mood`, `confidence`, and `source` metadata.

The service writes prediction traces into `ml/logs/predictions.json` for observability and debugging.

## 4.2 Face Emotion Pipeline

Input: base64 image.

Pipeline:

1. Decode image.
2. Convert to grayscale.
3. Detect face using Haar cascade.
4. If no face box: use full-frame fallback ROI.
5. Run priority chain:
   - Trained Keras CNN model (`face_emotion_model.h5`), else
   - DeepFace fallback (if installed), else
   - brightness heuristic fallback.
6. Map 7-class face output into app mood labels.

Output includes confidence and inference source (`trained_model`, `deepface`, `heuristic`, etc.).

## 4.3 Voice Emotion Pipeline

Input: uploaded audio or base64 audio.

Pipeline:

1. Normalize clip to fixed duration and sample rate.
2. Extract acoustic features via Librosa:
   - MFCC (mean/std),
   - chroma,
   - spectral contrast,
   - mel-spectrogram statistics,
   - zero-crossing rate,
   - RMS energy.
3. Run trained sklearn classifier from `voice_emotion_model.pkl`.
4. If unavailable/fails, fallback to energy+tempo+pitch heuristic.

Output: emotion + confidence + source.

## 4.4 Text Emotion Pipeline

Input: plain text from journal/chat/manual text.

Priority cascade:

1. Fine-tuned transformer model from local folder `text_emotion_model/` (if present).
2. Trained TF-IDF + LogisticRegression model (`text_emotion_model.pkl`).
3. Pretrained HuggingFace emotion model.
4. Keyword-based heuristic classifier.

Extra calibration:

- A post-rule adjusts lonely-related false negatives (common anxious/lonely confusion).

Output: emotion + confidence + source (`fine_tuned`, `sklearn`, `pretrained_hf`, `keyword`, etc.).

## 4.5 Multimodal Fusion

Inputs: any subset of face, voice, text.

Fusion strategy:

1. Convert each modality output to a probability vector across 10 app emotions.
2. If all three modalities exist and meta-model is available:
   - use trained fusion classifier (`fusion_model.pkl`),
   - method reported as `dynamic`.
3. Otherwise fallback to weighted vote:
   - face weight = 0.40,
   - voice weight = 0.30,
   - text weight = 0.30,
   - method reported as `weighted`.

Response includes:

- final emotion,
- confidence,
- per-emotion vote distribution,
- modalities breakdown.

---

## 5. How Models Were Trained (What To Say In Viva)

Important truth from current repository state:

- This repository stores trained model artifacts (`.h5`, `.pkl`) and metrics logs.
- Training scripts are not currently present in this workspace.
- So the deployed app is an inference-serving codebase with persisted trained models.

How to explain training process correctly:

1. Data collection and labeling were done offline per modality.
2. Feature engineering/model selection done per modality:
   - face: CNN on facial expression images,
   - voice: handcrafted acoustic features + sklearn classifier,
   - text: TF-IDF + LogisticRegression and optional transformer fine-tune,
   - fusion: meta-classifier on stacked modality probabilities.
3. Models serialized to `ml/models/`.
4. Evaluation metrics exported to `ml/logs/*_model_metrics.json`.
5. Runtime only loads those artifacts lazily for fast startup and memory efficiency.

### Metrics Evidence (from your logs)

- Face model:
  - samples: 7,178
  - classes: 7
  - accuracy: 0.635
  - epochs: 30

- Voice model:
  - samples: 576
  - classes: 6
  - best model: SVM (RBF)
  - accuracy: 0.9549

- Text model:
  - samples: 31,684
  - classes: 10
  - vectorizer: TF-IDF (1,2)-gram, 50k
  - classifier: LogisticRegression
  - accuracy: 0.4463

- Fusion model:
  - samples: 800
  - classes: 10
  - best model: LogisticRegression
  - accuracy: 0.9587

Viva note:

- The high fusion score is expected because combining modalities reduces single-model ambiguity.
- Text is hardest due to language ambiguity and class overlap.

---

## 6. Feature-by-Feature Technical Working

## 6.1 Authentication and Session Management

- Google login and profile endpoints on `/api/auth/*`.
- Session cookies (not pure token-only auth flow).
- CSRF token issued and validated for state-changing requests.
- Frontend auto-refreshes auth state via `/api/auth/me`.

## 6.2 Mood Detection

- UI mode selection: Face, Voice, Text, Guided Chat.
- Face mode samples multiple frames and performs weighted voting to improve stability.
- Voice mode records in-browser, converts blob to base64, sends to ML API.
- Text/chat mode sends sanitized text to text detector.
- Final mood stored in local context + backend mood history.

## 6.3 Mood Tracking and Dashboard

- Mood records persisted through `/api/mood/add`, fetched via `/api/mood/history`.
- Dashboard computes trend deltas, streaks, dominant mood, averages.
- Chart.js visualizes timeline and mood composition.

## 6.4 Music Recommendation and Therapy

- Mood feeds recommendation logic.
- ML recommendation endpoint maps emotion to therapy context and song pool.
- Energy filter and random sampling used for variety.
- Therapy context explains goal/strategy/tags per mood.

## 6.5 Spotify Integration

- OAuth flow via `/api/spotify/login` and callback.
- Access user profile, playlists, top artists/tracks, recent plays.
- Playback control endpoint allows in-app play commands.
- Frontend has retry logic for search/play reliability.

## 6.6 Music Intelligence Features

Backend module `/api/music-intel/*` powers:

- advanced search,
- recommendation controls,
- mood transition/rescue suggestions,
- impact logging and weekly summaries,
- healing room collaboration (create/join/message/close).

## 6.7 Wellness Intelligence Hub

Backend module `/api/wellness/*` powers:

- wellness state retrieval,
- habits capture,
- mood synchronization from history,
- copilot conversation and reply generation,
- journal CRUD,
- planner item CRUD.

## 6.8 Planner and Productivity

- Todo planner reads/writes through wellness planner endpoints.
- Supports metadata such as status, effort, tags and workflow-friendly views.

## 6.9 Surprise and Mini Challenges

- Surprise route serves dynamic content with optional mood-aware variant.
- Game routes track mini challenge score submissions.

---

## 7. Reliability, Performance, and Security

## Reliability

- ML proxy retries for transient errors and cold starts.
- Distinct health endpoints for frontend-backend-ML diagnostics.
- Graceful shutdown and port conflict detection.
- Fallback inference in ML modules to avoid hard downtime.

## Performance

- Lazy loading for large models and lazy-loaded React routes.
- Caching for recommendation responses in ML service.
- Request timeouts and controlled retries.

## Security

- Helmet, CORS policy, rate limits.
- Session cookies with environment-aware security flags.
- CSRF token validation on unsafe HTTP methods.

---

## 8. Deployment and Operations

Local startup:

- `start-all.ps1` starts ML, backend, frontend in separate windows.
- Script checks service health and waits until ready.

Production behavior:

- backend has keep-alive ping support in production mode.
- ML proxy uses longer timeouts in production to survive cold starts.

---

## 9. Suggested Viva Talking Script (Short)

Use this 60-90 second script:

"ECHONA is a three-service architecture: React frontend, Express backend, and Flask ML microservice. The frontend never directly calls models in production; it talks to backend ML proxy routes. The backend handles validation, retries, security, sessions, and CSRF. The ML service performs modality-specific inference for face, voice, and text, then fuses them with a dynamic meta-classifier when all modalities exist, otherwise weighted fusion with 40/30/30 weights. Trained model artifacts are persisted as .h5/.pkl files, and model performance logs are stored in JSON. After mood detection, the app powers dashboard analytics, music therapy recommendations, Spotify integration, wellness planner features, and intelligence modules."

---

## 10. Viva Questions You May Get

### Q1: Why use a separate ML service?

Because Python ML dependencies are heavy and isolated from Node runtime concerns. This improves deployability, scaling flexibility, and cleaner separation of concerns.

### Q2: Why do you need backend proxy to ML?

To centralize validation, retries, auth/session compatibility, cold-start handling, and consistent API contracts to frontend.

### Q3: Why multimodal fusion?

Single modality can be noisy. Fusion combines complementary signals and generally improves reliability, as reflected by higher fusion metrics.

### Q4: What if model fails in production?

There are fallback paths (DeepFace/heuristics/keyword), retry mechanisms, and health checks. So service degrades gracefully instead of crashing.

### Q5: What are current limitations?

- Text model quality can still improve.
- Training scripts are not packaged in this repo.
- Some classes are harder due to overlap (for example anxious vs lonely).

---

## 11. Future Improvements

1. Add reproducible training pipelines and dataset versioning into repo.
2. Add calibration and confidence thresholds per modality for better uncertainty handling.
3. Add model drift monitoring and periodic retraining jobs.
4. Add multilingual text emotion model fine-tuning.
5. Add real-time streaming fusion for continuous mood tracking.

---

This report is intentionally technical and viva-oriented so you can explain design decisions, implementation flow, and ML integration clearly under questioning.