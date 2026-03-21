package com.salesforce.tests;

import com.salesforce.base.BaseTest;
import com.salesforce.pages.LoginPage;
import org.testng.Assert;
import org.testng.annotations.Test;

public class LoginTest extends BaseTest {

    @Test(priority = 1, description = "Verify that a user cannot login with invalid credentials")
    public void verifyInvalidLogin() {
        try {
            LoginPage loginPage = new LoginPage(driver);
            loginPage.doLogin("invalidUser@salesforce.com", "WrongPassword123!");
            
            String actualError = loginPage.getErrorMessage();
            Assert.assertNotNull(actualError, "Error message should be displayed for invalid credentials.");
            
            // Standard Salesforce error partial text
            Assert.assertTrue(actualError.contains("check your username and password") || actualError.contains("Please check your username and password"), "Unexpected error message text returned.");
        } catch (Exception e) {
            Assert.fail("Test encountered an exception during invalid login execution: " + e.getMessage());
        }
    }

    @Test(priority = 2, description = "Verify that a user can execute the login flow with valid credentials")
    public void verifyValidLogin() {
        try {
            LoginPage loginPage = new LoginPage(driver);
            // Replace with actual execution metrics or assertions once valid accounts are mapped
            loginPage.doLogin("validUser@salesforce.com", "CorrectPassword123!");

            // Normally Assertions are tied to the redirection URL or Dashboard WebElements here
        } catch (Exception e) {
            Assert.fail("Test encountered an exception during valid login execution: " + e.getMessage());
        }
    }
}
