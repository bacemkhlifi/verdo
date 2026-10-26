export function financeAvailability({ loading, result, stale, crops }) {
  if (loading) return "financeLoading";
  if (!result) return "financeRunAnalysis";
  if (stale) return "stale";
  if (
    crops.some((crop) => ["conditional", "recommended"].includes(crop.status))
  )
    return "ready";
  if (
    !crops.length ||
    crops.some((crop) => crop.status === "insufficient_data")
  )
    return "financeMissingEvidence";
  return "financeNoSuitable";
}

export function validFinanceCrop(crops, current) {
  const eligible = crops.filter((crop) =>
    ["conditional", "recommended"].includes(crop.status),
  );
  return eligible.some((crop) => crop.cropKey === current)
    ? current
    : eligible[0]?.cropKey || "";
}
