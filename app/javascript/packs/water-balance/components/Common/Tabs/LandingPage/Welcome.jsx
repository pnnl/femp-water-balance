import React from 'react';
import helpIcon from 'images/help.png';
import addButtonIcon from 'images/add-button.png';
import Link from '@material-ui/core/Link';
import { linkStyle } from '../shared/sharedStyles';

const imgStyle = {
  verticalAlign: 'middle',
};

export function Welcome() {
  return (
    <div>
      The Federal Energy Management Program developed this Water Balance Tool to provide a method for estimating potable water consumption across
      multiple water end-use categories at a campus. A water balance compares the total water supply to the volume of water consumed by water-using
      equipment and applications. The output of the tool provides the estimated potable water consumption by major end-uses and compares the sum of
      the end-uses to the total potable water supplied to the campus. The final water balance provided by the tool will help users identify the
      highest consuming end-uses, which will help prioritize water-saving opportunities.
    </div>
  );
}

export function EndUses() {
  return (
    <div>
      This tool focuses on potable water consumption for major water-consuming equipment at the campus level. The following end-uses are covered in the tool:
      <ul>
        <li>Plumbing (restroom, locker rooms and/or kitchenettes)</li>
        <li>Commercial kitchen</li>
        <li>Cooling towers</li>
        <li>Steam boilers</li>
        <li>Laundry (washing machines)</li>
        <li>Vehicle wash</li>
        <li>Landscape irrigation</li>
        <li>Other processes</li>
      </ul>
    </div>
  );
}

export function Results() {
  return (
    <div>
      The water balance results will be provided in the last tab of the tool. The results will include:
      <br />
      <ul>
        <li>A table with the estimated water use by end-use</li>
        <li>A bar chart showing the total volume of water used annually by end-use</li>
        <li>A pie chart showing the percent breakout by end-use</li>
      </ul>
      This tab also will provide information that will help the user understand the water balance results. In addition, a Water Balance Tool Help
      document can be accessed by clicking on the button
      <img src={helpIcon} style={{width: '36px', verticalAlign: 'middle'}} />
      on the right side of the screen.
    </div>
  );
}

export function DataCollection() {
  return (
    <div>
      Before calculating a water balance, the user will need to conduct a walk-through survey of the campus to collect data about major
      water-consuming equipment. FEMP developed the&nbsp;
      <Link style={linkStyle} href='https://www.energy.gov/eere/femp/downloads/water-evaluation-data-tool'>Water Evaluation Data Tool</Link>
      &nbsp;to provide a method and general instructions for collecting comprehensive water data during a walk-through survey. The&nbsp;
      <Link style={linkStyle} href='https://www.energy.gov/sites/prod/files/2018/11/f57/handbook-walk-through-water-survey.pdf'>
        Handbook: Performing a Comprehensive Walk-through Water Survey
      </Link>
      &nbsp;provides descriptions of data that need to be collected, photographs of typical water-consuming equipment, and methods for collecting
      data.
    </div>
  );
}

export function ToolInstructions() {
  return (
    <div>
       To create or add a new campus, click the button &nbsp;
        <img src={addButtonIcon} style={imgStyle} /> on the upper right side of the landing page. First, general information must be entered. This
        information includes the campus name, location, date of the walk-through survey, and the calendar year of the water-supply data. This general
        information must be entered before any other data can be added. When the general information is successfully entered and saved, the campus
        name will appear on the left-hand side of the screen. Click on the campus name to continue entering data.
    </div>
  );
}

export function GeneralCampusInformation() {
  return (
    <div>
       Once the general campus information has been entered and saved, the water-supply module and the water end-use modules can be found on the blue
        bar at the top of the screen. Data can be entered in any order. See the Help document for additional information about each module and data
        inputs.
    </div>
  );
}
