export const capitalizeFirstLetter = (text: string) => {
  return text.charAt(0).toUpperCase() + text.slice(1);
};

export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

export const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    // fulfillmentStatus
    case "delivered":    return "#10B981"; // green
    case "shipped":      return "#3B82F6"; // blue
    case "processing":   return "#8B5CF6"; // purple
    case "unfulfilled":
    case "pending":      return "#F59E0B"; // amber
    case "cancelled":    return "#EF4444"; // red
    // paymentStatus
    case "paid":         return "#10B981"; // green
    case "failed":       return "#EF4444"; // red
    case "refunded":     return "#64748B"; // slate
    default:             return "#64748B";
  }
};

/**
 * Optimizes a Cloudinary image URL by injecting transformation parameters.
 * Automatically requests WebP format (f_auto), optimal quality (q_auto), 
 * and a specific width to drastically reduce payload size on mobile.
 */
export const optimizeCloudinaryUrl = (url: string | undefined | null, width: number = 500): string => {
  if (!url) return '';
  
  // If it's not a Cloudinary URL, return it as is
  if (!url.includes('res.cloudinary.com')) return url;

  // If it already has transformations (like /upload/w_200/...), return as is
  // A standard URL looks like: https://res.cloudinary.com/cloud_name/image/upload/v12345/folder/image.jpg
  if (url.includes('/upload/')) {
    const parts = url.split('/upload/');
    if (parts.length === 2 && !parts[1].startsWith('v')) {
      // It might already have transformations applied
      return url; 
    }
    // Inject transformations immediately after /upload/
    const transformations = `c_scale,w_${width},q_auto,f_auto`;
    return `${parts[0]}/upload/${transformations}/${parts[1]}`;
  }

  return url;
};
