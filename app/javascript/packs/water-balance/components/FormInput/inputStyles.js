const defaultFont = {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    fontWeight: "300",
    lineHeight: "1.5em"
};
const primaryColor = "#9c27b0";
const warningColor = "#ff9800";
const dangerColor = "#f44336";
const successColor = "#4caf50";

const customInputStyle = {
    disabled: {
        "&:before": {
            backgroundColor: "transparent !important"
        }
    },
    underline: {
        "&:hover:not($disabled):before,&:before": {
            borderColor: "#D2D2D2 !important",
            borderWidth: "1px !important"
        },
        "&:after": {
            borderColor: primaryColor
        }
    },
    underlineError: {
        "&:after": {
            borderColor: dangerColor
        }
    },
    underlineSuccess: {
        "&:after": {
            borderColor: successColor
        }
    },
    labelRoot: {
        ...defaultFont,
        color: "#000",
        fontWeight: "400",
        fontSize: "14px",
        lineHeight: "1.42857"
    },
    labelRootError: {
        color: dangerColor
    },
    labelRootSuccess: {
        color: successColor
    },
    labelRootWarning: {
        color: warningColor
    },
    feedback: {
        position: "absolute",
        top: "18px",
        right: "0",
        zIndex: "2",
        display: "block",
        width: "24px",
        height: "24px",
        textAlign: "center",
        pointerEvents: "none"
    },
    marginTop: {
        marginTop: "16px"
    },
    formControl: {
        paddingBottom: "10px",
        margin: "27px 0 0 0",
        position: "relative"
    },
    chips: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    chip: {
        margin: "3px",
    },
};

export default customInputStyle;
