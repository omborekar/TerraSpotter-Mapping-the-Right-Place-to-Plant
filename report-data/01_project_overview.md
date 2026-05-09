# 01 Project Overview

## Project Title
**TerraSpotter: Mapping the Right Place to Plant**

## Domain
**Geospatial AI & Precision Forestry Management.** This project integrates **Computational Geometry** (Spatial Grid Algorithms), **Predictive Analytics** (ML-driven species recommendation), and **Behavioral Gamification** to optimize community-driven reforestation.

## Problem Statement
The "Plantation Paradox" — despite high volumes of tree plantation drives, sapling mortality rates remain high due to a lack of **Environmental-Species Compatibility** and **Spatial Overcrowding**. Traditional methods fail to account for localized climate telemetry (rainfall, soil moisture) and precise land capacity, leading to unscientific and unsustainable greening efforts.

## Proposed Solution
TerraSpotter provides a data-centric ecosystem that transforms land mapping from simple visualization into an analytical engine. By combining **Ray-Casting Point-in-Polygon** algorithms for capacity estimation with a **Random Forest / Neural Network** ML pipeline for species suitability, the system ensures that every sapling has a statistically optimized chance of survival.

## Technical Objectives
1.  **Spatial Precision:** Implement a localized 3m x 3m grid projection over irregular user-mapped land polygons to prevent overcrowding.
2.  **Predictive Modeling:** Bridge real-time climate data (Open-Meteo) with historical species survival datasets via a Python-based REST microservice.
3.  **Verified Engagement:** Secure the plantation lifecycle using **Geo-tagged Photo Verification** (Cloudinary) and a **Leveling/Badge System** to ensure data integrity and long-term tracking.
4.  **Operational Efficiency:** Provide a multilingual, mobile-responsive interface to bridge the gap between urban volunteers and rural landholders.

## Unique Technical Features (The "How It Works")
-   **Grid-Based Capacity Estimation:** Instead of area-based estimation (Area / Space_per_tree), the system performs a geometric intersection check to find exactly how many 3x3m cells fit within the user's custom-drawn boundaries.
-   **Agentic AI Integration:** A **Gemini-powered Chatbot** acting as a "Forestry Consultant" that can execute backend tools to fetch land details and refresh ML recommendations autonomously.
-   **Multi-Cloud Architecture:** Leveraging **Cloudinary** for specialized image transformation and **Brevo** for automated transactional event triggers.

## Future Scope
-   **Computer Vision (CV) Verification:** Using top-down drone/satellite imagery to automatically verify plantation growth over months.
-   **Carbon Credit Tokenization:** Converting verified growth data into tradable or trackable carbon offset metrics.
-   **Offline-First Geospatial Mapping:** Implementing PWA features for land mapping in areas with zero network connectivity.
