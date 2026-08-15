def get_recommended_action(category: str, volume: str, priority_score: float) -> str:
    """
    Rules engine that evaluates complaint attributes to generate recommended operational action.
    Rules evaluation order:
    1. priority_score >= 80 -> "Urgent Escalation - Dispatch immediately"
    2. category in hazardous_waste/e_waste/drain_blockage -> "Escalate to specialized hazardous waste team"
    3. volume == "very_large" -> "Dispatch mini truck + 2-3 workers"
    4. volume == "large" -> "Dispatch mini truck + 1-2 workers"
    5. category == "plastic_waste" -> "Route to recycling partner"
    6. else -> "Assign manual cleanup team"
    """
    if priority_score >= 80.0:
        return "Urgent Escalation - Dispatch immediately"

    if category in ["hazardous_waste", "e_waste", "drain_blockage"]:
        return "Escalate to specialized hazardous waste team"

    if volume == "very_large":
        return "Dispatch mini truck + 2-3 workers"

    if volume == "large":
        return "Dispatch mini truck + 1-2 workers"

    if category == "plastic_waste":
        return "Route to recycling partner"

    return "Assign manual cleanup team"
