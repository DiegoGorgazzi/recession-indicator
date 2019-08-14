import React, { Component, Fragment } from "react";

//************************* react-vis *******************************
import {LineSeries, VerticalGridLines, HorizontalGridLines,
  XAxis, YAxis, AreaSeries, DiscreteColorLegend, 
 ChartLabel, Crosshair, FlexibleXYPlot } from 'react-vis';
import 'react-vis/dist/style.css';

class WilshirePastPerf extends Component {
 
    shouldComponentUpdate(nextProps, nextState) {
        //console.log("[WilshireFuturePerf.js] shouldComponentUpdate");
        if (this.props.areaSeriesData !== undefined) {
            if (nextProps.areaSeriesData.length !== this.props.areaSeriesData.length) {
                //TRUE = Update
                return true
            } else if (this.props.crosshairVal.length > 0 ) {
                //TRUE = Update
                return true
            } else {
                //False = do NOT update
                return false
            }
        } else {
            //TRUE = Update
            return true;
        }
    } 

  render() {
    //console.log("[WilshirePastPerf.js] Rendering...");

    return (
      <Fragment>
        <FlexibleXYPlot
          margin={{ bottom: 50, left: 70 }}
          className={this.props.FlexiClassName}
          xType="time"
          colorType="linear"
          onMouseMove={this.props.onMouseMove}
          onMouseLeave={this.props.onMouseLeave}
        >
          <VerticalGridLines />
          <HorizontalGridLines />
          <XAxis tickLabelAngle={-45} tickPadding={5} />
          <YAxis tickLabelAngle={-45} tickPadding={5} />
          <ChartLabel
            text="Percentage"
            className={this.props.className}
            includeMargin={false}
            xPercent={this.props.xPercent}
            yPercent={0.65}
            style={{
              transform: "rotate(-90)",
              fontWeight: "bold"
            }}
          />
          <AreaSeries data={this.props.areaSeriesData} color="#ff9999" />
          <LineSeries
            data={this.props.lineSeriesData24}
            color="#00ff00"
            onNearestX={this.props.onNearestX24}
          />
          <LineSeries
            data={this.props.lineSeriesData18}
            color="#009900"
            onNearestX={this.props.onNearestX18}
          />
          <LineSeries
            data={this.props.lineSeriesData12}
            color="#003300"
            onNearestX={this.props.onNearestX12}
          />
          <DiscreteColorLegend
            style={{ display: "flex", flexWrap: "wrap", maxHeight: 100 }}
            items={[
              {
                title: 'Recession >= "High" Likelihood (12 months Ahead)',
                color: "#ff9999"
              },
              {
                title: "Wilshire 12-month Performance",
                color: "#003300"
              },
              {
                title: "Wilshire 18-month Performance",
                color: "#009900"
              },
              {
                title: "Wilshire 24-month Performance",
                color: "#00ff00"
              }
            ]}
            orientation="horizontal"
          />
          <Crosshair
            values={this.props.crosshairVal}
            titleFormat={this.props.crosshairTitleFormat}
            itemsFormat={this.props.crosshairItemsFormat}
          />
        </FlexibleXYPlot>
      </Fragment>
    );
  }
}

export default WilshirePastPerf;
