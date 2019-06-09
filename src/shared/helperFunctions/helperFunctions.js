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


//******************************************************************
//helper function to merge two sets of data.
//We need to merge data because react-bootstrap-table requires each column
//to be part of the same data set. It will also be easier to
//graph data if they both have same starting date.
export const mergedResponse = (mainToBeMerged, additionalArr, name) => {
  //Since data sets have different starting dates, we need to
  //check to see which is the longest array to map through
      if(mainToBeMerged.length > additionalArr.length) {
        return mainToBeMerged.map((eachObject, index) => {
          const date = eachObject.date;
          const value = eachObject.value;
          const id = name + index;
          const valueAdd= additionalArr[index].value
          const mergedObject = {id, date, value, valueAdd};
          return mergedObject;
          }
        );
      } else {
          return additionalArr.map((eachObject, index) => {
            const date = additionalArr[index].date;
            let value;
            //the shorter data set needs to start index count only
            //when the dates of both data sets match.
            //So while the Index of the longer array is greater
            //than the length of the shorter array, the value will be zero.
              if(index < (additionalArr.length - mainToBeMerged.length) ) {
                value = 0;
              } else {
                value =
                //since we need to start at mainToBeMerged[0], we need to subtract
                //the difference in length in both arrays from the index count.
                mainToBeMerged[index-(additionalArr.length - mainToBeMerged.length)]
                .value;
              }
            const id = name + index;
            const valueAdd= eachObject.value;
            const mergedObject = {id, date, value, valueAdd};
            return mergedObject;
          }
        );
      }
    };

//************************************************************************
//Helper function to create a deep clone of an array with the signature:
  // [{...}, {...}, etc, etc]
  export const deepJSONArrayClone = (arrayToBeCloned) => {
      return arrayToBeCloned.map( (eachObject, index) => {
        eachObject = {...eachObject};
        return eachObject;
      })
   };


//************************************************************************
//Helper function to return a date "X" number of years in the past
//And one year in the future.
export const dateYearsAgoAndYearAhead = (howManyYearsInThePast) => {
  const todaysDate = new Date();
  const todaysDateYear = todaysDate.getFullYear();
  //Reminder: getMonth returns a number 0-11
  const todaysDateMonth = todaysDate.getMonth();
  const todaysDateDay = todaysDate.getDate();
  let newDateStartYear, newDateStartMonth, newDateStartDay,
    newStartDateStr, newStartDateObj, newStartDate, newEndDateObj,
    dateRangeObj, newDateEndYear, newDateEndDay, newEndDateStr,
    newDateEndMonth;

    newDateStartYear = todaysDateYear - howManyYearsInThePast;
    newDateStartMonth = todaysDateMonth + 1;
    newDateStartDay = todaysDateDay;
    newStartDateStr = `${newDateStartYear}-${newDateStartMonth}-${newDateStartDay}`;
    newStartDateObj = new Date(newStartDateStr);


    newDateEndYear = todaysDateYear + 1;
    newDateEndMonth = todaysDateMonth + 1;
    newDateEndDay = todaysDateDay;
    newEndDateStr = `${newDateEndYear}-${newDateEndMonth}-${newDateEndDay}`;
    newEndDateObj = new Date(newEndDateStr);

    dateRangeObj = [newStartDateObj, newEndDateObj];
    return dateRangeObj;

};
