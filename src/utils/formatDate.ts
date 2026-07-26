export const formatDate = (dates: Date | string | (Date | string)[]) => {
  const values = Array.isArray(dates) ? dates : [dates];
  return values.map((date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();

    return `${day}/${month}/${year}`;
  });
};
