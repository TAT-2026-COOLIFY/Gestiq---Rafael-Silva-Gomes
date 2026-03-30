export const formatDate = (dateString) => {
  if (!dateString) return "A definir";

  const [year, month, day] = dateString.split("-");

  return `${day}/${month}/${year}`;
};
