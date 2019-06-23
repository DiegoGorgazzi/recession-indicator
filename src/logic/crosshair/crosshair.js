// ********************************************************************
//Function to turn the numerical values in crosshairDataRecDescrValue and
//crosshairDataNberValue into word equivalents to display in crosshair
export const crosshairDisplayWords = (crosshairAllDataObject) => {
    return crosshairAllDataObject.map( (eachObject, index) => { 
      //Change Display value of first object, crosshairDataRecDescrValue 
      if(index === 0) {
        switch (eachObject.y) {
          case 5:
            eachObject.y = "VERY HIGH"
            break;
          case 4:
            eachObject.y = "HIGH"
            break;
          case 3:
            eachObject.y = "MEDIUM"
            break;
          case 2:
            eachObject.y = "LOW"
            break;
          case 1:
            eachObject.y = "VERY LOW"
            break;
          default:
            eachObject.y = "NO DATA"
            break;
        }
      }
      //Change Display value of Second object, crosshairDataNberValue 
      if(index === 1) {
        switch (eachObject.y) {
          case 0:
           eachObject.y = "NO"
           break;
          case 5.1:
           eachObject.y = "YES"
           break;
          default:
           eachObject.y = "YES"
           break;
        }
       //IF it's a date in the future change to Unknown
        if(eachObject.x > new Date())
           eachObject.y = "UNKNOWN"
      }
  
      return eachObject;
    }); 
  
  } 
  
  