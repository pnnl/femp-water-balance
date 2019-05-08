import React from 'react';
import ReactDOM from 'react-dom';
import Routes from './routes';

document.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(
    <Routes />, document.getElementById('water-balance-react'),
  )
});

if (module.hot) {
  module.hot.accept("./routes", () => {
    console.log("HMR Update!");
    ReactDOM.render(<Routes />, document.getElementById('water-balance-react'))
  })
}
