//********************************************************************
//Function to create x and y objects, which are friendly to d3 / react-vis
//NOTE that since we're using defaults, userStartDate and userEndDate are optional parameters
///WARNING xPropDateFromArray MUST be a date
export const xAndYobjects = (array, xPropDateFromArray, yPropFromArray, userStartDate = "1600-01-01", userEndDate = "2100-01-01" ) => {
    //Since the state is set initially to "", then it defaults as
    // "" instead of the default value provided, hence, two following
    // if statements below
      if(userStartDate == "") {
        userStartDate = "1600-01-01";
      };
      if(userEndDate == "") {
        userEndDate = "2100-01-01";
      };
  
      //turn string dates into Date objects
      let datedUserStartDates = new Date([userStartDate]);
      let datedUserEndDates = new Date([userEndDate]);
      let datedUserStartDate, datedUserEndDate;
  
      //check right order of dates inputed, and re-order if necessary
     if(datedUserStartDates > datedUserEndDates) {
         datedUserStartDate = datedUserEndDates;
         datedUserEndDate = datedUserStartDates;
     } else {
         datedUserStartDate = datedUserStartDates;
         datedUserEndDate = datedUserEndDates;
     }
  
  
      //Find index in main array where
      let startIndex = array.findIndex( (object) => object[xPropDateFromArray].getTime() == datedUserStartDate.getTime() );
      let endIndex = array.findIndex( (object) => object[xPropDateFromArray].getTime() == datedUserEndDate.getTime() );
  
      //If startIndex not in array, set it to the closest earlier date
        //available, else set it to the beginning of time
        //this ASSUMES the array starts with the oldest date
      if(startIndex == -1) {
        array.map( (object, index)=> {
          if (array[0][xPropDateFromArray].getTime() > datedUserStartDate.getTime()) {
                   startIndex = 0;
          } else if(object[xPropDateFromArray].getTime() > datedUserStartDate.getTime()
              && array[index-1][xPropDateFromArray].getTime() < datedUserStartDate.getTime()) {
                    startIndex = index-1;
          }
               return startIndex;
          });
       }
  
      //If endIndex not in array, set to end of time
      if(endIndex == -1) {
          array.map( (object, index)=> {
  
  
              if(object[xPropDateFromArray].getTime() > datedUserEndDate.getTime()
              && array[index-1][xPropDateFromArray].getTime() < datedUserEndDate.getTime()){
                  endIndex = index;
              }  else if
                  (array[array.length-1][xPropDateFromArray].getTime() < datedUserEndDate.getTime())  {
                  endIndex = array.length-1;
              }
  
  
              return endIndex;
              });
  
  
      }
  
      //slice originalArray according to indexes found.
      const dateRange = array.slice(startIndex, endIndex+1);
  
      //Assign d3 react-vis variable friendly x and y coordinates
              const xyMap = dateRange.map( (eachObject) => {
                   const x = eachObject[xPropDateFromArray];
                   const y = eachObject[yPropFromArray];
                   const newArray = {x, y};
                   return newArray;
              });
            //console.log(xyMap, "xAndYObjects");
            return xyMap;
  };