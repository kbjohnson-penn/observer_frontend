export const capitalizeWords = (input: string): string => {
  return input.replace(/\b\w/g, (char) => char.toUpperCase());
};

export const checkBoolean = (input: boolean): string => {
  return input ? "Yes" : "No";
};

export const formatDepartmentName = (name: string): string => {
  let formattedName = name.replace(/-/g, " ");
  formattedName = formattedName.replace(/\b\w/g, (l) => l.toUpperCase());
  return formattedName;
};

export const formatVisitDate = (date: string): string => {
    const [year, month, day] = date.split("-");
    const formattedDate = `${month}/${day}/${year}`;
    return formattedDate;
};
