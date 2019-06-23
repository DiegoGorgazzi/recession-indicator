// Function to check date as user inputs it for better User Experience
// Tries to catch the most common mistakes 
// so, to catch all, regex is tested at the end
export const checkDateInput = (eventTargetValue, setDateStatePropError) => {
    let testDate = eventTargetValue;
    //RegEx a little forgiving for better user exp... accepts M/D/YYYY and MM/DD/YYYY
    let testRegex = /^(((0?[1-9]|1[012])\/(0?[1-9]|1\d|2[0-8])|(0?[13456789]|1[012])\/(29|30)|(0?[13578]|1[02])\/31)\/((19|18)|[2-9]\d)\d{2}|0?2\/29\/(((19|18)|[2-9]\d)(0[48]|[2468][048]|[13579][26])|(([2468][048]|[3579][26])00)))$/;
  
    const allowedCharacters = ["/", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
    const numbersOnly = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
    let state;
  
    if(testDate.length >= 1 && 
      !numbersOnly.includes(testDate[0])) {
      state = {[setDateStatePropError]: "Error! Please provide a month between 01 and 12"}
    } else {
        state = {[setDateStatePropError]: ""}
    };
      
    if (testDate === "") {
      state =  {[setDateStatePropError]: ""}
    }
  
    //****check user MONTH input **
    if(testDate.length >= 3) {
        //check if 2 or 1 digit Month number
        if(numbersOnly.includes(testDate[0]) && numbersOnly.includes(testDate[1])) {
          //THEN IT IS A TWO DIGIT NUMBER.
          //Check if first Month digit is correct
          if(!["0", "1"].includes(testDate[0])){
            state = { [setDateStatePropError]: "Error! Please provide a month between 01 and 12"}
          } 
          //If Second digit is incorrect, then error too.
          else if(testDate[0] === "1" && !["0", "1", "2"].includes(testDate[1])) {
            state = {[setDateStatePropError]: "Error! Please provide a month between 01 and 12"}  
          } 
          //if either first or second digit have anything other than allowed characters, then error
          else if(!numbersOnly.includes(testDate[0]) || !allowedCharacters.includes(testDate[1])) {
            state = {[setDateStatePropError]: "Error! Please provide a valid month"}  
          }
          //if no "/" then needs a Slash
          else if(testDate[2] !== "/") {
            state = {[setDateStatePropError]: "Error! Please provide a '/' after the month"}
          }
        } 
        //ELSE IT IS A ONE DIGIT MONTH NUMBER
        else if(!allowedCharacters.includes(testDate[0]) || !allowedCharacters.includes(testDate[1])) {
          state = {[setDateStatePropError]: "Error! Please provide a valid month"}
        }
        //Check a "/" is used in the right spot
          else if(testDate[1] !== "/") {
            state = {[setDateStatePropError]: "Error! Please provide a '/' after the month"}
          }
        };
  
    //*** Check user DAY input **
    //Check if we have a 2 digit Month
    if(numbersOnly.includes(testDate[0]) && numbersOnly.includes(testDate[1])) {
      //Then it is a 2 digit month.
      //check user input for days
      if(testDate.length >= 6)  {
        //Now check if 2 or 1 digit Day number
        if(numbersOnly.includes(testDate[3]) && numbersOnly.includes(testDate[4])) {
          //THEN IT IS A TWO DIGIT DAY
          //Check if first Month digit is correct
          if(!["0", "1", "2", "3"].includes(testDate[3])){
            state = {[setDateStatePropError]: "Error! Please provide a valid day"}  
          } 
          //If Second digit is incorrect, then error too.
          else if(!numbersOnly.includes(testDate[4])) {
            state = {[setDateStatePropError]: "Error! Please provide a valid day"}
          } 
          //No more than 31 days (RegEx will catch actual mistakes at the end)
          else if(["3"].includes(testDate[3]) && !["0", "1"].includes(testDate[4])) {
            state = {[setDateStatePropError]: "Error! Please provide a valid day"} 
          } 
          else if(!allowedCharacters.includes(testDate[3]) || !allowedCharacters.includes(testDate[4])) {
            state = {[setDateStatePropError]: "Error! Please provide a valid Day"}
          }
          //if no "/" then needs a Slash
          else if(testDate[5] !== "/") {
            state = {[setDateStatePropError]: "Error! Please provide a '/' after the day"}
          }
        } 
        //ELSE IT IS A ONE DIGIT DAY NUMBER
        else if(!allowedCharacters.includes(testDate[3]) || !allowedCharacters.includes(testDate[4])) {
          state = {[setDateStatePropError]: "Error! Please provide a valid Day"}
        }
        //Check a "/" is used in the right spot
          else if(testDate[4] !== "/") {
            state = {[setDateStatePropError]: "Error! Please provide a '/' after the day"}
          }
        } 
        else if(testDate.length < 6 && testDate.length > 4) {
          state = { [setDateStatePropError]: ""}  
        }; 
      } 
      ///** ELSE YOU'RE ON A ONE DIGIT MONTH
      else if(testDate.length >= 6)  {
        //Now check if 2 or 1 digit Day number
        if(numbersOnly.includes(testDate[2]) && numbersOnly.includes(testDate[3])) {
          //THEN IT IS A TWO DIGIT DAY
          //Check if first Month digit is correct
          if(!["0", "1", "2", "3"].includes(testDate[2])){
            state = {[setDateStatePropError]: "Error! Please provide a valid day"} 
          } 
          //If Second digit is incorrect, then error too.
          else if(!numbersOnly.includes(testDate[3])) {
            state = {[setDateStatePropError]: "Error! Please provide a valid day"}
          } 
          //No more than 31 days 
          else if(["3"].includes(testDate[2]) && !["0", "1"].includes(testDate[3])) {
            state = { [setDateStatePropError]: "Error! Please provide a valid day"}
          } 
          else if(!allowedCharacters.includes(testDate[2]) || !allowedCharacters.includes(testDate[3])) {
            state = {[setDateStatePropError]: "Error! Please provide a valid Day"}
          }
          //if no "/" then needs a Slash
          else if(testDate[4] !== "/") {
            state = {[setDateStatePropError]: "Error! Please provide a '/' after the day"}
          }
        } 
        //ELSE IT IS A ONE DIGIT DAY NUMBER
        else if(!allowedCharacters.includes(testDate[2]) || !allowedCharacters.includes(testDate[3])) {
          state = {[setDateStatePropError]: "Error! Please provide a valid Day"}
        }
        //Check a "/" is used in the right spot
          else if(testDate[3] !== "/") {
            state = {[setDateStatePropError]: "Error! Please provide a '/' after the day"}
          }
        }; 
  
  
    //FINALLY, Check the whole date using RegEx
    //Check format M/D/YYYY
    if(testDate.length >= 8){
      if(testDate.length === 8 && !testRegex.test(testDate)) {
        //console.log(testDate.length, "===8")
        state = {[setDateStatePropError]: "Please enter a valid date"}   
      } 
      //check format MM/D/YYYY and M/DD/YYYY
      else if(testDate.length === 9 && !testRegex.test(testDate)) {
        //console.log(testDate.length, "===9")
        state = {[setDateStatePropError]: "Please enter a valid date"}
      } 
      //check format MM/DD/YYYY
      else if(testDate.length === 10 && !testRegex.test(testDate)) {
        //console.log(testDate.length, "===10")
        state = {[setDateStatePropError]: "Please enter a valid date"}
      } 
      //If format MM/DD/YYYY OK then reset state
      else if(testDate.length === 10 && testRegex.test(testDate)) {
        //console.log(testDate.length, "===10 GOOD")
        state = {[setDateStatePropError]: ""}
      } 
      //if too many characters, then error
      else if(testDate.length > 10 ) {
        //console.log(testDate.length, "TOO MANY NUMS")
        state = {[setDateStatePropError]: "Please enter a valid date"}
      } 
      //if format MM/D/YYYY and M/DD/YYYY OK then reset state
      else if(testDate.length === 9 && testRegex.test(testDate)) {
          //console.log(testDate.length, "===9 GOOD")
          state = {[setDateStatePropError]: ""}
      } 
      //if format M/D/YYYY OK then reset state
      else if(testDate.length === 8 && testRegex.test(testDate)) {
          //console.log(testDate.length, "===8 GOOD")
          state = {[setDateStatePropError]: ""}
      } 
      //if user deletes his wrong format, reset state
      else if (testDate.length <9) {
          state = {[setDateStatePropError]: ""}
      }
    };         
  
    return state;
    
  };
  
  
  
  