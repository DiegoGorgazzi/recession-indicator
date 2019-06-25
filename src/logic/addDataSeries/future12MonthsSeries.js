//FUNCTION to add futures dates (12-months, monthly) to a chart
export const future12MonthsSeries = (arrayToGetCurrentDate) => {
  let future12Months = []
  if(arrayToGetCurrentDate.length > 0) {
    for (let i = 20; i > 0; --i) {
      let arrayToGetCurrentDateLast12Date = arrayToGetCurrentDate[arrayToGetCurrentDate.length-i].date
      const futureDateObject = {date: "", value: ""};
      futureDateObject.date = arrayToGetCurrentDateLast12Date;
      future12Months.push(futureDateObject);
    }
  };
  return future12Months;
};