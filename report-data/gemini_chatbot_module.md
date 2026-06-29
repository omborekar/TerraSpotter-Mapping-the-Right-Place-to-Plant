# Chapter 6.1 AI Chatbot Module

## 6.1.1 Overview of Chatbot Module
The **TerraSpotter AI Assistant** is designed as a conversational agentic system that connects users directly to the platform's features. Powered by Google's **Gemini 2.5 Flash** model, the chatbot offers guidance on tree care and matches species to sites. By integrating with backend APIs through function calling, it can retrieve user lands, query recommendations, and trigger suitability refreshes.

---

## 6.1.2 Gemini Model & Configuration Details
- **Model Version:** `gemini-2.5-flash`
- **Generative Endpoint:** `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`
- **Timeout Threshold:** 10 seconds (`Duration.ofSeconds(10)`)
- **HTTP Client:** Built-in Java 11 `HttpClient` using connection pooling and asynchronous execution.
- **Payload Format:** JSON structure mapped using Jackson's `ObjectMapper`.

---

## 6.1.3 Prompt Engineering Strategy & System Prompt
The system instructions are passed to the Gemini API during every request to maintain the assistant's persona and logic bounds.

### System Prompt
```text
You are TerraSpotter AI assistant. Help users with plantation decisions. Use tools when data is needed (e.g. to get user lands, or recommendations). Do not guess user data. Always prefer API results over assumptions. Be conversational and encouraging, add emojis where appropriate.
```

### Prompt Engineering Best Practices Implemented
- **Persona Alignment:** Enforces a conversational, supportive, and agricultural persona.
- **Constraint Boundaries:** Restricts guessing or halluncinating user data by directing the model to utilize database tools.
- **Instruction Priority:** Instructs the model to rely on real tool return values over preset assumptions.

---

## 6.1.4 Available Tools & Backend API Integrations
The chatbot uses **Gemini Function Calling (Tools)** to interact with the database. The table below lists the exposed tool definitions and their backend hooks:

| Tool Name | Tool Description | Required Arguments | Mapped Backend Operation |
| :--- | :--- | :--- | :--- |
| **`getUserLands`** | Fetches all lands registered under the logged-in user. | *None* | `landService.getLandsByUser(userId)` |
| ****`getRecommendations`**** | Retrieves plant recommendation records for a specific land ID. | `landId` (String) | `recommendationRepository.findByLandId(landId)` |
| ****`refreshRecommendations`**** | Triggers a fresh ML inference evaluation for a land. | `landId` (String) | `landService.refreshRecommendations(landId)` |

---

## 6.1.5 Chatbot Capabilities

### 1. Forestry Recommendation Analysis
- **Capability:** Answers questions on tree growth, watering cycles, spacing, and species compatibility.
- **Example:** Explain details on Acacia, Neem, Bamboo, Banyan, etc., and why they suit sandy or clay soils.

### 2. Land Analysis
- **Capability:** Evaluates the user's lands, highlighting their area, status (e.g. Vacant), and soil profile.
- **Example:** Summarizes coordinates and estimated tree capacity for user-drawn polygons.

### 3. Recommendation Refresh
- **Capability:** Triggers recalculations. If a user requests a refresh, the chatbot makes a tool call which calls Open-Meteo for fresh climate records, runs the Random Forest ML script, and updates PostgreSQL.

---

## 6.1.6 Context and Conversation State Handling
- **Stateful Session Binding:** The React frontend maintains the active thread. The session cookie keeps track of the user ID on the Spring Boot backend.
- **Dynamic Frontend Cards:** When the tool execution returns list arrays (like `getUserLands`), the backend structures them into a DTO:
  ```java
  public record ChatResponse(String text, List<LandTile> associatedLands) {}
  ```
  This returns both the text reply and a structured array. The frontend parses this array and renders interactive, clickable cards next to the message bubble, allowing users to jump directly to the target land page.

---

## 6.1.7 Security Restrictions & Sandbox Enforcement
- **Session Authentication:** The endpoint `POST /api/chat` rejects unauthenticated requests with a `401 Unauthorized` status.
- **Access Verification Sandbox:** To prevent parameter tampering (e.g., querying another user's land details), the tool execution checks land ownership before retrieving data:
  ```java
  if (landService.getLandsByUser(userId).stream().noneMatch(l -> l.getId().equals(landId))) {
      return "Error: Land not found or access denied.";
  }
  ```
  If access is denied, the tool returns an error message to the LLM, which explains to the user that they do not have access.

---

## 6.1.8 Example User Conversations

### Scenario 1: User requests land info
- **User:** *"Hello, show me my registered land plots."*
- **Gemini Tool Call:** `getUserLands()`
- **Backend Response:**
  ```json
  [ { "id": 4, "title": "East Farm Plot", "areaSqm": 1250, "landStatus": "Vacant" } ]
  ```
- **Chatbot Text Reply:** *"Here is your registered land plot: **East Farm Plot** (ID: 4) 🌳. It is currently vacant and ready for planting!"*
- **Frontend Action:** Renders a clickable UI card for "East Farm Plot" linking to `/lands/4`.

### Scenario 2: User requests suitability details
- **User:** *"What trees should I plant on my plot with ID 4?"*
- **Gemini Tool Call:** `getRecommendations(landId=4)`
- **Backend Response:**
  ```json
  [ { "plantName": "Mango", "suitabilityScore": 0.94, "reason": "Thrives in loamy soil | Requires moderate watering" } ]
  ```
- **Chatbot Text Reply:** *"For **East Farm Plot** (ID: 4), the best option is: **Mango** (94% suitability) 🥭 because it thrives in loamy soil and moderate watering conditions. Let me know if you would like me to refresh these recommendations!"*

---

## 6.1.9 Chatbot Module Architecture

```text
  [ User Frontend React Client ]
              │
              ▼ (POST /api/chat)
  [ Spring Boot ChatController ]
              │
              ▼ (processChat)
  [ Spring Boot ChatService ] ◄──────────┐
              │                          │
              ▼ (Initial Call)           │ (Tool Execution Output)
   [ Google Gemini LLM API ]             │
              │                          │
              ▼ (Detects functionCall)   │
      [ Tool Selector ] ─────────────────┘
              │
              ├─► getUserLands() ──────────────► [ LandService ]
              ├─► getRecommendations() ────────► [ RecommendationRepo ]
              └─► refreshRecommendations() ────► [ LandService ]
```
