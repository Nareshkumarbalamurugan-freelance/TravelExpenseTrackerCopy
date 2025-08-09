# Chennai Areas - Coordinate Reference Guide

This document provides accurate coordinate mapping for major Chennai areas used in the mock location services.

## Coordinate System
- **Latitude**: North-South position (higher = more north)
- **Longitude**: East-West position (higher = more east)
- **Format**: Decimal degrees (e.g., 13.0435, 80.2349)

## Area Mappings

### North Chennai
| Area | Latitude Range | Longitude Range | Pin Code | Description |
|------|----------------|-----------------|----------|-------------|
| Purasavakkam | 13.10 - 13.12 | 80.21 - 80.23 | 600084 | North Chennai residential |
| Anna Nagar | 13.08 - 13.09 | 80.20 - 80.22 | 600040 | Planned residential area |
| Aminjikarai | 13.07 - 13.08 | 80.21 - 80.23 | 600029 | Central-North location |

### Central Chennai
| Area | Latitude Range | Longitude Range | Pin Code | Description |
|------|----------------|-----------------|----------|-------------|
| T Nagar | 13.04 - 13.05 | 80.23 - 80.25 | 600017 | Commercial hub |
| Nungambakkam | 13.05 - 13.07 | 80.24 - 80.26 | 600034 | Business district |
| Egmore | 13.07 - 13.08 | 80.25 - 80.27 | 600008 | Railway station area |
| Mylapore | 13.03 - 13.04 | 80.26 - 80.28 | 600004 | Cultural center |

### South Chennai
| Area | Latitude Range | Longitude Range | Pin Code | Description |
|------|----------------|-----------------|----------|-------------|
| Adyar | 13.00 - 13.02 | 80.25 - 80.27 | 600020 | Upscale residential |
| Velachery | 12.97 - 12.99 | 80.21 - 80.23 | 600042 | IT corridor start |
| **Chrompet** | **12.95 - 12.97** | **80.13 - 80.16** | **600044** | **Residential suburb** |
| Tambaram | 12.92 - 12.94 | 80.09 - 80.12 | 600045 | Railway junction |
| Pallavaram | 12.95 - 12.97 | 80.14 - 80.17 | 600043 | Near airport |

### West Chennai
| Area | Latitude Range | Longitude Range | Pin Code | Description |
|------|----------------|-----------------|----------|-------------|
| Porur | 13.03 - 13.05 | 80.15 - 80.18 | 600116 | IT hub |
| Vadapalani | 13.05 - 13.07 | 80.20 - 80.22 | 600026 | Commercial area |

### East Chennai (OMR Corridor)
| Area | Latitude Range | Longitude Range | Pin Code | Description |
|------|----------------|-----------------|----------|-------------|
| Perungudi | 12.96 - 12.98 | 80.24 - 80.26 | 600096 | IT corridor |
| Thoraipakkam | 12.94 - 12.96 | 80.23 - 80.25 | 600097 | OMR tech hub |
| Sholinganallur | 12.90 - 12.92 | 80.22 - 80.24 | 600119 | IT SEZ area |

## Test Coordinates

### Chrompet Area Testing
```typescript
// Chrompet coordinates (should return Chrompet area)
const chrompetCoords = { lat: 12.9595, lng: 80.1495 };
// Expected: "Mock Location, [Street], Chrompet, Chennai, Tamil Nadu 600044, India"

// Near Chrompet but outside range
const nearChrompet = { lat: 12.9650, lng: 80.1520 };
// Expected: Still Chrompet (closest area)
```

### Other Key Test Coordinates
```typescript
// T Nagar (commercial center)
const tNagar = { lat: 13.0435, lng: 80.2349 };

// Anna Nagar (planned city)
const annaNagar = { lat: 13.0850, lng: 80.2101 };

// Velachery (IT corridor)
const velachery = { lat: 12.9759, lng: 80.2206 };

// Adyar (upscale area)
const adyar = { lat: 13.0067, lng: 80.2572 };
```

## Mock Data Accuracy

The enhanced mock data system:

1. **Exact Match**: If coordinates fall within an area's defined range, that area is selected
2. **Proximity Match**: If no exact match, the closest area by distance is selected
3. **Realistic Addresses**: Includes appropriate pin codes and street types
4. **Search Intelligence**: Place search results prioritize areas mentioned in the query

## Common Issues Resolved

### Before Enhancement
- **Issue**: All coordinates mapped to Anna Nagar regardless of actual location
- **Cause**: Simple modulo operation `(latitude - 12.9) * 10) % areas.length`
- **Result**: Incorrect location identification

### After Enhancement
- **Solution**: Proper coordinate range checking with fallback to closest area
- **Accuracy**: Coordinates correctly map to their actual Chennai areas
- **Validation**: Chrompet coordinates (12.9595, 80.1495) now correctly return Chrompet

## Usage in Development

The mock location services now provide:
- **Geographic accuracy** for testing location-based features
- **Realistic addresses** with correct pin codes
- **Area-aware search** that understands Chennai geography
- **Consistent mapping** for reliable testing

This ensures that your GPS tracking, trip management, and location services behave realistically during development and testing.
