describe('Auth Test', () => {
  it('sign up test', () => {
    cy.exec('npx prisma migrate reset --force ');
    cy.visit('localhost:3000/account/signup');

    //visit singup page
    cy.contains('Sign Up').click();
    cy.url().should('include', '/account/signup');

    //input sign up info
    cy.get('input[name="name"]')
      .type('cypress-test')
      .should('have.value', 'cypress-test');

    cy.get('input[name="display_id"]')
      .type('cypress_test')
      .should('have.value', 'cypress_test');

    cy.get('input[name="email"]')
      .type('cypress-test@gmail.com')
      .should('have.value', 'cypress-test@gmail.com');

    cy.get('input[name="password"]')
      .type('password')
      .should('have.value', 'password');

    cy.get('button[data-test="signUp-submit"]').click();

    cy.url().should('contain', '/user/');
    cy.get('[data-test="display-name"]').should('have.text', 'cypress-test');
  });

  it('sign up same user and fail', () => {
    cy.visit('localhost:3000/account/signup');

    //visit singup page
    cy.contains('Sign Up').click();
    cy.url().should('include', '/account/signup');

    //input sign up info
    cy.get('input[name="name"]')
      .type('cypress-test')
      .should('have.value', 'cypress-test');

    cy.get('input[name="display_id"]')
      .type('cypress_test')
      .should('have.value', 'cypress_test');

    cy.get('input[name="email"]')
      .type('cypress-test@gmail.com')
      .should('have.value', 'cypress-test@gmail.com');

    cy.get('input[name="password"]')
      .type('password')
      .should('have.value', 'password');

    cy.get('button[data-test="signUp-submit"]').click();

    cy.contains('EmailかIDが既に使われています');
  });
});
