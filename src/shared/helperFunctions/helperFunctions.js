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


/******************************************************************/
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

/************************************************************************/
