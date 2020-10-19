import React from 'react';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';
import { linkStyle } from './sharedStyles';

export default function Handbook(props) {
  return (
    <Typography variant='body2' gutterBottom style={props.style}>
      See the section on "{props.sectionName}" in the{' '}
      <Link style={linkStyle} href='/femp-water-balance-help-2020.pdf' target='_blank' download>
        help guide
      </Link>{' '}
      for additional information and photos.
    </Typography>
  );
}
