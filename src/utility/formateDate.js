export function formatDate(dateString) {
  if (!dateString) return dateString;

  const date = new Date(dateString);

  // Check if the date is invalid
  if (isNaN(date.getTime())) return dateString;

  // Define options for date and time formatting
  const options = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  };

  // Use Intl.DateTimeFormat to format the date
  const formatter = new Intl.DateTimeFormat("en-US", options);

  // Format the date and return the human-readable string
  return formatter.format(date);
}
