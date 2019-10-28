# Recession Indicator

## What it does

The app will calculate and display the likelihood of a US Economic recession 12 months into the future.  
Here's what it looks like so far (using working credentials) [Recession Predictor](https://hlia-recession.web.app/).

UNFORTUNATELY, DUE TO SOME OF THE PROBLEMS MENTIONED BELOW, I'M CONTINUING THIS WORK IN A SEPARATE REPOSITORY
TO ALLOW ME TO MAKE THIS A FULL-STACK APP WHICH WILL REMOVE THE "BUSINESS LOGIC" FROM THE FRONT-END BUT ALSO WILL REQUIRE AUTHENTICATION/VALIDATION AND A DATABASE ALL OF WHICH I PREFER TO KEEP SEPARATE. STILL, I COPIED/PASTED THE CODE I'VE BEEN WORKING ON THAT PRIVATE REPOSITOTY HERE WITHOUT THE CREDENTIALS NEEDED FOR AUTHENTICATION. 

## Background

### Research

Various financial and economic models exist that attempt to predict US recessions, some better than others. I'll stick to the Treasury's term spread (aka yield curve), which has been well researched and explained in a paper by the New York Fed.

### Side Note

This is part of a much bigger app I have in mind but I'm going to solve this problem in small pieces and this app, Recession Indicator, is part of the puzzle.

## Motivation

Financial markets are highly sensitive to economic data and an economic recession always plays a major role in the performance of these markets.

Prior knowledge of such a major event could help market participants prepare accordingly.

In spite of relative astonishing accuracy, many investors (both retail and professional) seem to either not know about this model or chose to ignore it.

In my view, the problem is not marketing (as many news outlets religiously report on this metric) but instead presentation of data and ease of access.

## Game Plan

- Economic data is taken using the Federal Reserve's API.
- The probability is calculated using the same formula used by the New York Fed. However, it is then modified by a factor of safety.
- Instead of giving the mathematical result of the modified probability, I'm going to split the results into ranges and assign more user-friendly labels.

### Limitations

- Unfortunately, for mobile devices the crosshair functionality has been disabled. The code uses
  conditional rendering to achieve this. The crosshair component is a D3.js component available by the
  react-vis. See the "Discoveries / Lessons Learned" section for a discussion about this subject.

### Discoveries / Lessons Learned

- The biggest thing I found out is that inline functions seem to perform way better than handlers
  in the constructor. I know what you're thinking, you've "heard" the opposite. Me too. That's probably
  one of the first things everyone learns about React. However, I wrote two identical branches of code,
  except one had inline functions (or functions within the render method) while the other branch had
  handler methods. Inline functions performed substantially better than the handlers.
    
    Dazed (and confused), I googled this more carefully and it appears that nobody has actually done measuring of performance comparing one vs the other; it's all been mostly hearsay. I also discovered I'm not the only one who saw the light.

- JavaScript doesn't like "complex" math. I'm not a statistician and even as an Engineer, I have a nominal understanding of statistics in general. In Microsoft Excel, simple functions are available to calculate any statistical function you can imagine. My appreciation for Microsoft Excel has been magnified after trying to apply seemingly easy equations in JS. Luckily, I found a very small, and little known, library here on GitHub that approximates the normal standard distribution curve with respectable accuracy. It was a life saver.

- React-vis is certainly better that using vanilla D3js. I think for really simple charts, where maybe the x-axis is static, then it works great. In this app, I ran into two issues for what would otherwise be considered a relatively simple graph (made me miss the simplicity of Excel).

    First, the label in the y-axis property is set up to be located as a percentage of the width of the chart. This is OK if you have a non-responsive site. But for responsive sites (and mobile devices) this creates a big problem because the location of the label will change and will either be on top of the chart itself (so no good) or be completely out of view (so no good also). I had to add an event listener and another method to determine what percentage to input based on width of the window. This of course means every time the window is resized there're all these extra functions running plus additional re-rendering (so, no _bueno_ either).

    Second, and this is a major problem, is that adding crosshair functionality re-renders all of the components of the graph each and every single time the mouse moves within the graph. Within a second of moving your mouse randomly across the graph, you can easily have 100 re-renders of the XYPlot, the Vertical and Horizontal gridlines, the XAxis, and even the measly AxisTicks. All of these components should _Not_ be re-rendered as their state has not changed. This is actually an old issue from August 2017 (https://github.com/uber/react-vis/issues/570). In a laptop, this issue is essentially unnoticeable (there's a tiny lag between the pointer location and the location of the cross hair) but in a mobile device, this makes the app practically unusable.

    All that being said, React-vis was in general flexible enough to customize it. For example, and this wasn't an issue, but it required a good amount of coding, to figure out how to place several data series within the same graph. This required creating a scaling function to allow multiple data series with different scales to display properly within the same graph. In excel, this is easily done by providing a secondary y-axis (did I mention I miss excel?).

## Installation, Available Scripts, and other React related stuff

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).
