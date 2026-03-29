Outfit AI: Smart Closet & AI Styling Assistant
=================================================

Overview
-----------

**Outfit AI** is a next-generation digital wardrobe and intelligent styling assistant built using **React Native, Node.js, and AI-powered services**. It enables users to digitize their physical closet and transform it into a smart, searchable, and interactive fashion system.

Users can upload images of their clothes, and the system automatically:

*   Removes the background
    
*   Analyzes the clothing using Vision AI
    
*   Extracts rich metadata (color, category, fabric, style, formality, etc.)
    
*   Stores everything in a structured and searchable format
    

Beyond organization, Outfit AI acts as a **personal stylist in your pocket**. Users can ask natural questions like:

> _"What should I wear for a dinner date?"_

The system intelligently:

*   Filters relevant clothes
    
*   Generates outfit combinations
    
*   Scores them using fashion logic (color harmony & compatibility)
    
*   Uses an LLM to explain the final recommendation with styling tips
    

It also includes:

*   **Design Room**
    
*   **Virtual Try-On Integration**
    
*   **Semantic Smart Search**
    

Problem Statement
-------------------

Managing a physical wardrobe is inefficient and mentally taxing.

### Key Issues:

*   No visibility of all owned clothes
    
*   Repetitive outfit usage despite having options
    
*   Difficulty in pairing clothes properly
    
*   Time-consuming outfit decisions
    
*   Manual effort in existing wardrobe apps
    
*   Generic styling suggestions not tailored to user-owned items
    

Solution
-----------

Outfit AI solves these problems using **automation + AI + intelligent logic systems**:

### Zero-Friction Digitization

*   Upload an image → everything else is automated
    
*   No manual tagging required
    

### Semantic Understanding

*   Natural language queries like _"coffee date"_ or _"interview"_ work seamlessly
    

### Intelligent Outfit Generation

*   Uses **algorithmic scoring + LLM reasoning**
    
*   Ensures both logical correctness and human-like explanations
    

### Interactive Styling Experience

*   AI outfit builder
    
*   Virtual try-on visualization
    

Architecture
----------------

### Frontend (React Native + Expo)

*   UI rendering and user interaction
    
*   Zustand for global state management
    
*   Gesture-based interactions (Design Room)
    
*   AsyncStorage for token persistence
    

### Backend (Node.js + Express)

*   REST API handling
    
*   AI orchestration layer
    
*   Business logic & scoring engine
    

### Database

*   MongoDB with Mongoose ORM
    

### Media Handling

*   Cloudinary for image storage
    

### AI Aggregation Layer

Multiple AI services are orchestrated:

*   Background removal → @imgly/background-removal-node
    
*   Image tagging → Gemini Vision
    
*   Semantic search → HuggingFace embeddings
    
*   Outfit reasoning → LLM
    

Tech Stack
-------------
### Frontend

*   React Native (Expo)    
*   NativeWind (Tailwind CSS) 
*   Zustand   
*   React Navigation   
*   Reanimated + Gesture Handler   
*   Axios   
*   AsyncStorage
    

### Backend

*   Node.js
*   Express.js
*   MongoDB + Mongoose
*   JWT Authentication
    
### AI & Integrations

*   Google Gemini 2.5 Flash (Vision AI) 
*   HuggingFace Inference (Embeddings)  
*   OpenRouter (LLMs)
*   RapidAPI (Virtual Try-On) 
*   @imgly/background-removal-node
    

Features
----------

### 🔹 Core Features

####  AI Upload & Auto Tagging

*   Automatic background removal
*   AI-based metadata extraction:
    
    *   Category, subcategory
    *   Color (primary/secondary) 
    *   Fabric, fit, pattern
    *   Formality, weather suitability
        

#### Smart Search (Semantic)

*   Natural language queries
*   Embedding-based cosine similarity
*   Context-aware results (not keyword-based)
    
### Advanced Features

####  Virtual Try-On

*   Upload user image + clothing item
*   AI-generated try-on visualization
    

### Security Features

*   Password hashing using bcrypt
*   JWT-based authentication
*   Authorization checks for data ownership
*   Protected routes
    

API Design
-------------

| Endpoint                         | Method | Purpose                                                                 |
|----------------------------------|--------|-------------------------------------------------------------------------|
| `/api/auth/register`            | POST   | Hashes password and registers a new user                                |
| `/api/auth/login`               | POST   | Validates bcrypt hash and returns JWT token                             |
| `/api/upload-to-closet`         | POST   | Accepts multipart/form-data, removes background, tags with AI, saves to DB |
| `/api/upload-to-closet?userId=X`| GET    | Fetches all parsed closet items for a specific user                     |
| `/api/outfit-maker/generate`    | POST   | Takes query, scores wardrobe, triggers LLM, returns best outfit         |
| `/api/try-on`                   | POST   | Sends images to Virtual Try-On API and returns synthesized output       |
| `/api/smart-search`             | GET    | Performs semantic search using embeddings + cosine similarity           |




AI / Logic Engine
--------------------

### Multi-Stage Pipeline

#### 1\. Pre-Filter Phase

*   Extract intent (casual, formal, etc.)
    

#### 2\. Compatibility Scoring

*   Hardcoded color harmony system
*   Prevents bad combinations

#### 3\. Limiter Matrix

*   Caps combinations (5×5×4)
*   Prevents performance issues
    

#### 4\. Generative Layer

*   LLM selects best outfit
*   Adds human-like explanation
    




License
----------

This project is licensed under the **MIT License**.

Final Note
------------
Outfit AI is not just a wardrobe app — it is a **fusion of AI, system design, and real-world utility**, showcasing:

*   Advanced backend architecture
*   AI orchestration
*   Performance optimization
*   Real product thinking
    

