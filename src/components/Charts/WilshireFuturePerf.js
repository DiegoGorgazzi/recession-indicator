import React, { Component, PureComponent, Fragment } from "react";

//************************* react-vis *******************************
import {LineSeries, VerticalGridLines, HorizontalGridLines,
  XAxis, YAxis, AreaSeries, DiscreteColorLegend, 
 ChartLabel, Crosshair, FlexibleXYPlot } from 'react-vis';
import 'react-vis/dist/style.css';
import { getScalePropTypesByAttribute } from "react-vis/dist/utils/scales-utils";

class WilshireFuturePerf extends Component {
 
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
    //console.log("[WilshireFuturePerf.js] Rendering...");

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
            color="#6666ff"
            onNearestX={this.props.onNearestX24}
          />
          <LineSeries
            data={this.props.lineSeriesData18}
            color="#0000e6"
            onNearestX={this.props.onNearestX18}
          />
          <LineSeries
            data={this.props.lineSeriesData12}
            color="#000066"
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
                title: "Wilshire 12-month FUTURE Performance",
                color: "#000066"
              },
              {
                title: "Wilshire 18-month FUTURE Performance",
                color: "#0000e6"
              },
              {
                title: "Wilshire 24-month FUTURE Performance",
                color: "#6666ff"
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

export default WilshireFuturePerf;
