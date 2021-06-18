describe('Follow Test', () => {
  it('follow test', () => {
    //login
    cy.visit('localhost:3000/account/login');

    cy.get('input[name="email"]')
      .type('cypress-test@gmail.com')
      .should('have.value', 'cypress-test@gmail.com');

    cy.get('input[name="password"]')
      .type('password')
      .should('have.value', 'password');

    cy.get('button[data-test="login-submit"]').click();
    cy.get('[data-test="display-name"]').should('have.text', 'cypress-test');

    //follow test
    cy.get('[data-test="following-num"]').should('contain.text', '0');
    cy.visit('localhost:3000/user/1');
    cy.get('[data-test="follower-num"]').should('contain.text', '0');
    cy.get('[data-test="follow-btn"]').click();
    //follower1
    cy.get('[data-test="follower-num"]').should('contain.text', '1');
    cy.get('[data-test="nav-profile"]').click();
    cy.get('[data-test="display-name"]').should('have.text', 'cypress-test');
    cy.get('[data-test="following-num"]').should('contain.text', '1');

    // cy.get('[data-test="following-num"]').should('contain.text', '1');
  });
});
