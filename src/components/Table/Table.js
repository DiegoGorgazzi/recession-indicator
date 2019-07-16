import React from "react";

import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import ToolkitProvider, { ColumnToggle } from 'react-bootstrap-table2-toolkit';


const { ToggleList } = ColumnToggle;
const columns = [{
  dataField: 'dateTbl',
  text: 'Date, yr-mm',
  sort: true
}, {
  dataField: 'value',
  text: '10-yr avg yield, %'
},
{
  dataField: 'valueAdd',
  text: '3-month avg yield, %'
},
{
  dataField: 'spread',
  text: 'Yield Spread, 10-yr & 3-mo (Bond Equiv.)',
  hidden: true
},
{
  dataField: 'recProbAdj',
  text: 'Recession probability (Adjusted)',
  hidden: false,
  sort: true
},
{
  dataField: 'recDescription',
  text: 'Recession likelihood',
  hidden: false,
},
{
  dataField: 'nberDescr',
  text: 'Actual Recession (NBER)',
  hidden: false,
}

];

const defaultSorted = [{
dataField: 'dateTbl',
order: 'desc'
}];

const customTotal = (from, to, size) => (
  <span className="react-bootstrap-table-pagination-total">
    Showing { from } to { to } of { size } Results
  </span>
);

const options = {
paginationSize: 6,
pageStartIndex: 1,
// alwaysShowAllBtns: true, // Always show next and previous button
// withFirstAndLast: false, // Hide the going to First and Last page button
// hideSizePerPage: true, // Hide the sizePerPage dropdown always
// hidePageListOnlyOnePage: true, // Hide the pagination list when only one page
firstPageText: 'First',
prePageText: 'Back',
nextPageText: 'Next',
lastPageText: 'Last',
nextPageTitle: 'First page',
prePageTitle: 'Pre page',
firstPageTitle: 'Next page',
lastPageTitle: 'Last page',
showTotal: true,
paginationTotalRenderer: customTotal,
sizePerPageList: [{
  text: '18 moths', value: 18
  }, {
  text: '3 years', value: 36
  }, {
  text: '6 years', value: 72
  }, {
  text: '10 years', value: 120
}] // A numeric array is also available. the purpose of above example is custom the text
};




const table = (props) => (
<div className={props.tableContainerClass}>
    <ToolkitProvider
      keyField="id"
      data={ props.data }
      columns={ columns }
      columnToggle
    >
      {
        props => (
          <div>
            <ToggleList { ...props.columnToggleProps } />
            <hr />
            <BootstrapTable
              { ...props.baseProps }
              defaultSorted= { defaultSorted }
              pagination={ paginationFactory(options) }
            />
          </div>
        )
      }
    </ToolkitProvider>
  </div>
);

export default table;
