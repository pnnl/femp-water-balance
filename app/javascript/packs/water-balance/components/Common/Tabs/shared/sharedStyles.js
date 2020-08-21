import createNumberMask from 'text-mask-addons/dist/createNumberMask';

export const fabStyle = {
  opacity: '.65',
  position: 'fixed',
  bottom: '11px',
  right: '104px',
  zIndex: '10000',
  backgroundColor: 'rgb(220, 0, 78)',
  borderRadius: '11px',
  padding: '9px',
  width: 'fit-content',
  '&:hover': {
    opacity: '1',
  },
};

export const noShadow = {
  boxShadow: 'none',
};

export function mediaQuery() {
  return window.matchMedia('(max-width: 1265px)').matches ? {width: '100%', marginLeft: '0px'}: expansionPanel;
}

export function reportsMediaQuery() {
  return window.matchMedia('(max-width: 1265px)').matches ? 12 : 4;
}

export const expansionDetails = {
  marginTop: '0px',
  paddingTop: '0px',
};

export const noPadding = {
  padding: '0px',
};

export const expansionPanel = {
  width: '65%', 
  marginLeft: '2.5%'
}

export const DEFAULT_NUMBER_MASK = createNumberMask({
  prefix: '',
  includeThousandsSeparator: true,
  integerLimit: 10,
  allowDecimal: false,
});

export const DEFAULT_DECIMAL_MASK = createNumberMask({
  prefix: '',
  includeThousandsSeparator: true,
  integerLimit: 10,
  allowDecimal: true,
});

export const ONE_DECIMAL_MASK = createNumberMask({
  prefix: '',
  includeThousandsSeparator: true,
  integerLimit: 10,
  allowDecimal: true,
  decimalLimit: 1,
});

export const numberFormat = new Intl.NumberFormat('en-US', {maximumFractionDigits: 1, minimumFractionDigits: 1});
