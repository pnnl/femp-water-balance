import React from 'react';
import CampusIntroduction from './Tabs/LandingPage/CampusIntroduction';
import CloseIcon from '@material-ui/icons/Close';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';

class HelpDialog extends React.Component {
    state = {
        introOpen: true,
    };

    handleClose = () => {
        this.setState({ introOpen: false });
    };
    render() {
        return (
            <Dialog
                open={introOpen}
                onClose={this.handleClose}
                aria-labelledby="form-dialog-title"
            >
                <DialogTitle id="form-dialog-title">
                    Help
                    <CloseIcon
                        color="action"
                        onClick={this.handleClose}
                        style={{ float: 'right', cursor: 'pointer'}}
                    />
                </DialogTitle>
                <DialogContent>
                    <CampusIntroduction />
                </DialogContent>
            </Dialog>
        );
    }
}

export default HelpDialog;
