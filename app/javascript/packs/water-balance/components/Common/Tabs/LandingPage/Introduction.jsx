import Typography from '@material-ui/core/Typography';
import React, {Fragment} from 'react';
import MobileStepper from '@material-ui/core/MobileStepper';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import {Grid, Button} from '@material-ui/core';
import {Welcome, EndUses, Results, DataCollection, ToolInstructions, GeneralCampusInformation} from './Welcome';

function getStepContent(stepIndex) {
  switch (stepIndex) {
    case 0:
      return <Welcome />;
    case 1:
      return <EndUses />;
    case 2:
      return <Results />;
    case 3:
      return <DataCollection />;
    case 4:
      return <ToolInstructions />;
    case 5:
      return <GeneralCampusInformation />;
    default:
      return 'Invalid Index';
  }
}

const tutorialSteps = [
  'Welcome to the Water Balance Tool',
  'Water End Uses',
  'Water Balance Results',
  'Data Collection',
  'How to Use the Tool',
  'General Campus Information',
];

export default function Introduction() {
  const [activeStep, setActiveStep] = React.useState(0);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  return (
    <Fragment>
      <Grid container>
        <Grid item xs={12}>
          <div style={{width: '80%', margin: 'auto'}}>
            <div style={{margin: '10px 2px'}}>
              <Typography gutterBottom style={{paddingTop: '28px', color: '#005E84'}} variant='h5'>
                {tutorialSteps[activeStep]}
              </Typography>
              <Typography variant='body1' gutterBottom style={{height: '150px', overflow: 'auto', marginTop: '5px'}}>
                {getStepContent(activeStep)}
              </Typography>
            </div>
          </div>
        </Grid>
      </Grid>
      <MobileStepper
        style={{margin: 'auto', padding: '0px', background: 'white'}}
        variant='dots'
        steps={6}
        position='static'
        activeStep={activeStep}
        nextButton={
          <Button size='small' onClick={handleNext} disabled={activeStep === 5}>
            Next
            <KeyboardArrowRight />
          </Button>
        }
        backButton={
          <Button size='small' onClick={handleBack} disabled={activeStep === 0}>
            <KeyboardArrowLeft />
            Back
          </Button>
        }
      />
    </Fragment>
  );
}
