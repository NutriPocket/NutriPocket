  
  
export const castDateToString = (date: Date | string) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

export const castStringToDate = (date: string) => {
    const [year, month, day] = date.split('-');
    return new Date(`${year}-${month}-${day}`);
  };