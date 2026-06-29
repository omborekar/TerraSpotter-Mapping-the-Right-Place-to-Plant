# Technical Report: Open-Meteo API Integration

This document outlines the design and implementation details of the weather and climate telemetry integration in the **TerraSpotter** platform. This content is structured for inclusion in the Software Requirements Specification (SRS) and System Implementation chapters of the project report.

---

## 1. API Endpoints Used

The platform utilizes two endpoints from the **Open-Meteo** API suite. Open-Meteo is a free, developer-friendly weather API that offers high-resolution global telemetry without requiring API keys:

### 1.1 Weather Forecast API
- **Endpoint URL:** `https://api.open-meteo.com/v1/forecast`
- **Purpose:** Used to fetch current 7-day temperature forecasts and the 1-day hourly soil moisture projections.
- **Protocol:** HTTP GET

### 1.2 Historical Weather Archive API
- **Endpoint URL:** `https://archive-api.open-meteo.com/v1/archive`
- **Purpose:** Used to fetch historical daily precipitation records for the past 365 days to compute cumulative annual rainfall.
- **Protocol:** HTTP GET

---

## 2. API Request Configurations & Parameters

The centroid coordinates of the mapped land polygon (latitude and longitude) are sent as inputs to fetch localized parameters.

### 2.1 Temperature Forecast Request
```http
GET https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lng}&daily=temperature_2m_max,temperature_2m_min&forecast_days=7&timezone=auto
```
* **Parameters:**
  - `latitude` (Float): Centroid latitude of the land.
  - `longitude` (Float): Centroid longitude of the land.
  - `daily`: Mapped array of fields to return daily summaries:
    - `temperature_2m_max`: Maximum air temperature at 2 meters above ground level (°C).
    - `temperature_2m_min`: Minimum air temperature at 2 meters above ground level (°C).
  - `forecast_days` = 7: Fetch data for a 7-day forecast window.
  - `timezone` = auto: Resolves the local timezone dynamically based on location.

### 2.2 Soil Moisture Forecast Request
```http
GET https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lng}&hourly=soil_moisture_0_to_7cm&forecast_days=1&timezone=auto
```
* **Parameters:**
  - `hourly`: Mapped array of fields to return hourly summaries:
    - `soil_moisture_0_to_7cm`: Volumetric water mixing ratio in the topsoil (0 to 7 cm depth) expressed in cubic meters of water per cubic meter of soil ($m^3/m^3$).
  - `forecast_days` = 1: Restricts data retrieval to a single 24-hour horizon.

### 2.3 Annual Rainfall Archive Request
```http
GET https://archive-api.open-meteo.com/v1/archive?latitude={lat}&longitude={lng}&start_date={yyyy-MM-dd}&end_date={yyyy-MM-dd}&daily=precipitation_sum&timezone=auto
```
* **Parameters:**
  - `start_date`: Mapped to `LocalDate.now().minusDays(365)` (exactly 1 year ago).
  - `end_date`: Mapped to `LocalDate.now().minusDays(1)` (yesterday).
  - `daily`: Mapped array of fields to return daily summaries:
    - `precipitation_sum`: Total daily precipitation depth (rain + snow water equivalent) in millimeters (mm).

---

## 3. Data Processing & Calculation Logic

Raw JSON payloads returned by the weather APIs are parsed on the Spring Boot backend (`LandService.java`) using Jackson's `ObjectMapper`. The raw numbers are mapped to environmental dimensions as follows:

### 3.1 Mean Temperature Processing
The 7-day max and min arrays are aggregated to calculate a singular representative temperature:
$$\text{temp\_mean} = \frac{1}{N} \sum_{i=1}^{N} \frac{\text{temperature\_2m\_max}[i] + \text{temperature\_2m\_min}[i]}{2}$$
- **Default Fallback:** `28.0°C` (if API request fails).

### 3.2 Annual Rainfall Processing
The backend computes the sum of the precipitation values over the 365 daily archive records:
$$\text{annual\_rainfall} = \sum_{i=1}^{365} \text{precipitation\_sum}[i]$$
- **Default Fallback:** `1000.0 mm` (if API request fails).

### 3.3 Soil Classification Logic
Soil moisture values represent volumetric soil water content ($m^3/m^3$). The 24 hourly forecast values are averaged, and the resulting index determines the soil classification:
$$\text{avg\_moisture} = \frac{1}{24} \sum_{i=1}^{24} \text{soil\_moisture\_0\_to\_7cm}[i]$$

The classification mapping thresholds are defined as:
* $\text{avg\_moisture} < 0.15 \implies \textbf{"sandy"}$ (Dry, coarse-textured soils)
* $0.15 \le \text{avg\_moisture} < 0.30 \implies \textbf{"loamy"}$ (Medium-textured, moisture-retentive soils)
* $\text{avg\_moisture} \ge 0.30 \implies \textbf{"clay"}$ (Heavy-textured, high-density soils)
- **Default Fallback:** `loamy` (if API request fails).

*Note: If the user provides explicit text describing soil types (e.g., "Sandy loam", "Black clay") in the land notes or description fields, the backend uses regular expression keyword searches to override the moisture API estimation.*

### 3.4 Climate Zone Classification
Using the computed mean temperature and annual rainfall, the backend classifies the land plot into one of four climate zones:
* $\text{annual\_rainfall} < 400\text{ mm} \implies \textbf{"arid"}$
* $400\text{ mm} \le \text{annual\_rainfall} < 800\text{ mm} \implies \textbf{"semi-arid"}$
* $\text{annual\_rainfall} \ge 800\text{ mm} \land \text{temp\_mean} < 18.0^\circ\text{C} \implies \textbf{"temperate"}$
* $\text{annual\_rainfall} \ge 800\text{ mm} \land \text{temp\_mean} \ge 18.0^\circ\text{C} \implies \textbf{"tropical"}$

---

## 4. End-to-End Telemetry Data Flow

The sequential flow below details how telemetry maps coordinates into inference predictions:

1. **User Action:** The user creates a new land parcel on the frontend Map Interface (drawing a custom polygon).
2. **PostgreSQL Registration:** The Spring Boot backend registers the polygon, calculates its geometric centroid (`lat` and `lng`), and triggers the recommendation service.
3. **Open-Meteo Querying:** The backend initiates parallel HTTP client requests to Open-Meteo APIs for Forecast (temperatures and hourly soil moisture) and Archive (precipitation history).
4. **Data Aggregation:** The backend computes `temp_mean`, `annual_rainfall`, `soil` type, and `climate_zone` using the calculation logic.
5. **ML Service Handshake:** The backend forwards the refined telemetry parameters to the Python Flask microservice:
   `GET /predict?temp=26.4&rainfall=1104&soil=clay&climate=tropical`
6. **Random Forest Classification:** The Random Forest Classifier processes the categorical and continuous variables, computes probability vectors, and maps the top 5 compatible species.
7. **PostgreSQL Persistence:** The Spring Boot backend stores the results in the `land_recommendations` table, which are then queried by the frontend to render the recommendation panel on the user interface.

---

## 5. Examples of API Response Payloads

Below are example JSON payloads showing the structure returned by the Open-Meteo APIs:

### 5.1 Weather Forecast API Response (`/v1/forecast`)
```json
{
  "latitude": 18.41,
  "longitude": 76.56,
  "generationtime_ms": 0.23,
  "utc_offset_seconds": 19800,
  "timezone": "Asia/Kolkata",
  "timezone_abbreviation": "IST",
  "elevation": 638.0,
  "daily_units": {
    "time": "iso8601",
    "temperature_2m_max": "°C",
    "temperature_2m_min": "°C"
  },
  "daily": {
    "time": [
      "2026-06-21",
      "2026-06-22",
      "2026-06-23",
      "2026-06-24",
      "2026-06-25",
      "2026-06-26",
      "2026-06-27"
    ],
    "temperature_2m_max": [31.5, 30.2, 29.8, 30.5, 32.1, 33.0, 31.8],
    "temperature_2m_min": [23.1, 22.5, 22.0, 22.8, 24.0, 24.2, 23.5]
  }
}
```

### 5.2 Archive API Response (`/v1/archive`)
```json
{
  "latitude": 18.41,
  "longitude": 76.56,
  "generationtime_ms": 0.85,
  "utc_offset_seconds": 19800,
  "timezone": "Asia/Kolkata",
  "timezone_abbreviation": "IST",
  "elevation": 638.0,
  "daily_units": {
    "time": "iso8601",
    "precipitation_sum": "mm"
  },
  "daily": {
    "time": [
      "2025-06-21",
      "2025-06-22",
      ...
      "2026-06-20"
    ],
    "precipitation_sum": [0.0, 12.5, 4.2, 0.0, 0.0, 22.1, 0.0, 1.8]
  }
}
```

---

## 6. How Weather Data Affects Tree Recommendations

The continuous input parameters determine classification outputs. Below is a lookup matrix detailing how the ML pipeline responds to various telemetry conditions:

| Temp Average (°C) | Rainfall Average (mm) | Soil Classification | Climate Zone | Key Recommended Species | Primary Ecological Suitability Reason |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **High** ($>28.0$) | **Low** ($<400$) | Sandy | Arid | **Acacia**, **Neem** | Drought resistance, minimal watering requirements, coarse sand compatibility. |
| **High** ($>28.0$) | **High** ($>1200$) | Clay | Tropical | **Coconut**, **Mango**, **Mahogany**, **Teak** | High water absorption, humid tropical requirements, heavy nutrient-rich soil needs. |
| **Low** ($<18.0$) | **Medium** ($600-1000$) | Loamy | Temperate | **Oak**, **Maple**, **Birch**, **Willow** | Low-temperature tolerance, medium soil drainage preference, balanced seasonal rainfall. |
| **Moderate** ($18.0-28.0$) | **Medium** ($800-1200$) | Loamy | Tropical / Temperate | **Banyan**, **Peepal**, **Arjun**, **Jamun** | Deep root propagation, alluvial/loamy soil tolerance, medium precipitation requirements. |
| **High** ($>25.0$) | **Medium** ($600-1000$) | Sandy / Loamy | Semi-Arid | **Gulmohar**, **Bamboo** | Low soil retention requirement, rapid propagation, tolerance to seasonal droughts. |
