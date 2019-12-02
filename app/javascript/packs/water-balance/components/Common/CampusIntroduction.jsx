import Typography from '@material-ui/core/Typography';
import React, { Fragment } from 'react';
import checkIcon from 'images/check.png';
import minusIcon from 'images/minus.png';
import sliderActiveIcon from 'images/slider-active.png';
import sliderIcon from 'images/slider.png';
import trashIcon from 'images/trash.png';
import HelpDocument from 'images/Help_Document.pdf';

const imgStyle = {
    verticalAlign: 'middle',
};

const liStyle = {
    padding: '3px 0px',
};

class CampusIntroduction extends React.Component {
    render() {
        return (
            <Fragment>
                <Typography variant="body2" gutterBottom>
                    &nbsp;Click&nbsp;
                    <a href={HelpDocument} target="_blank" download>
                        here
                    </a>
                    &nbsp;to download the full help guide
                </Typography>
                &nbsp;
                <Typography variant="h6" gutterBottom>
                    How to use the tool
                </Typography>
                <Typography variant="body2" gutterBottom>
                    <ul>
                        <li style={liStyle}>
                            Click on the name of the module you would like to
                            enter data
                        </li>
                        <li style={liStyle}>Answer the questions listed</li>
                        <ul>
                            <li style={liStyle}>
                                Units are provided on the right-hand side of the
                                screen
                            </li>
                            <li style={liStyle}>
                                If data entries have constraints (e.g., number
                                of weeks per year of operation (0-52)) that
                                information is provided below the question.
                            </li>
                            <li style={liStyle}>
                                Questions are presented as either fill in the
                                blank or a drop-down menu selection.
                            </li>
                        </ul>
                        <li style={liStyle}>
                            After data is entered, if the question turns green,
                            it means the input is appropriate. If it is red, it
                            is an incorrect data entry. If red entries remain,
                            water use cannot be calculated.
                        </li>
                        <li style={liStyle}>Check boxes</li>
                        <ul>
                            <li style={liStyle}>
                                <img src={minusIcon} style={imgStyle} />A box
                                with a minus means none or no
                            </li>
                            <li style={liStyle}>
                                <img src={checkIcon} style={imgStyle} />
                                Clicking on the box, means yes
                            </li>
                        </ul>
                        <li style={liStyle}> Slider bars</li>
                        <ul>
                            <li style={liStyle}>
                                <img src={sliderIcon} style={imgStyle} />
                                Circle to the left means none or no
                            </li>
                            <li style={liStyle}>
                                <img src={sliderActiveIcon} style={imgStyle} />
                                Circle to the right means yes
                            </li>
                        </ul>
                        <li style={liStyle}>
                            After all the inputs for an end-use have been
                            entered correctly, click on the “Calculate Water
                            Use” button to calculate the estimated water use
                            based on your inputs.
                        </li>
                        <ul>
                            <li style={liStyle}>
                                Water use will not be calculated if either it
                                was not answered or was answered with an
                                incorrect data entry. These questions will
                                appear in red.
                            </li>
                        </ul>
                        <li style={liStyle}>
                            There are two ways to delete an entry
                        </li>
                        <ul>
                            <li style={liStyle}>
                                Slide the circle on a slider bar to the left
                                position
                            </li>
                            <li style={liStyle}>
                                Click on the trash can symbol if available{' '}
                                <img src={trashIcon} style={imgStyle} />
                            </li>
                        </ul>
                        <li style={liStyle}>
                            If you delete an entry, you will need to click the
                            “Calculate Water Use” button again to update the
                            calculation.
                        </li>
                        <li style={liStyle}>
                            To save your inputs, click the “Save” button at the
                            bottom of each of the modules
                        </li>
                        <li style={liStyle}>
                            Always calculate water use and save a module before
                            moving to another module
                        </li>
                        <ul>
                            <li style={liStyle}>
                                The tool does not automatically save inputs or
                                “calculate water use” and data will be lost.
                            </li>
                        </ul>
                    </ul>
                </Typography>
                &nbsp;
                <Typography variant="h6" gutterBottom>
                    Acronym List
                </Typography>
                <Typography variant="body2" gutterBottom>
                    <ul>
                        <li style={liStyle}>kgal – thousand gallons</li>
                        <li style={liStyle}>gal – gallon</li>
                        <li style={liStyle}>gpf – gallons per flush</li>
                        <li style={liStyle}>gpm – gallons per minute</li>
                        <li style={liStyle}>gpv – gallons per vehicle</li>
                        <li style={liStyle}>lbs - pounds</li>
                    </ul>
                </Typography>
            </Fragment>
        );
    }
}
export default CampusIntroduction;
