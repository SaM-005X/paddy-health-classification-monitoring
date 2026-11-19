"""
Agronomic guidance and advisory rules for paddy (Oryza sativa) crop health.
"""

RECOMMENDATIONS = {
    "Healthy": {
        "summary": "Paddy crop displays normal photosynthetic vigor, optimal turgor, and healthy vegetative growth.",
        "actions": [
            "Maintain standard shallow flooding (2-5 cm water level) appropriate for current growth stage.",
            "Continue scheduled NPK split-application (avoid excess nitrogen which predisposes crop to blast).",
            "Perform routine field perimeter scouting once every 7-10 days for early disease or insect detection.",
            "Ensure field bunds and drainage channels are weed-free and structurally sound."
        ]
    },
    "Water_Stressed": {
        "summary": "Visual or sensor indicators point to soil moisture deficit or high evaporative transpiration stress (leaf rolling / wilting).",
        "actions": [
            "Initiate immediate field irrigation or intermittent wetting to restore soil root-zone moisture above 40%.",
            "Inspect bunds and inlet sluices to prevent unauthorized drainage or seepage losses.",
            "Postpone urea / top-dressing nitrogen fertilization until normal leaf turgor and soil moisture are restored.",
            "For upland or rainfed paddy, apply light straw mulch along borders to reduce soil surface evaporation."
        ]
    },
    "Nutrient_deficient": {
        "summary": "Chlorosis or atypical leaf coloration suggests a macro-nutrient deficiency (Nitrogen, Phosphorus, or Potassium).",
        "actions": [
            "Nitrogen (N) Check: If older leaves show uniform pale yellowing from tip downward, apply a split top-dress of Urea (20-25 kg/ha) or Neem-coated urea.",
            "Potassium (K) Check: If leaf tips and margins exhibit dark brown scorch/drying with yellowing midribs, top-dress Muriate of Potash (MOP).",
            "Phosphorus (P) Check: If plants are dark bluish-green, stunted with purplish leaf sheaths, incorporate Single Super Phosphate (SSP) or DAP.",
            "Conduct a comprehensive soil laboratory test (EC, pH, organic carbon) before heavy chemical amendments."
        ]
    },
    "Diseased": {
        "summary": "Pathogen lesions, fungal spots, bacterial streaks, or pest damage detected on leaf tissue.",
        "actions": [
            "Isolate the affected field section and drain stagnant water if Bacterial Leaf Blight (BLB) is suspected to stop bacterial spread.",
            "For fungal leaf spots or Blast (spindle-shaped lesions): Consult local agricultural officer for approved fungicides (e.g., Tricyclazole 75 WP or Azoxystrobin).",
            "For insect damage (Hispa / Leaf folder): Clip and destroy heavily attacked leaf tips, use light traps, or apply neem-based formulations.",
            "Avoid excessive chemical spraying; follow Integrated Pest Management (IPM) economic threshold guidelines."
        ]
    },
    "Uncertain": {
        "summary": "The image confidence is below the minimum threshold or symptoms present borderline ambiguity between categories.",
        "actions": [
            "Capture a closer, clear photograph of the paddy leaf in diffuse daylight, avoiding extreme flash or sun glares.",
            "Focus on both upper and lower leaf surfaces, particularly the boundary between healthy and affected tissue.",
            "Correlate with in-field physical checks: touch soil to check moisture, inspect water standing depth, and examine for stem borers.",
            "If symptoms persist across the field plot, consult a certified local agricultural extension officer."
        ]
    }
}

DISCLAIMER_TEXT = (
    "Disclaimer: This AI-powered health classification is a preliminary threshold screening aid "
    "and should not replace official agronomic lab pathology or certified agricultural extension officer evaluations."
)

def get_recommendations_for(category: str, is_uncertain: bool = False):
    if is_uncertain:
        rec = RECOMMENDATIONS["Uncertain"]
    else:
        rec = RECOMMENDATIONS.get(category, RECOMMENDATIONS["Uncertain"])
    return {
        "summary": rec["summary"],
        "actions": rec["actions"],
        "disclaimer": DISCLAIMER_TEXT
    }
