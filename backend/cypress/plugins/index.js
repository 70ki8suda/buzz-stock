/**
 * @type {Cypress.PluginConfig}
 */
const { exec } = require('child_process');
// eslint-disable-next-line no-unused-vars
module.exports = (on, config) => {
  on('task', {
    'shell:test': () => {
      cy.exec('echo TEST');
    },
  });
};
