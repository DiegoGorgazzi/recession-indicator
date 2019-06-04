import React, { Component } from "react";
import recessionIndicatorStyles from "./RecessionIndicator.module.css";
import axios from "axios";

//*********************** components **********************************
import Table from '../../components/Table/Table';
import {calcs} from "../../logic/logic";

//************************ d3js *************************************
import * as d3 from "d3-time-format";

//************************* react-vis *******************************
import {XYPlot, LineSeries, VerticalGridLines, HorizontalGridLines,
  XAxis, YAxis, VerticalBarSeries } from 'react-vis';
import 'react-vis/dist/style.css';

//******************** BootstrapTable **********************************
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';

//*********************** helperFunctions ******************************
import {filteredResponse} from "../../shared/helperFunctions/helperFunctions";

//************************ data ****************************************
import {tenYearYield} from "../../data/fedReserveAPI";
import {threeMonthYield} from "../../data/fedReserveAPI";
import {nberUSrecess} from "../../data/fedReserveAPI";
import {willshire5000} from "../../data/fedReserveAPI";
import {vix} from "../../data/fedReserveAPI";

class RecessionIndicator extends Component {

  state = {
    tenYearInt: [],
    threeMonthInt: [],
    nberRecession: [],
    wilshireState: [],
    vixState:[],
    tenThreeMerged:[]
  }

  componentDidMount () {
    axios.all([
      axios.get(tenYearYield),
      axios.get(threeMonthYield),
      axios.get(nberUSrecess),
      axios.get(wilshire5000),
      axios.get(vix)
      ])
        .then(axios.spread(
          (tenYrYldResponse,
            threeMthYldResponse,
            nberResponse, wilshireResponse, vixResponse ) => {

            this.setState({
            tenYearInt:
              filteredResponse(tenYrYldResponse.data.observations, "10-yr-yields"),
            threeMonthInt:
              filteredResponse(threeMthYldResponse.data.observations, "3-month-yields"),
            nberRecession:
              filteredResponse(nberResponse.data.observations, "US-recession"),
            wilshireState:
              filteredResponse(wilshireResponse.data.observations, "Whilshire-5000"),
            vixState:
              filteredResponse(vixResponse.data.observations, "Vix")
            });

          console.log(this.state.tenYearInt, "ten");
          console.log(this.state.threeMonthInt, "three");
          console.log(this.state.nberRecession, "nber");
          //console.log(this.state.wilshireState, "wilshire");
          //console.log(this.state.vixState, "vix");
          }
        ));

      }

      componentDidUpdate(previousProps, previousState, snapshot) {
        if(previousState.tenThreeMerged.length === 0 || previousState.tenThreeMerged.length === 1 ) {
          this.setState({
            tenThreeMerged: calcs(this.state.tenYearInt, this.state.threeMonthInt, this.state.nberRecession, "mergedTenThree" )
          });
        }

      }

  render() {
    const rawData = [
      {a: "1934-01", y: 8},
      {a: "1934-02", y: 5},
      {a: "1934-03", y: 4},
      {a: "1934-04", y: 9},
      {a: "1934-05", y: 1},
      {a: "1934-06", y: 7},
      {a: "1934-07", y: 6},
      {a: "1934-08", y: 3},
      {a: "1934-09", y: 2},
      {a: "1934-10", y: 0},
      {a: "1934-11", y: 0},
      {a: "1934-12", y: 2},
      {a: "1935-01", y: 8},
      {a: "1935-02", y: 5},
      {a: "1935-03", y: 4},
      {a: "1935-04", y: 9},
      {a: "1935-05", y: 1},
      {a: "1935-06", y: 7},
      {a: "1935-07", y: 6},
      {a: "1935-08", y: 3},
      {a: "1935-09", y: 2},
      {a: "1935-10", y: 0},
      {a: "1935-11", y: 0},
      {a: "1935-12", y: 2},
      {a: "1936-01", y: 8},
      {a: "1936-02", y: 5},
    ];


    let formatIMonth = d3.timeFormat("%Y-%b");
    let makeDate = d3.timeParse("%Y-%m")
    const data1 = rawData.map( (eachObject)=> {
      //eachObject.a = new Date(eachObject.a);
      eachObject.a = makeDate(eachObject.a);
      eachObject.c = formatIMonth(eachObject.a);
      //console.log(eachObject, "eachObject");
      return eachObject;
    });



    console.log(data1, "data1");

    const data2 = [
      {x: 0, y: -10},
      {x: 1, y: -5},
      {x: 2, y: -7},
      {x: 3, y: -11},
      {x: 4, y: -3},
      {x: 5, y: -4},
      {x: 6, y: -5},
      {x: 7, y: -6},
      {x: 8, y: -2},
      {x: 9, y: -1}
    ];

    console.log(this.state.tenThreeMerged, "render")
    return (
    <div>
      <p>Hello </p>

      <div>
        <XYPlot height={350} width={600} getX= {d => d.a}
          margin={{bottom:60}}
          xType="time"
          colorType="linear"
          colorDomain={[0, 1]}
          colorRange={["white", "black"]}>
          <VerticalGridLines />
          <HorizontalGridLines />
          {/*<XAxis tickFormat={d3.timeFormat("%Y-%b")} tickLabelAngle={-45} />*/}
          <XAxis tickLabelAngle={-45} tickPadding={5}/>
          <YAxis />
          {/*<VerticalBarSeries data={data2} color="#ff9999" stroke="#f70"/>*/}
          <LineSeries data={data1} color={0.75}/>
       </XYPlot>
     </div>
     <div>
        <Table data={this.state.tenThreeMerged}/>
    </div>
    </div>
    )

  }

}

export default RecessionIndicator;
