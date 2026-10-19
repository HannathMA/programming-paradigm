"""
Road Network definition with realistic nodes and coordinates for Metro CyberCity.
"""

NODES = {
    "central_station": {
        "id": "central_station",
        "name": "Central Transit Station",
        "category": "transit",
        "lat": 37.7749,
        "lng": -122.4194,
        "description": "City hub connecting high-speed rail and bus lines."
    },
    "financial_dist": {
        "id": "financial_dist",
        "name": "Financial District",
        "category": "commercial",
        "lat": 37.7890,
        "lng": -122.4014,
        "description": "High-density banking and corporate towers."
    },
    "tech_park": {
        "id": "tech_park",
        "name": "Silicon Tech Park",
        "category": "business",
        "lat": 37.7650,
        "lng": -122.4080,
        "description": "Software enterprises, incubators and data labs."
    },
    "harbor_bay": {
        "id": "harbor_bay",
        "name": "Harbor Bay Pier",
        "category": "logistics",
        "lat": 37.7955,
        "lng": -122.3937,
        "description": "Container terminals, maritime ferry and waterfront."
    },
    "airport_terminal": {
        "id": "airport_terminal",
        "name": "Metro Airport Terminal",
        "category": "transit",
        "lat": 37.7420,
        "lng": -122.4450,
        "description": "International air passenger and cargo terminals."
    },
    "university_campus": {
        "id": "university_campus",
        "name": "Civic University",
        "category": "education",
        "lat": 37.7580,
        "lng": -122.4350,
        "description": "Research faculties, campus grounds, student housing."
    },
    "arts_quarter": {
        "id": "arts_quarter",
        "name": "Arts & Cultural Quarter",
        "category": "culture",
        "lat": 37.7800,
        "lng": -122.4350,
        "description": "Museums, performing arts halls, and dining plazas."
    },
    "suburb_north": {
        "id": "suburb_north",
        "name": "North Heights",
        "category": "residential",
        "lat": 37.8050,
        "lng": -122.4220,
        "description": "Hillside residential neighborhoods and scenic parks."
    },
    "west_market": {
        "id": "west_market",
        "name": "Westside Market Plaza",
        "category": "retail",
        "lat": 37.7680,
        "lng": -122.4600,
        "description": "Shopping centers, craft markets, and transport depot."
    },
    "medical_center": {
        "id": "medical_center",
        "name": "Metropolitan Medical Center",
        "category": "health",
        "lat": 37.7600,
        "lng": -122.4500,
        "description": "Emergency trauma hospital and bioscience labs."
    }
}

# Base road graph definitions
# Multiplier weights:
# low: 1.0, medium: 1.6, heavy: 2.8, critical: 4.8
SEVERITY_MULTIPLIERS = {
    "low": 1.0,
    "medium": 1.6,
    "heavy": 2.8,
    "critical": 4.8
}

DEFAULT_ROADS = [
    {
        "id": "road_cs_fd",
        "name": "Grand Financial Boulevard",
        "u": "central_station",
        "v": "financial_dist",
        "distance_km": 2.8,
        "base_speed_kmh": 50,
        "severity": "medium",
        "coordinates": [
            [37.7749, -122.4194],
            [37.7820, -122.4100],
            [37.7890, -122.4014]
        ]
    },
    {
        "id": "road_fd_hb",
        "name": "Harbor Coastal Way",
        "u": "financial_dist",
        "v": "harbor_bay",
        "distance_km": 1.4,
        "base_speed_kmh": 40,
        "severity": "low",
        "coordinates": [
            [37.7890, -122.4014],
            [37.7920, -122.3970],
            [37.7955, -122.3937]
        ]
    },
    {
        "id": "road_cs_tp",
        "name": "Innovation Parkway",
        "u": "central_station",
        "v": "tech_park",
        "distance_km": 2.2,
        "base_speed_kmh": 60,
        "severity": "low",
        "coordinates": [
            [37.7749, -122.4194],
            [37.7700, -122.4130],
            [37.7650, -122.4080]
        ]
    },
    {
        "id": "road_tp_hb",
        "name": "Eastern Bayside Bypass",
        "u": "tech_park",
        "v": "harbor_bay",
        "distance_km": 4.1,
        "base_speed_kmh": 65,
        "severity": "medium",
        "coordinates": [
            [37.7650, -122.4080],
            [37.7800, -122.3980],
            [37.7955, -122.3937]
        ]
    },
    {
        "id": "road_cs_aq",
        "name": "Civic Avenue",
        "u": "central_station",
        "v": "arts_quarter",
        "distance_km": 1.7,
        "base_speed_kmh": 45,
        "severity": "low",
        "coordinates": [
            [37.7749, -122.4194],
            [37.7780, -122.4270],
            [37.7800, -122.4350]
        ]
    },
    {
        "id": "road_aq_sn",
        "name": "Northcrest Highway",
        "u": "arts_quarter",
        "v": "suburb_north",
        "distance_km": 3.6,
        "base_speed_kmh": 55,
        "severity": "low",
        "coordinates": [
            [37.7800, -122.4350],
            [37.7930, -122.4280],
            [37.8050, -122.4220]
        ]
    },
    {
        "id": "road_sn_fd",
        "name": "Bayview Overpass",
        "u": "suburb_north",
        "v": "financial_dist",
        "distance_km": 3.2,
        "base_speed_kmh": 50,
        "severity": "heavy",
        "coordinates": [
            [37.8050, -122.4220],
            [37.7970, -122.4110],
            [37.7890, -122.4014]
        ]
    },
    {
        "id": "road_cs_uc",
        "name": "University Link Expressway",
        "u": "central_station",
        "v": "university_campus",
        "distance_km": 2.5,
        "base_speed_kmh": 50,
        "severity": "medium",
        "coordinates": [
            [37.7749, -122.4194],
            [37.7660, -122.4270],
            [37.7580, -122.4350]
        ]
    },
    {
        "id": "road_aq_uc",
        "name": "Heritage Corridor",
        "u": "arts_quarter",
        "v": "university_campus",
        "distance_km": 2.6,
        "base_speed_kmh": 40,
        "severity": "low",
        "coordinates": [
            [37.7800, -122.4350],
            [37.7690, -122.4340],
            [37.7580, -122.4350]
        ]
    },
    {
        "id": "road_uc_mc",
        "name": "Hospital Ring Road",
        "u": "university_campus",
        "v": "medical_center",
        "distance_km": 1.5,
        "base_speed_kmh": 40,
        "severity": "low",
        "coordinates": [
            [37.7580, -122.4350],
            [37.7590, -122.4430],
            [37.7600, -122.4500]
        ]
    },
    {
        "id": "road_aq_wm",
        "name": "Westgate Boulevard",
        "u": "arts_quarter",
        "v": "west_market",
        "distance_km": 3.1,
        "base_speed_kmh": 45,
        "severity": "medium",
        "coordinates": [
            [37.7800, -122.4350],
            [37.7740, -122.4480],
            [37.7680, -122.4600]
        ]
    },
    {
        "id": "road_wm_mc",
        "name": "Southwest Connector",
        "u": "west_market",
        "v": "medical_center",
        "distance_km": 1.6,
        "base_speed_kmh": 45,
        "severity": "low",
        "coordinates": [
            [37.7680, -122.4600],
            [37.7640, -122.4550],
            [37.7600, -122.4500]
        ]
    },
    {
        "id": "road_mc_at",
        "name": "Airport Southern Freeway",
        "u": "medical_center",
        "v": "airport_terminal",
        "distance_km": 2.3,
        "base_speed_kmh": 65,
        "severity": "low",
        "coordinates": [
            [37.7600, -122.4500],
            [37.7510, -122.4480],
            [37.7420, -122.4450]
        ]
    },
    {
        "id": "road_tp_at",
        "name": "Metropolitan Airport Expressway",
        "u": "tech_park",
        "v": "airport_terminal",
        "distance_km": 4.5,
        "base_speed_kmh": 70,
        "severity": "heavy",
        "coordinates": [
            [37.7650, -122.4080],
            [37.7530, -122.4260],
            [37.7420, -122.4450]
        ]
    },
    {
        "id": "road_uc_at",
        "name": "Campus South Radial",
        "u": "university_campus",
        "v": "airport_terminal",
        "distance_km": 2.7,
        "base_speed_kmh": 50,
        "severity": "low",
        "coordinates": [
            [37.7580, -122.4350],
            [37.7500, -122.4390],
            [37.7420, -122.4450]
        ]
    }
]

# Preset scenarios
PRESET_SCENARIOS = {
    "normal": {
        "id": "normal",
        "name": "Off-Peak Free Flow",
        "description": "Standard midday conditions with smooth traffic across most city arteries.",
        "severities": {
            "road_cs_fd": "low",
            "road_fd_hb": "low",
            "road_cs_tp": "low",
            "road_tp_hb": "low",
            "road_cs_aq": "low",
            "road_aq_sn": "low",
            "road_sn_fd": "low",
            "road_cs_uc": "low",
            "road_aq_uc": "low",
            "road_uc_mc": "low",
            "road_aq_wm": "low",
            "road_wm_mc": "low",
            "road_mc_at": "low",
            "road_tp_at": "low",
            "road_uc_at": "low"
        }
    },
    "morning_rush": {
        "id": "morning_rush",
        "name": "Morning Peak Rush Hour",
        "description": "Heavy inbound congestion toward Financial District and Silicon Tech Park.",
        "severities": {
            "road_cs_fd": "critical",
            "road_sn_fd": "critical",
            "road_cs_tp": "heavy",
            "road_tp_at": "heavy",
            "road_cs_aq": "medium",
            "road_cs_uc": "medium",
            "road_tp_hb": "heavy"
        }
    },
    "accident_expressway": {
        "id": "accident_expressway",
        "name": "Accident on Airport Expressway",
        "description": "Major collision blocking Airport Expressway. Traffic diverted to Southern Freeway.",
        "severities": {
            "road_tp_at": "critical",
            "road_cs_tp": "heavy",
            "road_mc_at": "low",
            "road_uc_at": "medium"
        }
    },
    "downtown_storm": {
        "id": "downtown_storm",
        "name": "Severe Rainstorm & Flooding",
        "description": "Flash rain slowing down coastal and low-lying downtown avenues.",
        "severities": {
            "road_fd_hb": "critical",
            "road_tp_hb": "heavy",
            "road_cs_fd": "heavy",
            "road_aq_wm": "medium",
            "road_sn_fd": "heavy"
        }
    },
    "festival_weekend": {
        "id": "festival_weekend",
        "name": "Arts & Music Festival",
        "description": "Civic Avenue and Arts Quarter streets closed for pedestrian celebration.",
        "severities": {
            "road_cs_aq": "critical",
            "road_aq_sn": "critical",
            "road_aq_uc": "critical",
            "road_aq_wm": "heavy",
            "road_cs_tp": "low"
        }
    }
}
