import React from "react";
import PropTypes from "prop-types";
import withStyles from "@material-ui/core/styles/withStyles";
import {
  ListItem,
  List
 } from "@material-ui/core";

import footerStyles from "./styles";

function Footer({ ...props }) {
    const { classes } = props;
    return (
      <footer className={classes.footer}>
        <div className={classes.container}>
          <div className={classes.left}>
            <List className={classes.list}>
              <ListItem className={classes.inlineBlock}>
                AssetScore<span className={classes.titleO}>@PNNL</span>::Water Balance
              </ListItem>
              <ListItem className={classes.inlineBlock}>
                <a href="//www.pnnl.gov/important-notices" className={classes.block}>Terms</a>
              </ListItem>
              <ListItem className={classes.inlineBlock}>
                <a href="//www.pnnl.gov/security-privacy" className={classes.block}>Privacy</a>
              </ListItem>
              <ListItem className={classes.inlineBlock}>
                <a href="mailto:asset-score@pnnl.gov" className={classes.block}>
                  Contact Us
                </a>
              </ListItem>
            </List>
            <p className={classes.right}>
              <span>
                <a href="//www.pnnl.gov/" className={classes.a}>
                  Pacific Northwest National Laboratory
                </a>
              </span>
            </p>
          </div>
        </div>
      </footer>
    );
}

Footer.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(footerStyles)(Footer);
