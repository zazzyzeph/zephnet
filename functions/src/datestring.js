export function dateString() {
  // make a string appropriate for a filename or url, out of the current date/time down to the second
  // looks like 2025-06-26_04-20-42

  dateString =
    date.getFullYear() +
    "-" +
    (date.getMonth() + 1).toString().padStart(2, "0") +
    "-" +
    date.getDate().toString().padStart(2, "0") +
    "_" +
    date.getHours().toString().padStart(2, "0") +
    "-" +
    date.getMinutes().toString().padStart(2, "0") +
    "-" +
    date.getSeconds().toString().padStart(2, "0");

  return dateString;
}
