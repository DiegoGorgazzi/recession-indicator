//Function used to get the value (x and y) when the mouse pointer is in a different chart
//MUST be used in conjunction with {index} within the onNearestX method
export const otherChartCrosshairVal = (arrayInThisChart, arrayInOtherChart, indexInThisArray ) => {
    
    //I NEED TO ADD A COMPARISON... ?? IF ARRAYinotherchart.length > arrayInThis chart, then 
    return ({
    x: arrayInOtherChart[arrayInOtherChart.length-(arrayInThisChart.length-indexInThisArray)] !== undefined ? arrayInOtherChart[arrayInOtherChart.length-(arrayInThisChart.length-indexInThisArray)].x: null,
    y: arrayInOtherChart[arrayInOtherChart.length-(arrayInThisChart.length-indexInThisArray)] !== undefined ? arrayInOtherChart[arrayInOtherChart.length-(arrayInThisChart.length-indexInThisArray)].y: null
    })
}

//WAIT... I THINK THIS IS FINE, 
//I think THE ORDER IN RecessionIndicator.js is wrong