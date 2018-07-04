import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './components/App/index';
import registerServiceWorker from './registerServiceWorker';
import injectTapEventPlugin from 'react-tap-event-plugin';

// Needed for onClick
// http://stackoverflow.com/a/34015469/988941
injectTapEventPlugin();

ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
