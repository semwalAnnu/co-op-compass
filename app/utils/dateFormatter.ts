export const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    // Use fixed formatting to ensure consistency between server and client
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};