package com.medimeal.tests;

import com.medimeal.base.BaseTest;
import com.medimeal.pages.DashboardPage;
import com.medimeal.pages.HomePage;
import com.medimeal.pages.LoginPage;
import org.testng.Assert;
import org.testng.annotations.Test;

public class PatientLoginTest extends BaseTest {

    @Test(priority = 3, description = "Test Patient Login Flow: Home -> Login -> Dashboard -> Logout")
    public void testPatientLoginFlow() throws InterruptedException {
        // Step 1: Navigate to Home Page
        navigateToHomePage();
        HomePage homePage = new HomePage(driver);
        Assert.assertTrue(homePage.isHomePageDisplayed(), "Home page is not displayed");
        System.out.println("✓ Home page loaded successfully");

        // Step 2: Click Login button
        homePage.clickLogin();
        Thread.sleep(1000);

        // Step 3: Enter Patient credentials
        LoginPage loginPage = new LoginPage(driver);
        Assert.assertTrue(loginPage.isLoginPageDisplayed(), "Login page is not displayed");
        System.out.println("✓ Login page loaded successfully");

        String patientEmail = config.getProperty("patient.email");
        String patientPassword = config.getProperty("patient.password");
        
        loginPage.login(patientEmail, patientPassword);
        System.out.println("✓ Patient credentials entered: " + patientEmail);
        Thread.sleep(2000);

        // Step 4: Verify Dashboard is displayed
        DashboardPage dashboardPage = new DashboardPage(driver);
        Assert.assertTrue(dashboardPage.isDashboardDisplayed(), "Patient dashboard is not displayed");
        System.out.println("✓ Patient dashboard loaded successfully");
        Thread.sleep(2000);

        // Step 5: Logout
        dashboardPage.clickLogout();
        System.out.println("✓ Patient logged out successfully");
        Thread.sleep(1000);

        System.out.println("\n✅ PATIENT LOGIN TEST PASSED - Complete flow executed successfully");
    }
}
