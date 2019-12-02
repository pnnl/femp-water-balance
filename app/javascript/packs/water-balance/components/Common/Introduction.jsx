import Typography from '@material-ui/core/Typography';
import React, { Fragment } from 'react';
import addButtonIcon from 'images/add-button.png';

const imgStyle = {
    verticalAlign: 'middle',
};

class Introduction extends React.Component {
    render() {
        return (
            <Fragment>
                <Typography variant="body2" gutterBottom>
                    The Federal Energy Management Program developed this Water
                    Balance Tool to provide a method to estimate potable water
                    consumption for a campus across multiple water end-use
                    categories. A water balance compares the total water supply
                    to the volume of water consumed by water-using equipment and
                    applications. The output of the tool provides the estimated
                    potable water consumption by major end-use and compares the
                    sum of the end-uses to the total potable water supplied to
                    the campus. The final water balance developed with the tool
                    will help users identify the highest consuming end-uses,
                    which will help prioritize water saving opportunities.
                    <br />
                    <br />
                    This tool focuses on potable water consumption for major
                    water consuming equipment at the campus level. Listed below
                    are the end-uses that are covered in the tool:
                    <br />
                    <br />
                    <ul>
                        <li>
                            Plumbing (restroom, locker rooms and/or
                            kitchenettes)
                        </li>
                        <li>Commercial kitchen</li>
                        <li>Cooling towers</li>
                        <li>Steam boilers</li>
                        <li>Laundry (washing machines)</li>
                        <li>Vehicle wash</li>
                        <li>Landscape Irrigation</li>
                        <li>Other processes</li>
                    </ul>
                    <br />
                    The water balance results will be provided in the last tab
                    of the tool. A table with the estimated water use by end-use
                    will be presented along with a bar chart that shows the
                    total volume of water used annually by end-use and pie chart
                    showing the percent breakout by end-use. This tab will also
                    provide information on understanding the water balance
                    developed from your inputs. The Water Balance Tool Help
                    document is also available by clicking on the button (?) on
                    the right side of the screen. Before beginning a water
                    balance, data will need to be collected on the major water
                    consuming equipment across the campus during a walk-through
                    survey. FEMP developed the&nbsp;
                    <a href="https://www.energy.gov/eere/femp/downloads/water-evaluation-data-tool">
                        Water Evaluation Data Tool
                    </a>
                    &nbsp;to provide a method and general instructions for
                    collecting comprehensive water data during a walk-through
                    survey. The&nbsp;
                    <a href="https://www.energy.gov/sites/prod/files/2018/11/f57/handbook-walk-through-water-survey.pdf">
                        Handbook: Performing a Comprehensive Walk-through Water
                        Survey
                    </a>
                    &nbsp;provides descriptions of data that need to be
                    collected and photos of typical fixtures/data collection
                    methods.
                </Typography>
                <br />
                <Typography variant="h6" gutterBottom>
                    How to Use the Tool
                </Typography>
                <Typography variant="body2" gutterBottom>
                    To create/add a new campus, click the &nbsp;
                    <img src={addButtonIcon} style={imgStyle} /> button on the
                    upper right side of the home screen. Enter the general
                    information including campus name, location, date of
                    walk-through evaluations, and the calendar year of your
                    water supply data. The campus zip code is needed to lookup
                    data for water use calculations. This information must be
                    entered before any other data can be added. Your campus name
                    will now show up on the left-hand side of the screen. Click
                    on your campus name to start entering data.
                </Typography>
                <br />
                <Typography variant="h6" gutterBottom>
                    General Campus Information
                </Typography>
                <Typography variant="body2" gutterBottom>
                    Once the general campus information has been entered and
                    saved, the water supply module along with the water end-use
                    modules can be found on the upper blue bar along the top of
                    the screen. Data can be entered in any order. See the Help
                    document for additional information about each module and
                    the data inputs.
                </Typography>
                <br />
            </Fragment>
        );
    }
}
export default Introduction;
