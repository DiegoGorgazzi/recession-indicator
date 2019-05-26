//helper function to filter only Date and Value from nested objects in arrays
//with the format [{}, {}, etc, etc]
export const filteredResponse = (toBeFiltered, name) => {
  return toBeFiltered.map((eachObject, index) => {
      const date = eachObject.date;
      const value = eachObject.value;
      const id = name + index;
      const filteredObject = {id, date, value};
      return filteredObject;
  });
}
