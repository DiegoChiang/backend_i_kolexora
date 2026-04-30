const path = require('path');
const { engine } = require('express-handlebars');

const configureHandlebars = (app) => {
  app.engine('handlebars', engine({
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, '..', 'views', 'layouts'),
    partialsDir: path.join(__dirname, '..', 'views', 'partials'),
    helpers: {
      eq: (a, b) => a === b,
      multiply: (a, b) => Number(a) * Number(b),
      formatPrice: (value) => Number(value || 0).toFixed(2),
      isEmpty: (array) => !array || array.length === 0
    }
  }));

  app.set('view engine', 'handlebars');
  app.set('views', path.join(__dirname, '..', 'views'));
};

module.exports = configureHandlebars;
