# Recession Indicator

## What it does
The app will calculate and display the likelihood of a US Economic recession 12-months into the future.  

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
* Economic data is taken using the Federal Reserve's API.
* The probability is calculated using the same formula used by the New York Fed. However, it is then modified by a factor of safety.
* Instead of giving the mathematical result of the modified probability, I'm going to split the results into ranges and assign more user-friendly labels.

### Limitations
* I don't know yet. We'll see what kind of data we get from the Fed's API and how customizable the Data-visualization libraries are.

## Installation, Available Scripts, and other React related stuff
This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).
