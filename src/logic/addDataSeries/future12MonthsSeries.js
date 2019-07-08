import {deepJSONArrayClone} from "../../shared/helperFunctions/helperFunctions";

//FUNCTION to add futures dates (12-months, monthly) to a chart
//arrayToGetCurrentDate MUST include "date" key.
export const future12MonthsSeries = (arrayToGetCurrentDate) => {
  //I had to copy the array otherwise, when the user 
  //sets an end date that is smaller than the date available in the array
  //I get a "date undefined" error, which makes sense. 
  let clonedArray = deepJSONArrayClone(arrayToGetCurrentDate); 
  let future12Months = clonedArray.map( (eachObject, index) =>{
    let date = eachObject.date;
    let value = 0;
    let newObject = {date,value};
    return newObject;
  }); 

  //let future12Months = [...arrayToGetCurrentDate]
  if(arrayToGetCurrentDate.length > 0) {
    for (let i = 12; i > 0; --i) {
      let arrayToGetCurrentDateLast12Date = arrayToGetCurrentDate[arrayToGetCurrentDate.length-i].date
      const futureDateObject = {date: "", value: ""};
      futureDateObject.date = arrayToGetCurrentDateLast12Date;
      future12Months.push(futureDateObject);
    }
  };

  return future12Months;
};