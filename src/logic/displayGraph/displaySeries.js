//Function returns the data or null depending on 
//whether the user input date is within the data date range
export const displaySeries = (dateToCompareArr, dataToDisplayArr, keyInDateToDisplayArr) => {
    if(dataToDisplayArr.length > 0 ) {
        if(dateToCompareArr === "") {
            return dataToDisplayArr
        } else if(new Date(dateToCompareArr).getTime() > dataToDisplayArr[0][keyInDateToDisplayArr].getTime() ) {
            return dataToDisplayArr
        } else {
            return null
        }
    } 
};

