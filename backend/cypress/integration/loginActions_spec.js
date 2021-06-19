describe('LogIn User Actions Test', () => {
  it('login test', () => {
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
  });
  it('follow test', () => {
    //follow test
    //cy.login();
    cy.get('[data-test="following-num"]').should('contain.text', '0');
    cy.visit('localhost:3000/user/1');
    cy.get('[data-test="follower-num"]').should('contain.text', '0');
    cy.get('[data-test="follow-btn"]').click();
    //follower1
    cy.get('[data-test="follower-num"]').should('contain.text', '1');
    //back to profilepage
    cy.get('[data-test="nav-profile"]').click();
    cy.get('[data-test="display-name"]').should('have.text', 'cypress-test');
    cy.get('[data-test="following-num"]').should('contain.text', '1');
  });
  it('unfollow test', () => {
    //unfollow test
    cy.visit('localhost:3000/user/1');
    cy.get('[data-test="unfollow-btn"]').click();
    cy.get('[data-test="follower-num"]').should('contain.text', '0');
    //back to profile
    cy.get('[data-test="nav-profile"]').click();
    cy.get('[data-test="display-name"]').should('have.text', 'cypress-test');
    cy.get('[data-test="following-num"]').should('contain.text', '0');
  });
  it('post tweet test', () => {
    //post tweet test
    cy.get('[data-test="tweet-content-input"]')
      .type('test tweet from cypress')
      .should('have.value', 'test tweet from cypress');

    cy.get('[data-test="post-tweet-btn-pc"]').click();

    cy.get('[data-test="tweet-item"]')
      .first()
      .find('[data-test="tweet-item-content"]')
      .should('have.text', 'test tweet from cypress');
  });
  it('delete tweet test', () => {
    //post tweet test
    cy.get('[data-test="tweet-item"]')
      .first()
      .find('[data-test="tweet-delete-btn"]')
      .click();
    cy.get('[data-test="tweet-item"]').should('have.length', 0);
  });

  it('favorite tweet test', () => {
    //post tweet test
    cy.visit('localhost:3000/user/1');
    cy.get('[data-test="tweet-item"]')
      .first()
      .find('[data-test="tweet-fav-button"]')
      .click();
    cy.get('[data-test="tweet-item"]')
      .first()
      .find('[data-test="tweet-fav-num"]')
      .should('have.text', '1');
    cy.reload()
      .get('[data-test="tweet-item"]')
      .first()
      .find('[data-test="tweet-fav-num"]')
      .should('have.text', '1');
  });
  it('unfavorite tweet test', () => {
    //post tweet test
    cy.get('[data-test="tweet-item"]')
      .first()
      .find('[data-test="tweet-fav-num"]')
      .should('have.text', '1');
    cy.get('[data-test="tweet-item"]')
      .first()
      .find('[data-test="tweet-fav-button"]')
      .click();
    cy.get('[data-test="tweet-item"]')
      .first()
      .find('[data-test="tweet-fav-num"]')
      .should('have.text', '0');
    cy.reload()
      .get('[data-test="tweet-item"]')
      .first()
      .find('[data-test="tweet-fav-num"]')
      .should('have.text', '0');
  });

  it('post tweet with ticker test', () => {
    cy.get('[data-test="nav-profile"]').click();
    cy.get('[data-test="display-name"]').should('have.text', 'cypress-test');
    cy.get('[data-test="tweet-content-input"]').type(
      'post tweet with ticker test',
    );

    cy.get('[data-test="tweet-ticker-input"]').type('ap');
    cy.get('[data-test="ticker-option-item"]').contains('AAPL').click();
    cy.get('[data-test="post-tweet-btn-pc"]').click();

    cy.get('[data-test="tweet-item"]')
      .first()
      .find('[data-test="tweet-item-content"]')
      .should('have.text', 'post tweet with ticker test');
    cy.get('[data-test="tweet-item"]')
      .first()
      .find('[data-test="tweet-ticker"]')
      .should('have.text', '#AAPL');
  });
});
