//*********************** helperFunctions ******************************
import {dateYearsAgoAndYearAhead} from "../../shared/helperFunctions/helperFunctions";

//Function to let the user toggle date ranges
//use index = 0 for dateRangeStart
//use index = 1 for dateRangeEnd
export const setStartEndDate = (dateRangeId, index) => {

    switch (dateRangeId) {
      case "2yrRange":
        return dateYearsAgoAndYearAhead(2)[index];
      case "5yrRange":
        return dateYearsAgoAndYearAhead(5)[index];
      case "10yrRange":
         return dateYearsAgoAndYearAhead(10)[index];
      case "20yrRange":
        return dateYearsAgoAndYearAhead(20)[index];
      case "30yrRange":
         return dateYearsAgoAndYearAhead(30)[index];
      case "50yrRange":
         return dateYearsAgoAndYearAhead(50)[index];
      case "allyrRange":
         return dateYearsAgoAndYearAhead(300)[index];
      }

};