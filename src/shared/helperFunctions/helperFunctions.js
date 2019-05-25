//helper function to filter only Date and Value from nested objects in arrays
//with the format [{}, {}, etc, etc]
export const filteredResponse = (toBeFiltered) => {
  return toBeFiltered.map((eachObject) => {
      const date = eachObject.date;
      const value = eachObject.value;
      const filteredObject = {date, value};
      return filteredObject;
  });
}
