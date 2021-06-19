// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --

Cypress.Commands.add('login', () => {
  const url = 'http://localhost:3001/auth/signin';
  cy.request({
    method: 'POST',
    url: url,
    body: {
      email: 'cypress-test@gmail.com',
      password: 'password',
    },
  }).then((response) => {
    //string型じゃないとcookieにセットできない
    const expires = String(response.body.expires);
    const jwt = response.body.jwt;
    cy.setCookie('expires', expires);
    cy.setCookie('jwt', jwt);
  });
});
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
